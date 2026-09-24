import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import { onHeroVideoReady } from "../lib/hero-video";
import "./SplashScreen.css";

const MIN_HOME_MS = 700;
const OTHER_PAGE_MS = 900;
const FAILSAFE_MS = 10000;

export default function SplashScreen() {
  const { pathname } = useLocation();
  const waitForHero = pathname === "/";
  const [phase, setPhase] = useState<"enter" | "exit" | "done">("enter");
  const finished = useRef(false);

  useEffect(() => {
    if (phase !== "enter") return;

    document.body.classList.add("splash-active");
    finished.current = false;
    const started = Date.now();

    const finish = () => {
      if (finished.current) return;
      finished.current = true;
      const elapsed = Date.now() - started;
      const minWait = waitForHero ? MIN_HOME_MS : OTHER_PAGE_MS;
      window.setTimeout(
        () => setPhase("exit"),
        Math.max(0, minWait - elapsed),
      );
    };

    if (!waitForHero) {
      const timer = window.setTimeout(finish, OTHER_PAGE_MS);
      return () => {
        window.clearTimeout(timer);
        document.body.classList.remove("splash-active");
      };
    }

    const unsubscribe = onHeroVideoReady(finish);
    const failsafe = window.setTimeout(finish, FAILSAFE_MS);

    return () => {
      unsubscribe();
      window.clearTimeout(failsafe);
    };
  }, [phase, waitForHero]);

  useEffect(() => {
    if (phase !== "exit") return;
    const timer = window.setTimeout(() => {
      setPhase("done");
      document.body.classList.remove("splash-active");
    }, 450);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      className={`splash-screen${phase === "exit" ? " splash-screen--exit" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Učitavanje"
    >
      <BrandLogo className="splash-screen__logo" />
    </div>
  );
}
