import type { Metadata } from "next";
import { DesignShowcase } from "@/components/design/design-showcase";

export const metadata: Metadata = {
  title: "Diseño · Splitly",
  robots: { index: false, follow: false },
};

export default function DesignPage() {
  return (
    <main>
      <DesignShowcase />
    </main>
  );
}
