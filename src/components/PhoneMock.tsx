import "./PhoneMock.css";

type Props = {
  variant?: "default" | "hero" | "download" | "compact";
  screenSrc?: string;
  screenAlt?: string;
  className?: string;
};

export default function PhoneMock({
  variant = "default",
  screenSrc,
  screenAlt = "",
  className = "",
}: Props) {
  return (
    <div
      className={`phone-mock phone-mock--${variant}${className ? ` ${className}` : ""}`}
      aria-hidden={!screenSrc}
    >
      {screenSrc ? (
        <img
          className="phone-mock__screen"
          src={screenSrc}
          alt={screenAlt}
          loading="lazy"
        />
      ) : (
        <div className="phone-mock__screen phone-mock__screen--placeholder" />
      )}
      <div className="phone-mock__notch" aria-hidden="true" />
    </div>
  );
}
