"use client";

interface CoursePlayerProps {
  videoUrl: string;
}

export function CoursePlayer({ videoUrl }: CoursePlayerProps) {
  // Convert YouTube URL to embed URL
  const getEmbedUrl = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/
    );
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
    }
    return url;
  };

  return (
    <div className="card overflow-hidden">
      <div className="aspect-video bg-black">
        <iframe
          src={getEmbedUrl(videoUrl)}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Video pembelajaran"
        />
      </div>
    </div>
  );
}