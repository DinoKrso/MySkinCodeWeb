import type { ReactNode } from "react";
import type { RichSegment } from "../content/legal";
import { Link } from "react-router-dom";
import "./RichText.css";

export type { RichSegment };

export function RichText({ segments }: { segments: RichSegment[] }) {
  return (
    <>
      {segments.map((segment, index) => {
        if (typeof segment === "string") {
          return <span key={index}>{segment}</span>;
        }
        if ("bold" in segment) {
          return <strong key={index}>{segment.bold}</strong>;
        }
        if (segment.link.internal) {
          return (
            <Link key={index} to={segment.link.href} className="rich-text__link">
              {segment.link.text}
            </Link>
          );
        }
        return (
          <a
            key={index}
            href={segment.link.href}
            className="rich-text__link"
          >
            {segment.link.text}
          </a>
        );
      })}
    </>
  );
}

export function RichParagraph({ children }: { children: ReactNode }) {
  return <p className="rich-text__body">{children}</p>;
}

export function RichBullet({ children }: { children: ReactNode }) {
  return (
    <p className="rich-text__bullet">
      <span className="rich-text__bullet-dot" aria-hidden="true">
        •
      </span>
      <span>{children}</span>
    </p>
  );
}

export function RichNote({ children }: { children: ReactNode }) {
  return <p className="rich-text__note">{children}</p>;
}
