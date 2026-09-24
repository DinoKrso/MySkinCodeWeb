import { Link } from "react-router-dom";
import StoreBadges from "../components/StoreBadges";
import { usePageSeo } from "../lib/seo";
import "./DownloadPage.css";

export default function DownloadPage() {
  usePageSeo({
    title: "Preuzmi aplikaciju | MySkin Code",
    description:
      "Preuzmite MySkin Code na App Store ili Google Play — personalizirana AI analiza kože dostupna na iOS i Android.",
    path: "/download",
  });

  return (
    <div className="download-layout">
      <main className="download-page">
        <div className="download-page__glow download-page__glow--left" aria-hidden="true" />
        <div className="download-page__glow download-page__glow--right" aria-hidden="true" />

        <div className="download-page__panel">
          <div className="download-page__visual" aria-label="Pregled aplikacije">
            <img
              className="download-page__phone"
              src="/images/how-it-works/download.png"
              alt="MySkin Code na App Storeu"
              width={4096}
              height={2731}
            />
          </div>

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
        </div>
      </main>
    </div>
  );
}
