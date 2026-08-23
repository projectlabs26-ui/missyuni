import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateCertificateCode } from "@/lib/utils";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await req.json();

    const enrollment = await db.enrollment.findFirst({
      where: { userId: session.user.id, courseId },
      orderBy: { createdAt: "desc" },
      include: { course: { include: { modules: { include: { quizzes: true } } } } },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
    }

    if (enrollment.progress < 100) {
      return NextResponse.json(
        { error: "Selesaikan semua modul terlebih dahulu" },
        { status: 400 }
      );
    }

    const allQuizzes = enrollment.course.modules.flatMap((m: any) => m.quizzes);
    const quizAttempts = await db.quizAttempt.findMany({
      where: {
        userId: session.user.id,
        quizId: { in: allQuizzes.map((q: any) => q.id) },
      },
    });

    const allPassed = allQuizzes.length === 0 || allQuizzes.every((q: any) =>
      quizAttempts.some((a: any) => a.quizId === q.id && a.passed)
    );

    if (!allPassed) {
      return NextResponse.json(
        { error: "Lulus semua kuis terlebih dahulu" },
        { status: 400 }
      );
    }

    const existing = await db.certificate.findFirst({
      where: { userId: session.user.id, courseId },
    });

    if (existing) {
      return NextResponse.json({ pdfUrl: existing.pdfUrl });
    }

    const code = generateCertificateCode();
    const dateStr = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const quizScore = quizAttempts[0]?.score || 100;
    const totalModules = enrollment.course.modules.length;

    const certHtml = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Inter', Arial, sans-serif;
    background: #f5f3ff;
    display: flex; align-items: center; justify-content: center;
    min-height: 100vh; padding: 40px;
  }
  .cert-wrapper {
    position: relative;
    width: 800px; background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.05);
    overflow: hidden;
  }
  .ornament-top {
    position: absolute; top: 0; left: 0; right: 0; height: 160px;
    background: linear-gradient(135deg, #7C3AED 0%, #A78BFA 60%, #C4B5FD 100%);
    clip-path: polygon(0 0, 100% 0, 100% 65%, 50% 100%, 0 65%);
  }
  .ornament-bottom {
    position: absolute; bottom: 0; left: 0; right: 0; height: 100px;
    background: linear-gradient(135deg, #C4B5FD 0%, #A78BFA 50%, #7C3AED 100%);
    clip-path: polygon(50% 0, 100% 35%, 100% 100%, 0 100%, 0 35%);
  }
  .circle-1 { position: absolute; top: 28px; left: 35px; width: 55px; height: 55px; border: 3px solid rgba(255,255,255,0.25); border-radius: 50%; }
  .circle-2 { position: absolute; top: 45px; right: 45px; width: 35px; height: 35px; border: 2px solid rgba(255,255,255,0.2); border-radius: 50%; }
  .circle-3 { position: absolute; bottom: 35px; left: 55px; width: 45px; height: 45px; border: 2px solid rgba(255,255,255,0.25); border-radius: 50%; }
  .circle-4 { position: absolute; bottom: 25px; right: 60px; width: 30px; height: 30px; border: 2px solid rgba(255,255,255,0.2); border-radius: 50%; }
  .dot-1 { position: absolute; top: 90px; left: 110px; width: 7px; height: 7px; background: rgba(255,255,255,0.35); border-radius: 50%; }
  .dot-2 { position: absolute; top: 120px; right: 95px; width: 5px; height: 5px; background: rgba(255,255,255,0.3); border-radius: 50%; }
  .dot-3 { position: absolute; bottom: 60px; left: 140px; width: 5px; height: 5px; background: rgba(255,255,255,0.3); border-radius: 50%; }
  .star { position: absolute; font-size: 14px; opacity: 0.25; color: #fff; }
  .star-1 { top: 30px; left: 190px; }
  .star-2 { top: 50px; right: 170px; }
  .star-3 { bottom: 50px; left: 210px; }
  .star-4 { bottom: 40px; right: 190px; }
  .cert-content {
    position: relative; z-index: 1; padding: 55px 65px 45px;
    text-align: center;
  }
  .cert-badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 65px; height: 65px; background: linear-gradient(135deg, #7C3AED, #A78BFA);
    border-radius: 50%; margin-bottom: 18px; font-size: 30px;
    box-shadow: 0 6px 20px rgba(124,58,237,0.25);
  }
  .cert-title {
    font-family: 'Playfair Display', serif;
    font-size: 34px; font-weight: 700; color: #1E1B4B;
    letter-spacing: 1.5px; margin-bottom: 6px;
  }
  .cert-subtitle {
    font-size: 13px; color: #7C3AED; text-transform: uppercase;
    letter-spacing: 3px; margin-bottom: 28px; font-weight: 600;
  }
  .cert-divider {
    width: 70px; height: 3px; background: linear-gradient(90deg, #C4B5FD, #7C3AED, #C4B5FD);
    margin: 0 auto 22px; border-radius: 2px;
  }
  .cert-to { font-size: 13px; color: #6B7280; margin-bottom: 5px; }
  .cert-name {
    font-family: 'Playfair Display', serif;
    font-size: 28px; font-weight: 700; color: #7C3AED;
    margin-bottom: 18px; padding: 3px 0;
  }
  .cert-desc { font-size: 13px; color: #6B7280; margin-bottom: 5px; line-height: 1.6; }
  .cert-course {
    font-size: 18px; font-weight: 700; color: #1E1B4B;
    margin-bottom: 22px; padding: 8px 22px;
    background: #F8F7FF; border-radius: 10px;
    display: inline-block;
  }
  .cert-meta {
    display: flex; justify-content: center; gap: 35px;
    margin-top: 28px; padding-top: 22px;
    border-top: 1px solid #E5E7EB;
  }
  .cert-meta-item { text-align: center; }
  .cert-meta-label { font-size: 10px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 3px; }
  .cert-meta-value { font-size: 13px; font-weight: 600; color: #1E1B4B; }
  .cert-code {
    margin-top: 22px; font-size: 11px; color: #9CA3AF;
    letter-spacing: 1px;
  }
  .cert-footer {
    margin-top: 28px; padding-top: 16px;
    border-top: 1px solid #E5E7EB;
    font-size: 12px; color: #7C3AED;
    font-weight: 500; letter-spacing: 0.3px;
  }
  .cert-footer span { color: #A78BFA; }
</style>
</head>
<body>
<div class="cert-wrapper">
  <div class="ornament-top"></div>
  <div class="ornament-bottom"></div>
  <div class="circle-1"></div>
  <div class="circle-2"></div>
  <div class="circle-3"></div>
  <div class="circle-4"></div>
  <div class="dot-1"></div>
  <div class="dot-2"></div>
  <div class="dot-3"></div>
  <div class="star star-1">&#10022;</div>
  <div class="star star-2">&#10022;</div>
  <div class="star star-3">&#10022;</div>
  <div class="star star-4">&#10022;</div>
  <div class="cert-content">
    <div class="cert-badge">&#127891;</div>
    <h1 class="cert-title">Certificate of Completion</h1>
    <p class="cert-subtitle">Sertifikat Kelulusan</p>
    <div class="cert-divider"></div>
    <p class="cert-to">Diberikan kepada</p>
    <p class="cert-name">${session.user.name}</p>
    <p class="cert-desc">Telah berhasil menyelesaikan seluruh materi dan kuis pada kelas</p>
    <p class="cert-course">${enrollment.course.title}</p>
    <div class="cert-meta">
      <div class="cert-meta-item">
        <p class="cert-meta-label">Tanggal</p>
        <p class="cert-meta-value">${dateStr}</p>
      </div>
      <div class="cert-meta-item">
        <p class="cert-meta-label">Nilai Kuis</p>
        <p class="cert-meta-value">${quizScore}%</p>
      </div>
      <div class="cert-meta-item">
        <p class="cert-meta-label">Modul</p>
        <p class="cert-meta-value">${totalModules} Modul</p>
      </div>
    </div>
    <p class="cert-code">Kode: ${code}</p>
    <p class="cert-footer">MissYuni &mdash; Belajar Bahasa Inggris Menyenangkan <span>|</span> missyuni.my.id</p>
  </div>
</div>
</body>
</html>`;

    const certDir = path.join(process.cwd(), "public", "certificates");
    await mkdir(certDir, { recursive: true });

    const fileName = `certificate-${code}.html`;
    const filePath = path.join(certDir, fileName);
    await writeFile(filePath, certHtml);

    const pdfUrl = `/certificates/${fileName}`;

    const certificate = await db.certificate.create({
      data: {
        userId: session.user.id!,
        courseId,
        code,
        pdfUrl,
      },
    });

    return NextResponse.json({ pdfUrl, code: certificate.code });
  } catch (error) {
    console.error("Certificate error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}