import { useEffect, useRef, useState } from "react";
import { cacheRenderedPage, getCachedPages, type CachedDocumentPage } from "@/lib/document-cache";

/**
 * Canvas-only PDF renderer. No text layer is created, so there is nothing to
 * select or copy; each page is stamped with a diagonal watermark.
 */
type Props = {
  documentId: string;
  courseCode: string;
  department: string | null;
  data: Uint8Array | null;
};

export function PdfCanvasViewer({ documentId, courseCode, department, data }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [pages, setPages] = useState(0);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const appendCachedPage = async (cached: CachedDocumentPage) => {
      const host = hostRef.current;
      if (!host || cancelled) return;

      const canvas = document.createElement("canvas");
      canvas.width = cached.width;
      canvas.height = cached.height;
      canvas.style.width = "100%";
      canvas.style.height = "auto";
      canvas.style.display = "block";
      canvas.className = "no-select mb-3 block w-full rounded-xl bg-cream";
      const context = canvas.getContext("2d");
      if (!context) return;

      const image = await createImageBitmap(cached.blob);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      image.close();
      if (!cancelled) host.appendChild(canvas);
    };

    (async () => {
      try {
        const cached = await getCachedPages(documentId);
        if (!data && cached.length > 0) {
          hostRef.current?.replaceChildren();
          for (const page of cached) await appendCachedPage(page);
          if (!cancelled) {
            setPages(cached[0]?.totalPages ?? cached.length);
            setOffline(true);
            setStatus("ready");
          }
          return;
        }

        if (!data) throw new Error("No online document data or cached pages");

        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        const workerUrl = (await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url")).default;
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

        const doc = await pdfjs.getDocument({ data }).promise;
        if (cancelled) return;
        setPages(doc.numPages);

        const host = hostRef.current;
        if (!host) return;
        host.replaceChildren();

        const width = Math.min(host.clientWidth || 340, 900);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        for (let n = 1; n <= doc.numPages; n++) {
          const page = await doc.getPage(n);
          if (cancelled) return;

          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: (width / base.width) * dpr });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          canvas.style.display = "block";
          canvas.className = "no-select mb-3 block w-full rounded-xl bg-cream";

          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;

          // Watermark, drawn straight onto the bitmap.
          ctx.save();
          ctx.globalAlpha = 0.16;
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(-Math.PI / 7);
          ctx.fillStyle = getComputedStyle(document.documentElement)
            .getPropertyValue("--ink")
            .trim();
          const size = Math.max(16, canvas.width / 16);
          ctx.font = `800 ${size}px Syne, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const step = size * 3;
          for (let y = -canvas.height; y < canvas.height; y += step) {
            ctx.fillText("UDUS Study Vault", 0, y);
          }
          ctx.restore();

          const rendered = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/png"),
          );
          if (rendered) {
            void cacheRenderedPage(documentId, courseCode, department, {
              page: n,
              totalPages: doc.numPages,
              width: canvas.width,
              height: canvas.height,
              blob: rendered,
            });
          }

          if (cancelled) return;
          host.appendChild(canvas);
        }

        if (!cancelled) setStatus("ready");
      } catch (error) {
        const cached = await getCachedPages(documentId);
        if (cached.length > 0) {
          hostRef.current?.replaceChildren();
          for (const page of cached) await appendCachedPage(page);
          if (!cancelled) {
            setPages(cached[0]?.totalPages ?? cached.length);
            setOffline(true);
            setStatus("ready");
          }
        } else {
          console.error(error);
          if (!cancelled) setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [courseCode, data, department, documentId]);

  return (
    <div>
      {status === "loading" && (
        <p className="font-mono text-[11px] text-ink/50">Rendering secure pages…</p>
      )}
      {status === "error" && (
        <p className="font-mono text-[11px] text-ink/60">
          This handout could not be rendered. Try reopening it.
        </p>
      )}
      <div ref={hostRef} className="no-select" />
      {status === "ready" && (
        <p className="pb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/40">
          {pages} page{pages === 1 ? "" : "s"} · {offline ? "saved for offline reading" : "saved as rendered pages"}
        </p>
      )}
    </div>
  );
}
