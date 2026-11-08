import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { adminBasePath } from "@/lib/admin-path";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function AdminLayout({ children }: { children: ReactNode }) {
  if ((await headers()).get("x-admin-entry") !== adminBasePath()) notFound();
  return children;
}
