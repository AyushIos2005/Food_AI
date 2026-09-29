import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, Check, ChefHat, ChevronLeft, ChevronRight, ListChecks, Pause, Play, RotateCcw, Timer, X } from "lucide-react";
import { ConfirmDialog, BottomSheet } from "./ui/Sheet";
import { Button, IconButton } from "./ui/Button";
import { formatClock, parseTimerSeconds } from "../utils/format";

const PRESETS = [
  { label: "1 min", seconds: 60 },
  { label: "5 min", seconds: 300 },
  { label: "10 min", seconds: 600 },
];

// A short triple beep. Needs a user gesture first, which starting a timer is.
function beep(ctxRef) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!ctxRef.current) ctxRef.current = new Ctx();
    const ctx = ctxRef.current;
    [0, 0.35, 0.7].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.value = 0.15;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.2);
    });
  } catch {
    /* audio is a nice-to-have */
  }
}

// Full-screen, one-step-at-a-time cooking flow.
//   steps        string[]      the instructions
//   ingredients  string[]      optional, shown in a quick-look sheet
//   onExit()                   close without finishing
//   onFinish()                 called when the user taps "I cooked this"
export default function CookingMode({ title, steps, ingredients = [], onExit, onFinish }) {
  const total = steps.length;
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [timer, setTimer] = useState(null); // { total, remaining, running, label, done }
  const audioCtx = useRef(null);
  const skipNextPop = useRef(false);

  const stepText = String(steps[index] ?? "");
  const suggested = useMemo(() => parseTimerSeconds(stepText), [stepText]);

  /* ---------- Timer (based on an end timestamp, so it stays right if the tab sleeps) ---------- */
  const endsAt = useRef(0);

  const startTimer = useCallback((seconds, label) => {
    endsAt.current = Date.now() + seconds * 1000;
    setTimer({ total: seconds, remaining: seconds, running: true, label, done: false });
  }, []);

  const toggleTimer = () =>
    setTimer((t) => {
      if (!t || t.done) return t;
      if (t.running) return { ...t, running: false };
      endsAt.current = Date.now() + t.remaining * 1000;
      return { ...t, running: true };
    });

  const running = Boolean(timer?.running);
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endsAt.current - Date.now()) / 1000));
      setTimer((t) => (t && t.running ? { ...t, remaining, running: remaining > 0, done: remaining === 0 } : t));
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  const timerDone = Boolean(timer?.done);
  useEffect(() => {
    if (!timerDone) return;
    beep(audioCtx);
    navigator.vibrate?.([300, 150, 300, 150, 300]);
  }, [timerDone]);

  /* ---------- Keep the screen awake while cooking ---------- */
  useEffect(() => {
    let lock = null;
    let cancelled = false;
    const request = async () => {
      try {
        if (!("wakeLock" in navigator) || document.visibilityState !== "visible") return;
        const l = await navigator.wakeLock.request("screen");
        if (cancelled) l.release();
        else lock = l;
      } catch {
        /* not supported / denied */
      }
    };
    request();
    document.addEventListener("visibilitychange", request);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", request);
      lock?.release?.().catch(() => {});
    };
  }, []);

  /* ---------- Prevent accidentally leaving (back button, refresh, swipe-back) ---------- */
  useEffect(() => {
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    // An extra history entry means the first "Back" only pops this entry,
    // and we can ask before really leaving.
    window.history.pushState({ foodaiCooking: true }, "");
    const onPop = () => {
      if (skipNextPop.current) {
        skipNextPop.current = false;
        return;
      }
      setConfirmLeave(true);
      window.history.pushState({ foodaiCooking: true }, "");
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  const closeForReal = useCallback(() => {
    if (window.history.state?.foodaiCooking) {
      skipNextPop.current = true;
      window.history.back();
    }
    onExit?.();
  }, [onExit]);

  /* ---------- Navigation between steps ---------- */
  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = useCallback(() => {
    if (index >= total - 1) setFinished(true);
    else setIndex((i) => i + 1);
  }, [index, total]);

  useEffect(() => {
    const onKey = (e) => {
      if (confirmLeave || showIngredients) return;
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, confirmLeave, showIngredients]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const progress = finished ? 100 : Math.round(((index + 1) / total) * 100);

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={`Cooking mode: ${title}`} className="fixed inset-0 z-[70] bg-dark text-white flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-8 pt-[max(16px,env(safe-area-inset-top))] pb-3">
        <div className="flex items-center justify-between gap-3">
          <IconButton
            label="Exit cooking mode"
            icon={X}
            onClick={() => (finished ? closeForReal() : setConfirmLeave(true))}
            className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20"
          />
          <div className="min-w-0 text-center">
            <p className="text-[13px] font-semibold tracking-wide" aria-live="polite">
              {finished ? "All done" : `STEP ${index + 1} OF ${total}`}
            </p>
            <p className="text-[12px] text-white/70 truncate">{title}</p>
          </div>
          <IconButton
            label="Show ingredients"
            icon={ListChecks}
            onClick={() => setShowIngredients(true)}
            disabled={ingredients.length === 0}
            className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20"
          />
        </div>
        <div
          role="progressbar"
          aria-label="Cooking progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="mt-4 h-2 rounded-full bg-white/15 overflow-hidden"
        >
          <div className="h-full bg-orange-500 transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
        <ol className="sr-only">
          {steps.map((s, i) => (
            <li key={i}>{`Step ${i + 1}: ${s}`}</li>
          ))}
        </ol>
      </div>

      {/* Running timer stays visible on every step */}
      {timer && (
        <div className="px-4 sm:px-8">
          <div
            role="timer"
            className={`mx-auto max-w-2xl rounded-2xl px-4 py-3 flex items-center gap-3 ${timer.done ? "bg-orange-600 glow-pulse" : "bg-white/10"}`}
          >
            {timer.done ? <Bell size={20} aria-hidden="true" /> : <Timer size={20} aria-hidden="true" />}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-white/80 truncate">{timer.done ? "Timer finished" : timer.label || "Timer"}</p>
              <p className="text-2xl font-bold tabular-nums" aria-live="off">
                {formatClock(timer.remaining)}
              </p>
            </div>
            {!timer.done && (
              <IconButton
                label={timer.running ? "Pause timer" : "Resume timer"}
                icon={timer.running ? Pause : Play}
                onClick={toggleTimer}
                className="!bg-white/15 !text-white !border-transparent"
              />
            )}
            <IconButton
              label={timer.done ? "Dismiss timer" : "Cancel timer"}
              icon={timer.done ? Check : RotateCcw}
              onClick={() => setTimer(null)}
              className="!bg-white/15 !text-white !border-transparent"
            />
          </div>
        </div>
      )}

      {/* Step */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-8 flex">
        {finished ? (
          <div className="m-auto max-w-lg text-center py-8 flex flex-col items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-orange-500/20 text-orange-300 flex items-center justify-center">
              <ChefHat size={38} aria-hidden="true" />
            </div>
            <h2 className="font-display text-4xl">Nicely done!</h2>
            <p className="text-white/80 text-[16px]">You finished {title}. Log it so you can find it in your cooked recipes.</p>
            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
              <Button size="lg" className="flex-1" icon={Check} onClick={() => { onFinish?.(); closeForReal(); }}>
                I cooked this
              </Button>
              <Button size="lg" variant="outline" className="flex-1 !bg-transparent !text-white !border-white/30 hover:!bg-white/10" onClick={closeForReal}>
                Back to recipe
              </Button>
            </div>
          </div>
        ) : (
          <div className="m-auto w-full max-w-2xl py-6">
            <p key={index} className="font-display text-[28px] sm:text-[40px] leading-[1.25] fade-in">
              {stepText}
            </p>

            <div className="mt-8">
              {suggested > 0 && (!timer || timer.done) && (
                <Button
                  variant="outline"
                  size="lg"
                  icon={Timer}
                  className="!bg-white/10 !text-white !border-white/25 hover:!bg-white/20"
                  onClick={() => startTimer(suggested, `Step ${index + 1}`)}
                >
                  Start {formatClock(suggested)} timer
                </Button>
              )}
              {!timer && (
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span className="text-[13px] text-white/75 mr-1">Quick timer</span>
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => startTimer(p.seconds, `${p.label} timer`)}
                      className="chip chip-dark"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Big controls for messy hands */}
      {!finished && (
        <div className="px-4 sm:px-8 pt-3 pb-[max(20px,env(safe-area-inset-bottom))] bg-gradient-to-t from-dark via-dark to-transparent">
          <div className="mx-auto max-w-2xl grid grid-cols-[1fr_1.4fr] gap-3">
            <Button
              variant="outline"
              size="lg"
              icon={ChevronLeft}
              onClick={prev}
              disabled={index === 0}
              className="!min-h-16 !bg-white/10 !text-white !border-white/25 hover:!bg-white/20"
            >
              Previous
            </Button>
            <Button size="lg" onClick={next} className="!min-h-16">
              {index === total - 1 ? "Finish" : "Next"}
              {index === total - 1 ? <Check size={18} aria-hidden="true" /> : <ChevronRight size={18} aria-hidden="true" />}
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmLeave}
        title="Leave cooking mode?"
        message="Your place in the recipe and any running timer will be lost."
        confirmLabel="Leave"
        cancelLabel="Keep cooking"
        danger
        onCancel={() => setConfirmLeave(false)}
        onConfirm={() => {
          setConfirmLeave(false);
          closeForReal();
        }}
      />

      <BottomSheet open={showIngredients} onClose={() => setShowIngredients(false)} title="Ingredients">
        <ul className="space-y-2.5 text-[15px] text-ink">
          {ingredients.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-orange-700" aria-hidden="true">•</span>
              {String(item)}
            </li>
          ))}
        </ul>
      </BottomSheet>
    </div>,
    document.body
  );
}
