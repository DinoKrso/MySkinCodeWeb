import { useEffect, useState } from "react";
import BrandLogo from "./BrandLogo";
import "./SplashScreen.css";

const SPLASH_KEY = "msc-splash-seen";

function shouldShowSplash() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }
  return !sessionStorage.getItem(SPLASH_KEY);
}

export default function SplashScreen() {
  const [phase, setPhase] = useState<"enter" | "exit" | "done">(() =>
    shouldShowSplash() ? "enter" : "done",
  );

  useEffect(() => {
    if (phase !== "enter") return;

    sessionStorage.setItem(SPLASH_KEY, "1");
    document.body.classList.add("splash-active");

    const exitTimer = window.setTimeout(() => setPhase("exit"), 1000);
    const doneTimer = window.setTimeout(() => {
      setPhase("done");
      document.body.classList.remove("splash-active");
    }, 1500);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
      document.body.classList.remove("splash-active");
    };
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      className={`splash-screen${phase === "exit" ? " splash-screen--exit" : ""}`}
      role="presentation"
      aria-hidden="true"
    >
      <BrandLogo className="splash-screen__logo" />
    </div>
  );
}
