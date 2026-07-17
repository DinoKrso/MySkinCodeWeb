import logoUrl from "../assets/MySkin Code.svg";
import "./BrandLogo.css";

type Props = {
  className?: string;
};

export default function BrandLogo({ className }: Props) {
  return (
    <img
      src={logoUrl}
      alt="MySkin Code"
      className={["brand-logo", className].filter(Boolean).join(" ")}
    />
  );
}
