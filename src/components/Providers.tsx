"use client";

import MusicPlayer from "./MusicPlayer";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <MusicPlayer />
    </>
  );
}
