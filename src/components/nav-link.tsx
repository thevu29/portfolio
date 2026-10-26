"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { navTransitionTypes } from "@/lib/nav";

type NavLinkProps = Omit<ComponentProps<typeof Link>, "href" | "transitionTypes"> & {
  href: string;
};

/** Internal page link: slides forward or back by page order (PageTransition). */
export function NavLink({ href, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const types = navTransitionTypes(pathname, href);
  return <Link href={href} transitionTypes={types.length ? types : undefined} {...props} />;
}
