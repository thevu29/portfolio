import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { PageContainer } from "@/components/primitives";

export default function NotFound() {
  return (
    <PageContainer className="pt-36">
      <p className="text-subtle font-mono text-xs">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground mt-4">
        That route doesn&apos;t exist. It may have moved.
      </p>
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground mt-8 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        Back home <ArrowRightIcon />
      </Link>
    </PageContainer>
  );
}
