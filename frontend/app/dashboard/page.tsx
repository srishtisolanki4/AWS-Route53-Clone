"use client";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#f2f3f3]">
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-[#ff9900] mb-4">
            <span className="text-2xl font-bold text-[#161e2d]">AWS</span>
          </div>
          <h1 className="text-3xl font-semibold text-[#161e2d] mb-2">
            Dashboard
          </h1>
          <p className="text-gray-500 max-w-md mx-auto">
            This section is currently mocked. Check out the Hosted Zones section for full functionality.
          </p>
        </div>
      </main>
    </div>
  );
}
