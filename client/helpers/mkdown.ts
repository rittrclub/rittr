import { formatPost } from "../lib";
import DOMPurify from "dompurify";
import { marked, Renderer } from "marked";

const renderer = new Renderer();
renderer.link = (href, title, text) =>
  href.startsWith("http")
    ? `<a href="${href}" title="${title || text}" target="_blank" rel="noopener">${text}</a>`
    : `<a href="${href}" title="${title || text}">${text}</a>`;

DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  // set all elements owning target to target=_blank
  if ("target" in node) {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener");
  }
});

export function mkToHtml(str: string) {
  if (!str) return "";
  return DOMPurify.sanitize(
    marked.parse(formatPost(str), {
      renderer,
      gfm: true,
      breaks: true,
    })
  );
}
