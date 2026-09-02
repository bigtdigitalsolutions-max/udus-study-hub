import { useEffect, useRef, useState } from "react";

/**
 * Canvas-only PDF renderer. No text layer is created, so there is nothing to
 * select or copy; each page is stamped with a diagonal watermark.
 */
export function PdfCanvasViewer({ url }: { url: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [pages, setPages] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

        const doc = await pdfjs.getDocument({ url }).promise;
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
          canvas.style.borderRadius = "12px";
          canvas.style.marginBottom = "14px";
          canvas.style.background = "#fff";
          canvas.className = "no-select";

          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;

          // Watermark, drawn straight onto the bitmap.
          ctx.save();
          ctx.globalAlpha = 0.16;
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(-Math.PI / 7);
          ctx.fillStyle = "#2b1b3d";
          const size = Math.max(16, canvas.width / 16);
          ctx.font = `800 ${size}px Syne, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const step = size * 3;
          for (let y = -canvas.height; y < canvas.height; y += step) {
            ctx.fillText("UDUS Study Vault", 0, y);
          }
          ctx.restore();

          if (cancelled) return;
          host.appendChild(canvas);
        }

        if (!cancelled) setStatus("ready");
      } catch (error) {
        console.error(error);
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

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
          {pages} page{pages === 1 ? "" : "s"} · canvas rendered · copy &amp; print blocked
        </p>
      )}
    </div>
  );
}
