import { useEffect } from "react";
import { Link } from "react-router-dom";
import StoreBadges from "../components/StoreBadges";
import "./DownloadPage.css";

export default function DownloadPage() {
  useEffect(() => {
    document.title = "Preuzmi aplikaciju | MySkin Code";
  }, []);

  return (
    <div className="download-layout">
      <main className="download-page">
        <div className="download-page__glow download-page__glow--left" aria-hidden="true" />
        <div className="download-page__glow download-page__glow--right" aria-hidden="true" />

        <div className="download-page__panel">
          <section className="download-page__copy">
            <p className="download-page__eyebrow">Preuzimanje</p>
            <h1>Preuzmite MySkin Code</h1>
            <p className="download-page__lead">
              Personalizirana njega kože uz AI analizu - dostupna na iOS i
              Android.
            </p>

            <div
              className="download-page__stores"
              aria-label="Preuzimanje iz trgovina"
            >
              <StoreBadges large className="download-page__badges" />
            </div>

            <div className="download-page__links">
              <Link to="/" className="download-page__link">
                ← Natrag na početnu
              </Link>
            </div>
          </section>

          <div className="download-page__visual" aria-label="Pregled aplikacije">
            <img
              className="download-page__phone"
              src="/images/how-it-works/download.png"
              alt="MySkin Code na App Storeu"
              width={4096}
              height={2731}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
