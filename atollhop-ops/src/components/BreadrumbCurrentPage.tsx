"use client";

import { usePathname } from "next/navigation";
import { BreadcrumbPage } from "@/components/ui/breadcrumb";

export default function BreadcrumbCurrentPage() {
  // e.g. "/schedules/create" → ["schedules","create"]
  const pathname = usePathname() || "/";
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1] || "dashboard";

  // Turn "create-schedule" → "Create Schedule"
  const title = last
    .split(/[-_]/)
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join(" ");

  return <BreadcrumbPage>{title}</BreadcrumbPage>;
}
