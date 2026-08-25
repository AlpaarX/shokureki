import React, { useLayoutEffect, useRef, useState } from "react";
import { Eye } from "lucide-react";

const A4_RATIO = 297 / 210;

export default function A4Preview({ className = "", contentClassName, html, label = false, pageClassName = "" }) {
  const measurePageRef = useRef(null);
  const measureContentRef = useRef(null);
  const [pagination, setPagination] = useState({ contentHeight: 0, pageCount: 1 });

  useLayoutEffect(() => {
    const page = measurePageRef.current;
    const content = measureContentRef.current;
    if (!page || !content) return undefined;

    const updatePagination = () => {
      const pageWidth = page.clientWidth;
      if (!pageWidth) return;

      const styles = window.getComputedStyle(page);
      const verticalPadding = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
      const contentHeight = Math.max(1, pageWidth * A4_RATIO - verticalPadding);
      const pageCount = Math.max(1, Math.ceil((content.scrollHeight - 0.5) / contentHeight));

      setPagination((current) => (
        current.pageCount === pageCount && Math.abs(current.contentHeight - contentHeight) < 0.5
          ? current
          : { contentHeight, pageCount }
      ));
    };

    updatePagination();
    const observer = new ResizeObserver(updatePagination);
    observer.observe(page);
    observer.observe(content);
    window.addEventListener("resize", updatePagination);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePagination);
    };
  }, [className, html]);

  return (
    <div className={`${className} a4-preview-stage`}>
      {label && (
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#747a76]">
          <Eye size={14} /> A4 preview
        </div>
      )}
      <article
        className={`a4-preview-page a4-preview-measure ${pageClassName}`}
        ref={measurePageRef}
        aria-hidden="true"
      >
        <div ref={measureContentRef} className={contentClassName} dangerouslySetInnerHTML={{ __html: html }} />
      </article>
      {Array.from({ length: pagination.pageCount }, (_, pageIndex) => (
        <article className={`a4-preview-page a4-preview-page--paginated ${pageClassName}`} key={pageIndex}>
          <div
            className="a4-preview-content-viewport"
            style={pagination.contentHeight ? { height: `${pagination.contentHeight}px` } : undefined}
          >
            <div
              className={contentClassName}
              style={{ transform: `translateY(-${pageIndex * pagination.contentHeight}px)` }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
          {pagination.pageCount > 1 && (
            <span className="a4-preview-page-number" aria-hidden="true">
              {pageIndex + 1} / {pagination.pageCount}
            </span>
          )}
        </article>
      ))}
    </div>
  );
}
