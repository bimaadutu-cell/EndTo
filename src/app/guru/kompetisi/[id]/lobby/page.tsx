"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function GuruLobbyRedirect() {
  const params = useParams();
  const router = useRouter();
  useEffect(() => {
    // Mark as teacher
    localStorage.setItem("teacher_token", "guruku");
    router.replace(`/kompetisi/${params.id}/lobby`);
  }, [params.id, router]);
  return null;
}
