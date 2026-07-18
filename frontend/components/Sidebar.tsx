"use client";

import Link from "next/link";
import {
  Activity,
  CircleGauge,
  Globe,
  HeartPulse,
  Layers,
  Network,
  Route,
  Settings,
} from "lucide-react";

const navigationItems = [
  {
    label: "Dashboard",
    icon: CircleGauge,
    href: "/dashboard",
  },
  {
    label: "Hosted zones",
    icon: Globe,
    href: "/hosted-zones",
  },
  {
    label: "Traffic policies",
    icon: Route,
    href: "/coming-soon",
  },
  {
    label: "Health checks",
    icon: HeartPulse,
    href: "/coming-soon",
  },
  {
    label: "Resolver",
    icon: Network,
    href: "/coming-soon",
  },
  {
    label: "Profiles",
    icon: Layers,
    href: "/coming-soon",
  },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#161e2d] text-white">
      <div className="border-b border-[#334155] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-[#ff9900] text-lg font-bold text-[#161e2d]">
            AWS
          </div>

          <div>
            <p className="text-sm font-semibold">
              Amazon Web Services
            </p>

            <p className="text-xs text-gray-400">
              Route 53
            </p>
          </div>
        </div>
      </div>

      <nav className="px-3 py-5">
        <p className="px-3 pb-3 text-xs uppercase tracking-wider text-gray-500">
          Route 53
        </p>

        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-3 text-sm text-gray-300 transition hover:bg-[#263548] hover:text-white"
            >
              <Icon size={18} strokeWidth={1.8} />

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-full border-t border-[#334155] px-6 py-4">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <Settings size={17} />

          <span>Settings</span>
        </div>
      </div>
    </aside>
  );
}