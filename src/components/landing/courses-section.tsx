import Link from "next/link";
import { Clock, Users, Star, BookOpen } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import type { SalesContent, CourseData } from "@/lib/homepage-data";

const defaultCourses: CourseData[] = [
  { id: "basic-english", title: "Basic English for Beginners", slug: "basic-english", description: "Mulai dari nol! Pelajari dasar-dasar grammar, vocabulary, dan percakapan sehari-hari.", price: 149000, thumbnailUrl: null, isPublished: true },
  { id: "speaking-mastery", title: "Speaking Mastery", slug: "speaking-mastery", description: "Tingkatkan kemampuan speaking-mu dengan latihan pronunciation, intonasi, dan fluency.", price: 199000, thumbnailUrl: null, isPublished: true },
  { id: "grammar-intensive", title: "Grammar Intensive", slug: "grammar-intensive", description: "Kuasai 16 tenses, conditional sentences, passive voice, dan semua grammar penting.", price: 179000, thumbnailUrl: null, isPublished: true },
];

export function CoursesSection({ courses, sectionData }: { courses: CourseData[]; sectionData: SalesContent | null }) {
  const items = courses.length > 0 ? courses : defaultCourses;
  const title = sectionData?.title || "Katalog Kelas";
  const subtitle = sectionData?.subtitle || "Pilih kelas yang sesuai dengan kebutuhanmu. Semua kelas bisa diakses kapan saja dan di mana saja.";

  return (
    <section id="courses" className="py-16 md:py-20 bg-surface">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
            {title}
          </h2>
          <p className="text-text-muted text-lg">
            {subtitle}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((course) => (
            <div key={course.id} className="card group overflow-hidden flex flex-col">
              <div className="h-44 bg-gradient-to-br from-primary/20 to-primary-light/20 flex items-center justify-center">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="w-12 h-12 text-primary/40" />
                )}
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-lg text-text mb-1 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed mb-4 flex-1">
                  {course.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">
                    {formatRupiah(course.price)}
                  </span>
                  <Link href={`/checkout/${course.slug}`} className="btn-primary text-sm py-2 px-4">
                    Beli Sekarang
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
