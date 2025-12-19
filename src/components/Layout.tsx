import type { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto scrollbar-transparent pt-16 md:pt-0">
        <div className="container mx-auto p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
