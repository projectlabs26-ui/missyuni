export const dynamic = "force-dynamic";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { CoursesSection } from "@/components/landing/courses-section";
import { AboutSection } from "@/components/landing/about-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { CTASection } from "@/components/landing/cta-section";
import { getHomePageData } from "@/lib/homepage-data";

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection data={data.hero} />
        <AboutSection data={data.about} />
        <CoursesSection courses={data.courses} />
        <TestimonialsSection testimonials={data.testimonials} />
        <CTASection data={data.cta} />
      </main>
      <Footer />
    </>
  );
}