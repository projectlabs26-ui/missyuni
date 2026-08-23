import { Heart, Target, Sparkles, Shield, LucideIcon } from "lucide-react";
import type { SalesContent } from "@/lib/homepage-data";

const iconMap: Record<string, LucideIcon> = {
  Target, Sparkles, Heart, Shield,
  BookOpen: Heart, Star: Sparkles, Award: Shield,
};

const defaultFeatures = [
  { icon: "Target", title: "Metode Terstruktur", desc: "Kurikulum disusun sistematis dari basic hingga advanced, cocok untuk semua level." },
  { icon: "Sparkles", title: "Interaktif & Fun", desc: "Video, audio, kuis, dan latihan listening yang bikin belajar tidak membosankan." },
  { icon: "Heart", title: "Personal Approach", desc: "Miss Yuni mengajar dengan pendekatan personal, sabar, dan mudah dipahami." },
  { icon: "Shield", title: "Sertifikat Resmi", desc: "Dapatkan sertifikat digital otomatis setelah menyelesaikan kelas dan lulus kuis." },
];

const defaultTitle = "Kenapa Belajar di Missyuni?";
const defaultSubtitle = "Kami hadir untuk membantu kamu menguasai Bahasa Inggris dengan cara yang mudah, menyenangkan, dan terjangkau.";

export function AboutSection({ data }: { data: SalesContent | null }) {
  let features = defaultFeatures;
  if (data?.body) {
    try { features = JSON.parse(data.body); } catch { /* use default */ }
  }

  const title = data?.title || defaultTitle;
  const subtitle = data?.subtitle || defaultSubtitle;

  return (
    <section id="about" className="py-16 md:py-20 bg-white">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
            {title}
          </h2>
          <p className="text-text-muted text-lg">{subtitle}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f: { icon: string; title: string; desc: string }, i: number) => {
            const Icon = iconMap[f.icon] || Target;
            return (
              <div key={i} className="card p-6 text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-text mb-2">{f.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}