import React from "react"
import { AppSidebar } from "@/components/app-sidebar";
import { SiteFooter } from "@/components/site-footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-x-hidden px-2 pb-6 pt-0 transition-all duration-300 sm:px-3 md:pl-64 md:pr-6">
        {children}
        <div className="py-10">
          <SiteFooter />
        </div>
      </main>
    </div>
  );
}
