import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import LandingHeader from "../components/LandingHeader";
import PaymentTestBanner from "../components/PaymentTestBanner";
import SplashScreen from "../components/SplashScreen";
import { isMonriTestMode } from "../content/merchant";
import "./PublicLayout.css";

export default function PublicLayout() {
  const { pathname, hash } = useLocation();
  const testMode = isMonriTestMode();

  useEffect(() => {
    if (pathname !== "/" || !hash) return;
    const id = decodeURIComponent(hash.slice(1));
    const target = document.getElementById(id);
    target?.scrollIntoView({ behavior: "smooth" });
  }, [pathname, hash]);

  return (
    <div
      className={`public-layout${testMode ? " public-layout--test-mode" : ""}`}
    >
      <SplashScreen />
      <div className="public-layout__chrome">
        <PaymentTestBanner />
        <LandingHeader />
      </div>
      <Outlet />
    </div>
  );
}
