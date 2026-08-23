import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-surface-dark text-white mt-auto">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-3">
              <img src="/logomissyuni.png" alt="Missyuni" className="w-8 h-8 rounded-lg object-contain" />
              <span>Missyuni</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Platform belajar Bahasa Inggris online bersama Miss Yuni. 
              Materi interaktif, video, kuis, dan sertifikat digital.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Menu</h4>
            <div className="flex flex-col gap-2 text-gray-400 text-sm">
              <Link href="/#courses" className="hover:text-white transition-colors">Katalog Kelas</Link>
              <Link href="/#testimonials" className="hover:text-white transition-colors">Testimoni</Link>
              <Link href="/login" className="hover:text-white transition-colors">Masuk</Link>
              <Link href="/register" className="hover:text-white transition-colors">Daftar</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Kontak</h4>
            <div className="flex flex-col gap-2 text-gray-400 text-sm">
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> missyuni.my.id@gmail.com
              </span>
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> +62 812-3456-7890
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Indonesia
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Missyuni. All rights reserved.
        </div>
      </div>
    </footer>
  );
}