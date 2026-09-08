"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./VideoIntro.module.css";

let hasPlayedIntroThisLoad = false;

export default function VideoIntroWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [phase, setPhase] = useState<
    "playing" | "ended" | "toBlack" | "black" | "reveal" | "done"
  >("playing");

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err: unknown) => {
          console.warn("Autoplay deferred or prevented:", err);
        });
      }
    }
  }, []);

  // Lock scrolling and reset scroll position while video is active
  useEffect(() => {
    if (phase !== "done") {
      document.body.style.overflow = "hidden";
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  // Transition: video → black screen → dashboard
  const startTransition = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("hasPlayedIntroThisLoad", "true");
    }
    if (videoRef.current) videoRef.current.pause();

    // Step 1: Fade everything to solid black (0.6s)
    setPhase("toBlack");

    // Step 2: Hold solid black screen briefly
    setTimeout(() => setPhase("black"), 600);

    // Step 3: Slide black screen up, reveal dashboard
    setTimeout(() => setPhase("reveal"), 1100);

    // Step 4: Clean up overlay
    setTimeout(() => setPhase("done"), 2100);
  }, []);

  const handleVideoEnd = useCallback(() => {
    setPhase("ended");
  }, []);

  const handleSkip = useCallback(() => {
    startTransition();
  }, [startTransition]);

  // Listen for scroll/swipe/key while in "ended" phase
  useEffect(() => {
    if (phase !== "ended") return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 0) startTransition();
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (Math.abs(e.changedTouches[0].clientY - touchStartY) > 30)
        startTransition();
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === " " || e.key === "Enter")
        startTransition();
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKey);
    };
  }, [phase, startTransition]);

  if (phase === "done") {
    return <div className={styles.dashboardReveal}>{children}</div>;
  }

  const isBlackPhase =
    phase === "toBlack" || phase === "black" || phase === "reveal";

  return (
    <>
      {/* Dashboard underneath — only render during reveal */}
      {phase === "reveal" && (
        <div className={styles.dashboardReveal}>{children}</div>
      )}

      {/* Video overlay */}
      <div
        className={`${styles.videoOverlay} ${
          isBlackPhase ? styles.solidBlack : ""
        } ${phase === "reveal" ? styles.overlayOut : ""}`}
      >
        <video
          ref={videoRef}
          src="/smartscrapsetu.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={handleVideoEnd}
          onError={handleSkip}
          className={`${styles.video} ${isBlackPhase ? styles.videoHidden : ""}`}
        >
          Your browser does not support the video tag.
        </video>

        {/* Skip intro — while video is playing */}
        {phase === "playing" && (
          <button className={styles.skipBtn} onClick={handleSkip}>
            Skip intro
          </button>
        )}

        {/* Scroll-up indicator — after video ends */}
        {phase === "ended" && (
          <div className={styles.scrollIndicator} onClick={startTransition}>
            <div className={styles.scrollArrow}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </div>
            <span className={styles.scrollText}>Scroll up to explore</span>
          </div>
        )}
      </div>
    </>
  );
}
