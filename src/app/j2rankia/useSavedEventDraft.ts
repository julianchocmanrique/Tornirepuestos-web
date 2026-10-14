"use client";
import { useEffect, useRef, useState } from "react";
import type { Settings } from "@/lib/baile/types";
import { newEventDraft } from "@/lib/baile/event-draft";
import { readEventDraft, writeEventDraft, deleteEventDraft } from "@/lib/baile/event-draft-storage";

export function useSavedEventDraft(key: string, demoEnabled: boolean, paymentDefaults?: Settings) {
  const freshDraft = () => ({ ...newEventDraft(), demo: demoEnabled, paymentMethod: paymentDefaults?.paymentMethod ? { ...paymentDefaults.paymentMethod } : null, paymentInstructions: paymentDefaults?.paymentMethod ? paymentDefaults.paymentInstructions : "" });
  const [draft, setDraft] = useState(freshDraft);
  const [step, setStep] = useState(0), [cover, setCover] = useState<File | null>(null);
  const [ready, setReady] = useState(false), [restored, setRestored] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const queue = useRef(Promise.resolve()), revision = useRef(0), suspended = useRef(false);
  const alive = useRef(true), skipInitial = useRef(true), savedPhoto = useRef<File | null | undefined>(undefined);
  useEffect(() => {
    alive.current = true; let active = true;
    readEventDraft(key).then(saved => {
      if (!active) return;
      if (saved) {
        setDraft({ ...saved.draft, demo: demoEnabled && saved.draft.demo }); setStep(saved.step); setCover(saved.cover);
        savedPhoto.current = saved.cover; setRestored(true); setStatus("saved");
      }
    }).catch(() => { if (active) setStatus("error"); }).finally(() => { if (active) setReady(true); });
    return () => { active = false; alive.current = false; };
    // The parent keys this component by account and event scope.
  }, [key, demoEnabled]);

  useEffect(() => {
    if (!ready || suspended.current) return;
    if (skipInitial.current) { skipInitial.current = false; return; }
    const current = ++revision.current; setStatus("saving");
    queue.current = queue.current.catch(() => {}).then(async () => {
      await writeEventDraft(key, draft, step, cover, savedPhoto.current !== cover);
      savedPhoto.current = cover;
    }).then(() => { if (alive.current && current === revision.current) setStatus("saved"); })
      .catch(() => { if (alive.current && current === revision.current) setStatus("error"); });
  }, [key, ready, draft, step, cover]);

  useEffect(() => {
    if (status !== "saving" && status !== "error") return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);

  async function clear() {
    suspended.current = true; ++revision.current;
    try {
      // A queued save must finish before deletion, so it cannot resurrect a published draft.
      await queue.current; await deleteEventDraft(key); savedPhoto.current = null;
      if (alive.current) { setStatus("idle"); setRestored(false); }
      return true;
    } catch { if (alive.current) setStatus("error"); return false; }
  }
  async function reset() {
    if (!await clear()) { suspended.current = false; return false; }
    suspended.current = false;
    setDraft(freshDraft()); setStep(0); setCover(null);
    return true;
  }
  return { draft, setDraft, step, setStep, cover, setCover, ready, restored, status, clear, reset };
}
