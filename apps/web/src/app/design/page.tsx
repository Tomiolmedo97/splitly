import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { DesignShowcase } from "@/components/design/design-showcase";

const geist = Geist({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Diseño · Splitly",
  robots: { index: false, follow: false },
};

export default function DesignPage() {
  return (
    <main className={geist.className}>
      <DesignShowcase />
    </main>
  );
}
