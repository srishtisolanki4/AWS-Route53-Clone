"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export default function Modal({
  title,
  children,
  onClose,
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#eaeded] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#161e2d]">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-[#161e2d]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}