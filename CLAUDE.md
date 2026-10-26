@AGENTS.md

## Claude Code notes

- Updating CV content: edit `src/content/cv.ts`, run `pnpm pdf`, then compare the PDF with the Canva export (both 2 pages, same page break). If the Canva CV changed, sync the text from Canva first (Canva MCP `read-design` on `DAGIXn6uxjY`).
- To eyeball the PDF, rasterize it (no poppler on this machine; a PDFKit Swift script works) rather than trusting text extraction.
- Visual checks: `pnpm build && pnpm start`, then claude-in-chrome at desktop and 375px, light and dark (check hero rays, Stack physics, timeline).
- shadcn components: `pnpm dlx shadcn@latest add <name>` (Base UI base). Our own building blocks live in `src/components/primitives.tsx`.
- Keep diffs surgical. Icons: `lucide-react` for UI, `simple-icons` for brands (server-side only), GitHub/LinkedIn glyphs in `src/components/icons.tsx`.
