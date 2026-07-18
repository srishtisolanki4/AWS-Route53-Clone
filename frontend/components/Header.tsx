"use client";

import { Bell, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("route53_token");
    localStorage.removeItem("route53_user");

    router.push("/login");
  };

  return (
    <header className="fixed left-64 right-0 top-0 z-10 flex h-16 items-center justify-between border-b border-[#d5dbdb] bg-white px-8">
      <div>
        <p className="text-sm text-gray-500">
          AWS Management Console
        </p>

        <p className="text-lg font-semibold text-[#161e2d]">
          Route 53
        </p>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-gray-500 hover:text-[#161e2d]">
          <Bell size={20} />
        </button>

        <div className="h-6 w-px bg-gray-300" />

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-[#161e2d] hover:text-[#0972ce]"
        >
          <span>admin@route53.local</span>

          <ChevronDown size={16} />
        </button>
      </div>
    </header>
  );
}