"use client";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function ModalWrapper({ isOpen, onClose, children }: ModalWrapperProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setTimeout(() => onClose(), 100); // Затримка перед закриттям
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div className={cn(
        "transition-all duration-300 fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50",
        {
        "opacity-0 scale-95 pointer-events-none": !isOpen,
        "opacity-100 scale-100 pointer-events-auto": isOpen,
        }
    )}>
      <div ref={modalRef} className="flex w-full justify-center relative">
        {children}
      </div>
    </div>
  );
}
