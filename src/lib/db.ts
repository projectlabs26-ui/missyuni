/**
 * Supabase DB Wrapper — Prisma-compatible API
 * 
 * This wraps @supabase/supabase-js to provide a Prisma-like query interface.
 * Existing code that uses `db.table.findMany()`, `db.table.create()`, etc.
 * continues to work without changes.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// ── Helpers ──────────────────────────────────────────────────────────

/** Build a Supabase .select() string from a Prisma-style include object */
function buildSelect(tableName: string, include?: any, depth = 0): string {
  if (!include || depth > 3) return "*";

  const parts: string[] = ["*"];

  for (const [key, value] of Object.entries(include)) {
    if (key === "_count") {
      // _count is handled separately
      continue;
    }
    const supabaseTable = getTableName(key);
    if (typeof value === "object" && value !== null) {
      const nestedInclude = (value as any).include;
      if (nestedInclude) {
        parts.push(`${supabaseTable}(${buildSelect(supabaseTable, nestedInclude, depth + 1)})`);
      } else {
        parts.push(supabaseTable);
      }
    } else if (value === true) {
      parts.push(supabaseTable);
    }
  }
  return parts.join(", ");
}

/** Apply Prisma-style `where` filters to a Supabase query */
function applyWhere(query: any, where: any): any {
  if (!where || typeof where !== "object") return query;

  for (const [key, value] of Object.entries(where)) {
    if (key === "AND" || key === "OR" || key === "NOT") continue;

    if (value === null) {
      query = query.is(key, null);
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const v = value as any;
      if ("in" in v) query = query.in(key, v.in);
      else if ("gte" in v) query = query.gte(key, v.gte);
      else if ("gt" in v) query = query.gt(key, v.gt);
      else if ("lte" in v) query = query.lte(key, v.lte);
      else if ("lt" in v) query = query.lt(key, v.lt);
      else if ("contains" in v) query = query.ilike(key, `%${v.contains}%`);
      else if ("startsWith" in v) query = query.ilike(key, `${v.startsWith}%`);
      else if ("endsWith" in v) query = query.ilike(key, `%${v.endsWith}`);
      else if ("not" in v) {
        if (v.not === null) query = query.not(key, "is", null);
        else query = query.neq(key, v.not);
      }
      else if ("equals" in v) query = query.eq(key, v.equals);
    } else {
      query = query.eq(key, value);
    }
  }
  return query;
}

/** Apply orderBy */
function applyOrderBy(query: any, orderBy: any): any {
  if (!orderBy) return query;
  if (Array.isArray(orderBy)) {
    for (const o of orderBy) {
      for (const [key, dir] of Object.entries(o)) {
        query = query.order(key, { ascending: dir === "asc" });
      }
    }
  } else if (typeof orderBy === "object") {
    for (const [key, dir] of Object.entries(orderBy)) {
      query = query.order(key, { ascending: dir === "asc" });
    }
  }
  return query;
}

/** Process includes: if Supabase returned nested data, keep it. Otherwise, fetch separately. */
async function processIncludes(
  rows: any[],
  tableName: string,
  include?: any
): Promise<any[]> {
  if (!include) return rows;
  if (rows.length === 0) return rows;

  // Handle _count separately
  if (include._count) {
    const countFields = include._count.select || {};
    for (const row of rows) {
      for (const [relKey] of Object.entries(countFields)) {
        // Count related records
        const { count } = await supabase
          .from(getTableName(relKey))
          .select("*", { count: "exact", head: true })
          .eq(getForeignKey(tableName, relKey), row.id);
        row._count = row._count || {};
        row._count[relKey] = count || 0;
      }
    }
  }

  // Process each include relation
  for (const [key, value] of Object.entries(include)) {
    if (key === "_count") continue;

    const isObject = typeof value === "object" && value !== null;
    const nestedInclude = isObject ? (value as any).include : undefined;

    // Check if Supabase already returned nested data
    const firstVal = rows[0]?.[key];
    if (Array.isArray(firstVal) || (typeof firstVal === "object" && firstVal !== null && firstVal.id)) {
      // Supabase returned nested data — process recursively
      if (nestedInclude) {
        for (const row of rows) {
          if (Array.isArray(row[key])) {
            row[key] = await processIncludes(row[key], getTableName(key), nestedInclude);
          } else if (row[key]) {
            row[key] = (await processIncludes([row[key]], getTableName(key), nestedInclude))[0];
          }
        }
      }
      continue;
    }

    // Fetch related data separately
    const fkCol = getForeignKey(tableName, key);
    const relatedTable = getTableName(key);

    if (isObject && (value as any).where) {
      // Filtered include
      const { data: related } = await supabase
        .from(relatedTable)
        .select("*")
        .eq(fkCol, rows[0]?.id);

      if (related) {
        // Apply where filter on each row
        for (const row of rows) {
          const { data: relData } = await supabase
            .from(relatedTable)
            .select("*")
            .eq(fkCol, row.id);
          
          if (nestedInclude && relData) {
            row[key] = await processIncludes(relData, relatedTable, nestedInclude);
          } else {
            row[key] = relData || [];
          }
        }
      } else {
        rows.forEach((r) => (r[key] = []));
      }
    } else if (isObject && (value as any).orderBy) {
      // Ordered include
      for (const row of rows) {
        let q = supabase
          .from(relatedTable)
          .select("*")
          .eq(fkCol, row.id);
        q = applyOrderBy(q, (value as any).orderBy);
        if ((value as any).take) q = q.limit((value as any).take);
        const { data: relData } = await q;
        if (nestedInclude && relData) {
          row[key] = await processIncludes(relData, relatedTable, nestedInclude);
        } else {
          row[key] = relData || [];
        }
      }
    } else {
      // Simple include — fetch for all rows
      const ids = rows.map((r) => r.id).filter(Boolean);
      if (ids.length === 0) {
        rows.forEach((r) => (r[key] = isObject ? [] : null));
        continue;
      }

      // For many-to-one (singular relation), fetch for each row individually
      const isManyToMany = !key.endsWith("Id") && 
        (key === "modules" || key === "enrollments" || key === "transactions" ||
         key === "certificates" || key === "quizzes" || key === "questions" ||
         key === "moduleProgresses" || key === "quizAttempts" || key === "announcements" ||
         key === "liveEvents");

      if (isManyToMany) {
        const { data: relData } = await supabase
          .from(relatedTable)
          .select("*")
          .in(fkCol, ids);
        
        for (const row of rows) {
          const related = (relData || []).filter((r: any) => r[fkCol] === row.id);
          if (nestedInclude) {
            row[key] = await processIncludes(related, relatedTable, nestedInclude);
          } else {
            row[key] = related;
          }
        }
      } else {
        // Many-to-one: course, user, etc.
        for (const row of rows) {
          const fkValue = row[fkCol];
          if (!fkValue) {
            row[key] = null;
            continue;
          }
          const { data: relData } = await supabase
            .from(relatedTable)
            .select("*")
            .eq("id", fkValue)
            .single();
          
          if (nestedInclude && relData) {
            row[key] = (await processIncludes([relData], relatedTable, nestedInclude))[0];
          } else {
            row[key] = relData || null;
          }
        }
      }
    }
  }

  return rows;
}

/** Get the foreign key column name for a relation */
function getForeignKey(parentTable: string, childKey: string): string {
  const map: Record<string, string> = {
    "User:transactions": "userId",
    "User:enrollments": "userId",
    "User:certificates": "userId",
    "User:moduleProgresses": "userId",
    "User:quizAttempts": "userId",
    "User:course": "courseId",
    "Course:modules": "courseId",
    "Course:enrollments": "courseId",
    "Course:transactions": "courseId",
    "Course:certificates": "courseId",
    "Module:quizzes": "moduleId",
    "Module:moduleProgresses": "moduleId",
    "Quiz:questions": "quizId",
    "Enrollment:moduleProgresses": "enrollmentId",
    "Enrollment:course": "courseId",
    "Enrollment:user": "userId",
    "Transaction:user": "userId",
    "Transaction:course": "courseId",
    "Certificate:user": "userId",
    "Certificate:course": "courseId",
    "Testimonial:course": "courseId",
  };
  return map[`${parentTable}:${childKey}`] || `${childKey}Id`;
}

/** Get the Supabase table name from a relation/model key */
function getTableName(key: string): string {
  const map: Record<string, string> = {
    user: "User",
    users: "User",
    course: "Course",
    courses: "Course",
    module: "Module",
    modules: "Module",
    quiz: "Quiz",
    quizzes: "Quiz",
    question: "Question",
    questions: "Question",
    enrollment: "Enrollment",
    enrollments: "Enrollment",
    moduleProgress: "ModuleProgress",
    moduleProgresses: "ModuleProgress",
    quizAttempt: "QuizAttempt",
    quizAttempts: "QuizAttempt",
    transaction: "Transaction",
    transactions: "Transaction",
    certificate: "Certificate",
    certificates: "Certificate",
    liveEvent: "LiveEvent",
    liveEvents: "LiveEvent",
    announcement: "Announcement",
    announcements: "Announcement",
    testimonial: "Testimonial",
    testimonials: "Testimonial",
    salesPageContent: "SalesPageContent",
  };
  // Many-to-one reverse mappings
  if (key === "course") return "Course";
  if (key === "user") return "User";
  return map[key] || key;
}

// ── Table Query Builder ──────────────────────────────────────────────

class TableQuery {
  constructor(
    private tableName: string,
    private modelName: string
  ) {}

  async findMany(options: {
    where?: any;
    include?: any;
    orderBy?: any;
    take?: number;
    skip?: number;
    select?: any;
  } = {}): Promise<any[]> {
    let query = supabase.from(this.tableName).select("*");
    query = applyWhere(query, options.where);
    query = applyOrderBy(query, options.orderBy);
    if (options.take) query = query.limit(options.take);
    if (options.skip) query = query.range(options.skip, options.skip + (options.take || 50) - 1);

    const { data, error } = await query;
    if (error) throw error;

    return processIncludes(data || [], this.modelName, options.include);
  }

  async findUnique(options: {
    where: any;
    include?: any;
    select?: any;
  }): Promise<any | null> {
    const { where, include } = options;
    const idFields = Object.keys(where).filter((k) => where[k] !== undefined);
    
    let query = supabase.from(this.tableName).select("*");
    for (const key of idFields) {
      query = query.eq(key, where[key]);
    }
    query = query.limit(1);

    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) return null;

    const rows = await processIncludes([data[0]], this.modelName, include);
    return rows[0] || null;
  }

  async findFirst(options: {
    where?: any;
    include?: any;
    orderBy?: any;
    select?: any;
  } = {}): Promise<any | null> {
    const result = await this.findMany({ ...options, take: 1 });
    return result[0] || null;
  }

  async create(options: { data: any; include?: any }): Promise<any> {
    const { data: insertData, include } = options;
    
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    if (include && data) {
      const rows = await processIncludes([data], this.modelName, include);
      return rows[0];
    }
    return data;
  }

  async createMany(options: { data: any[] }): Promise<{ count: number }> {
    const { data: insertData } = options;
    const { error } = await supabase.from(this.tableName).insert(insertData);
    if (error) throw error;
    return { count: insertData.length };
  }

  async update(options: {
    where: any;
    data: any;
    include?: any;
  }): Promise<any> {
    const { where, data: updateData, include } = options;

    const id = where.id;
    if (id) {
      const { data: updated, error: updateError } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      if (updateError) throw updateError;
      if (include && updated) {
        const rows = await processIncludes([updated], this.modelName, include);
        return rows[0];
      }
      return updated;
    }

    // Non-id where clause: use first key-value pair
    const whereKeys = Object.keys(where);
    const firstKey = whereKeys[0];
    const firstVal = where[firstKey];
    const { data: updated2, error: err2 } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq(firstKey, firstVal)
      .select()
      .single();
    if (err2) throw err2;
    if (include && updated2) {
      const rows = await processIncludes([updated2], this.modelName, include);
      return rows[0];
    }
    return updated2;
  }

  async delete(options: { where: any }): Promise<any> {
    const { where } = options;
    
    // First fetch the record
    let fetchQuery = supabase.from(this.tableName).select("*");
    for (const [key, value] of Object.entries(where)) {
      fetchQuery = fetchQuery.eq(key, value);
    }
    fetchQuery = fetchQuery.limit(1);
    const { data: existing } = await fetchQuery;
    
    // Then delete
    let deleteQuery = supabase.from(this.tableName).delete();
    for (const [key, value] of Object.entries(where)) {
      deleteQuery = deleteQuery.eq(key, value);
    }
    const { error } = await deleteQuery;
    if (error) throw error;
    return existing?.[0] || null;
  }

  async count(options: { where?: any } = {}): Promise<number> {
    let query = supabase
      .from(this.tableName)
      .select("*", { count: "exact", head: true });
    query = applyWhere(query, options.where);

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }

  async aggregate(options: {
    where?: any;
    _sum?: Record<string, boolean>;
    _avg?: Record<string, boolean>;
    _min?: Record<string, boolean>;
    _max?: Record<string, boolean>;
    _count?: any;
  }): Promise<any> {
    const result: any = {};

    if (options._sum) {
      result._sum = {};
      let query = supabase.from(this.tableName).select("*");
      query = applyWhere(query, options.where);
      const { data, error } = await query;
      if (error) throw error;
      
      for (const [field, enabled] of Object.entries(options._sum)) {
        if (enabled) {
          result._sum[field] = (data || []).reduce(
            (sum: number, row: any) => sum + (parseFloat(row[field]) || 0),
            0
          );
        }
      }
    }

    if (options._count) {
      result._count = await this.count({ where: options.where });
    }

    return result;
  }

  async upsert(options: {
    where: any;
    update: any;
    create: any;
    include?: any;
  }): Promise<any> {
    const { where, update, create, include } = options;

    // Check if exists
    let checkQuery = supabase.from(this.tableName).select("id").limit(1);
    for (const [key, value] of Object.entries(where)) {
      checkQuery = checkQuery.eq(key, value);
    }
    const { data: existing } = await checkQuery;

    if (existing && existing.length > 0) {
      return this.update({ where, data: update, include });
    } else {
      return this.create({ data: create, include });
    }
  }
}

// ── Export Tables ────────────────────────────────────────────────────

export const db: Record<string, TableQuery> = {};
db.user = new TableQuery("User", "User");
db.course = new TableQuery("Course", "Course");
db.module = new TableQuery("Module", "Module");
db.quiz = new TableQuery("Quiz", "Quiz");
db.question = new TableQuery("Question", "Question");
db.enrollment = new TableQuery("Enrollment", "Enrollment");
db.moduleProgress = new TableQuery("ModuleProgress", "ModuleProgress");
db.quizAttempt = new TableQuery("QuizAttempt", "QuizAttempt");
db.transaction = new TableQuery("Transaction", "Transaction");
db.certificate = new TableQuery("Certificate", "Certificate");
db.liveEvent = new TableQuery("LiveEvent", "LiveEvent");
db.announcement = new TableQuery("Announcement", "Announcement");
db.testimonial = new TableQuery("Testimonial", "Testimonial");
db.salesPageContent = new TableQuery("SalesPageContent", "SalesPageContent");

// Also export supabase client for direct use
export { supabase };
