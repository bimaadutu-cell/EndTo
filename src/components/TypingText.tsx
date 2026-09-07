"use client";
import { useState, useEffect } from "react";
export default function TypingText({ text, speed = 80, className = "" }: { text: string; speed?: number; className?: string }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text, speed]);
  return <span className={className}>{displayed}</span>;
}
