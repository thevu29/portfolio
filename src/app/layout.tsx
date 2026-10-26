import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cv } from "@/content/cv";
import { SiteNav } from "@/components/site-nav";
import { MotionProvider } from "@/components/reveal";
import { SmoothScroll } from "@/components/smooth-scroll";
import { SpotlightBackground } from "@/components/spotlight";
import { TooltipProvider } from "@/components/ui/tooltip";
import { metadataBaseUrl, siteUrl } from "@/lib/site";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const { profile } = cv;
const description = `${profile.title} building web applications end to end with React, Next.js and NestJS.`;

export const metadata: Metadata = {
  metadataBase: new URL(metadataBaseUrl),
  title: { default: `${profile.name} — ${profile.title}`, template: `%s — ${profile.name}` },
  description,
  authors: [{ name: profile.name, url: siteUrl }],
  openGraph: {
    type: "website",
    title: `${profile.name} — ${profile.title}`,
    description,
    siteName: profile.name,
  },
  twitter: { card: "summary_large_image" },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.title,
  email: `mailto:${profile.email}`,
  url: siteUrl,
  sameAs: [profile.linkedin, profile.github],
  address: { "@type": "PostalAddress", addressLocality: profile.location },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col font-sans">
        <a
          href="#content"
          className="bg-foreground text-background sr-only z-[60] rounded-md px-3 py-2 text-sm focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <SpotlightBackground />
        <SmoothScroll>
          <MotionProvider>
            <TooltipProvider delay={200}>
              <SiteNav />
              <div id="content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
                {children}
              </div>
            </TooltipProvider>
          </MotionProvider>
        </SmoothScroll>
        <footer className="text-subtle mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 border-t px-5 py-8 font-mono text-xs sm:px-8">
          <span>© {profile.name}</span>
          <nav aria-label="Contact" className="flex gap-5">
            <a href={`mailto:${profile.email}`} className="hover:text-foreground transition-colors">
              Email
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              LinkedIn
            </a>
          </nav>
        </footer>
        <script
          type="application/ld+json"
          // Escape "<" so no value can close the script tag.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
