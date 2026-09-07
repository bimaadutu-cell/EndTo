"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Pause, Play } from "lucide-react";

/**
 * Global music player - single audio instance for entire SPA.
 * Admin sets music URL via /admin (app_config.musicUrl).
 * User preference (muted/volume) in localStorage.
 */
export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [url, setUrl] = useState("");
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true); // start muted for autoplay policy
  const [visible, setVisible] = useState(false);
  const [needGesture, setNeedGesture] = useState(false);

  useEffect(() => {
    try {
      const cfg = localStorage.getItem("app_config");
      if (cfg) {
        const p = JSON.parse(cfg);
        if (p.musicUrl) setUrl(p.musicUrl);
      }
      const pref = localStorage.getItem("music_pref");
      if (pref) {
        const p = JSON.parse(pref);
        if (typeof p.muted === "boolean") setMuted(p.muted);
      }
    } catch {}

    // Also fetch server config
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => {
        if (d.musicUrl) setUrl(d.musicUrl);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!url) {
      setVisible(false);
      return;
    }
    setVisible(true);
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.loop = true;
      audioRef.current.preload = "auto";
    } else {
      audioRef.current.src = url;
    }
    const audio = audioRef.current;
    audio.muted = muted;

    // Try autoplay (often blocked if not muted)
    audio
      .play()
      .then(() => {
        setPlaying(true);
        setNeedGesture(false);
      })
      .catch(() => {
        setPlaying(false);
        setNeedGesture(true);
      });

    return () => {
      // Do NOT destroy on unmount of individual pages - this component lives in layout
    };
  }, [url]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
      try {
        localStorage.setItem("music_pref", JSON.stringify({ muted }));
      } catch {}
    }
  }, [muted]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.muted = muted;
      audio.play().then(() => {
        setPlaying(true);
        setNeedGesture(false);
      }).catch(() => setNeedGesture(true));
    }
  };

  const toggleMute = () => {
    setMuted((m) => !m);
    if (audioRef.current && !playing) {
      audioRef.current.muted = false;
      audioRef.current.play().then(() => {
        setPlaying(true);
        setNeedGesture(false);
      }).catch(() => {});
    }
  };

  if (!visible || !url) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-white border border-gray-200 shadow-lg rounded-full px-3 py-2">
      {needGesture && (
        <button
          onClick={togglePlay}
          className="text-xs font-medium text-black px-2"
        >
          Aktifkan Musik
        </button>
      )}
      <button onClick={togglePlay} className="p-1.5 hover:bg-gray-100 rounded-full" aria-label="Play/Pause">
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>
      <button onClick={toggleMute} className="p-1.5 hover:bg-gray-100 rounded-full" aria-label="Mute">
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
