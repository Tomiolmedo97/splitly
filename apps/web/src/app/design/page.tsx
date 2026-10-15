import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { DesignShowcase } from "@/components/design/design-showcase";

const geist = Geist({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Sistema de diseño · Splitly",
  robots: { index: false, follow: false },
};

export default function DesignPage() {
  return (
    <main className={`${geist.className} mx-auto max-w-6xl px-4 py-12 sm:px-6`} style={{ color: "#12312B" }}>
      <header className="mb-8 max-w-2xl">
        <h1 className="text-[28px] font-semibold tracking-tight sm:text-[40px]">Splitly en Menta fresca</h1>
        <p className="mt-2 text-[16px] text-[#4B6B63]">
          El sistema elegido, en claro y oscuro. Tocá &quot;Simular&quot; para ver los números contando, las deudas
          que se reacomodan y el confeti cuando alguien queda al día.
        </p>
      </header>
      <DesignShowcase />
    </main>
  );
}
