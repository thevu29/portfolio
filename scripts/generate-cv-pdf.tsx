// Generates public/CV_NguyenTheVu.pdf from src/content/cv.ts.
// Runs before `next dev` and `next build` (see package.json).
import "./load-env";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { CV_PDF_FILENAME } from "@/content/cv";
import { siteUrl } from "@/lib/site";
import { renderCvPdf } from "@/pdf/render";

async function main(): Promise<void> {
  const outDir = path.join(process.cwd(), "public");
  const outFile = path.join(outDir, CV_PDF_FILENAME);
  const pdf = await renderCvPdf({ siteUrl });
  await mkdir(outDir, { recursive: true });
  await writeFile(outFile, pdf);
  process.stdout.write(
    `CV PDF written: ${path.relative(process.cwd(), outFile)} (${pdf.length} bytes)\n`,
  );
}

main().catch((error: unknown) => {
  process.stderr.write(
    `Failed to generate CV PDF: ${error instanceof Error ? error.stack : String(error)}\n`,
  );
  process.exit(1);
});
