"use client";

import { useState } from "react";
import { FileText, ExternalLink, Maximize2, Minimize2 } from "lucide-react";

interface PdfViewerProps {
  pdfUrl: string;
  title?: string;
}

export function PdfViewer({ pdfUrl, title }: PdfViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`card overflow-hidden ${isExpanded ? "fixed inset-4 z-50" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-sm font-medium text-text truncate">
            {title || "Modul PDF"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
            title="Buka di tab baru"
          >
            <ExternalLink className="w-4 h-4 text-text-muted" />
          </a>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
            title={isExpanded ? "Kecilkan" : "Perbesar"}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4 text-text-muted" />
            ) : (
              <Maximize2 className="w-4 h-4 text-text-muted" />
            )}
          </button>
        </div>
      </div>

      {/* PDF Embed */}
      <div className={`${isExpanded ? "h-[calc(100vh-120px)]" : "aspect-[4/3]"}`}>
        <iframe
          src={pdfUrl}
          className="w-full h-full border-0"
          title={title || "PDF Viewer"}
        />
      </div>
    </div>
  );
}
