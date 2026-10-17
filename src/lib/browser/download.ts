/**
 * Triggers a browser download of text content via a temporary anchor.
 * Browser-only side effect; kept separate from pure builders (ADR 0018, Q4).
 */
export function downloadTextFile({
  content,
  filename,
  mimeType,
}: {
  content: string;
  filename: string;
  mimeType: string;
}): void {
  const anchor = document.createElement("a");
  anchor.setAttribute(
    "href",
    `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`
  );
  anchor.setAttribute("download", filename);
  anchor.click();
}
