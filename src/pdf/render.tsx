import { createRequire } from "node:module";
import { Font, renderToBuffer } from "@react-pdf/renderer";
import { cv as defaultCv, type Cv } from "@/content/cv";
import { CvDocument } from "./cv-document";
import { PDF_FONT_FAMILY } from "./styles";

const require = createRequire(import.meta.url);

// Font.register is process-global, so register once at module load.
// Same face as the Canva CV (IBM Plex Sans 400/700), embedded in the PDF.
Font.register({
  family: PDF_FONT_FAMILY,
  fonts: [
    {
      src: require.resolve("@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff"),
      fontWeight: 400,
    },
    {
      src: require.resolve("@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-700-normal.woff"),
      fontWeight: 700,
    },
  ],
});
// Canva never hyphenates; keep words whole so line breaks match.
Font.registerHyphenationCallback((word) => [word]);

export async function renderCvPdf(options: { cv?: Cv; siteUrl?: string } = {}): Promise<Buffer> {
  return renderToBuffer(<CvDocument cv={options.cv ?? defaultCv} siteUrl={options.siteUrl} />);
}
