import "./BrandLogo.css";

type Props = {
  className?: string;
};

export default function BrandLogo({ className }: Props) {
  return (
    <span className={["brand-logo", className].filter(Boolean).join(" ")}>
      MySkin <span className="brand-logo__accent">Code</span>
    </span>
  );
}
