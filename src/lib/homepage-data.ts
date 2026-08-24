import { supabase } from "@/lib/db";

export interface SalesContent {
  id: string;
  section: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  imageUrl: string | null;
  order: number;
}

export interface TestimonialData {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
  isApproved: boolean;
}

export interface CourseData {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  thumbnailUrl: string | null;
  isPublished: boolean;
}

export interface HomePageData {
  hero: SalesContent | null;
  about: SalesContent | null;
  courses: SalesContent | null;
  testimonials: SalesContent | null;
  cta: SalesContent | null;
  footer: SalesContent | null;
  testimonialItems: TestimonialData[];
  courseItems: CourseData[];
}

export async function getHomePageData(): Promise<HomePageData> {
  // Fetch all sales page content
  const { data: contents } = await supabase
    .from("SalesPageContent")
    .select("*")
    .order("order", { ascending: true });

  const hero = contents?.find((c: SalesContent) => c.section === "hero") || null;
  const about = contents?.find((c: SalesContent) => c.section === "about") || null;
  const courses = contents?.find((c: SalesContent) => c.section === "courses") || null;
  const testimonials = contents?.find((c: SalesContent) => c.section === "testimonials") || null;
  const cta = contents?.find((c: SalesContent) => c.section === "cta") || null;
  const footer = contents?.find((c: SalesContent) => c.section === "footer") || null;

  // Fetch approved testimonials
  const { data: testimonialItems } = await supabase
    .from("Testimonial")
    .select("*")
    .eq("isApproved", true)
    .order("createdAt", { ascending: false });

  // Fetch published courses
  const { data: courseItems } = await supabase
    .from("Course")
    .select("*")
    .eq("isPublished", true)
    .order("createdAt", { ascending: true });

  return {
    hero,
    about,
    courses,
    testimonials,
    cta,
    footer,
    testimonialItems: testimonialItems || [],
    courseItems: courseItems || [],
  };
}
