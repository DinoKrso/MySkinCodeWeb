import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import LandingHeader from "../components/LandingHeader";
import SplashScreen from "../components/SplashScreen";
import "./PublicLayout.css";

export default function PublicLayout() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (pathname !== "/" || !hash) return;
    const id = decodeURIComponent(hash.slice(1));
    const target = document.getElementById(id);
    target?.scrollIntoView({ behavior: "smooth" });
  }, [pathname, hash]);

  return (
    <div className="public-layout">
      <SplashScreen />
      <LandingHeader />
      <Outlet />
    </div>
  );
}
