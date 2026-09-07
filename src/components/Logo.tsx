"use client";

import Image from "next/image";
import { useState, useCallback } from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  showAdminTrigger?: boolean;
  onAdminTrigger?: () => void;
}

export default function Logo({ 
  size = "md", 
  onClick,
  showAdminTrigger = false,
  onAdminTrigger 
}: LogoProps) {
  const [clickCount, setClickCount] = useState(0);

  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-24 h-24",
  };

  const handleClick = useCallback(() => {
    onClick?.();
    
    if (showAdminTrigger) {
      setClickCount(prev => {
        const newCount = prev + 1;
        
        if (newCount >= 7) {
          // Trigger admin setelah 7 klik
          setTimeout(() => {
            if (onAdminTrigger) {
              onAdminTrigger();
            }
          }, 50);
          return 0;
        }
        
        // Reset setelah 2 detik jika tidak mencapai 7
        setTimeout(() => {
          setClickCount(0);
        }, 2000);
        
        return newCount;
      });
    }
  }, [showAdminTrigger, onAdminTrigger, onClick]);

  return (
    <div 
      className={`${sizes[size]} relative cursor-pointer transition-transform hover:scale-105 active:scale-95`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleClick();
        }
      }}
    >
      <Image
        src="/logo.svg"
        alt="Logo Kelas X TKJ/RPL/TKKR"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}
