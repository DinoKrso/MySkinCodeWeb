import { useRef, type RefObject } from "react";
import { gsap, registerGsapPlugins, ScrollTrigger } from "../lib/gsap";
import { useGSAP } from "@gsap/react";

registerGsapPlugins();

function getCarouselMaxScroll(carousel: HTMLElement) {
  return Math.max(0, carousel.scrollWidth - carousel.clientWidth);
}

export function useLandingAnimations(
  carouselRef: RefObject<HTMLDivElement | null>,
  onCarouselStepChange?: (index: number) => void,
) {
  const landingRef = useRef<HTMLDivElement>(null);
  const onStepChangeRef = useRef(onCarouselStepChange);
  onStepChangeRef.current = onCarouselStepChange;

  useGSAP(
    () => {
      const root = landingRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(root.querySelectorAll(".landing-reveal, .landing-phone-mock"), {
          clearProps: "all",
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });

        heroTimeline
          .from(".landing-hero__bg", { scale: 1.1, duration: 1.4, ease: "power2.out" })
          .from(".landing-hero__title", { y: 56, autoAlpha: 0, duration: 0.95 }, "-=1.05")
          .from(
            ".landing-hero__subtitle",
            { y: 36, autoAlpha: 0, duration: 0.8 },
            "-=0.65",
          )
          .from(
            ".landing-hero__actions",
            { y: 28, autoAlpha: 0, duration: 0.65, stagger: 0.08 },
            "-=0.5",
          );

        gsap.from(".landing-partners", {
          y: 28,
          autoAlpha: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".landing-partners",
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        });

        gsap.utils
          .toArray<HTMLElement>(
            ".landing-section-head, .pricing-plans__head",
            root,
          )
          .forEach((head) => {
            gsap.from(head.children, {
              y: 36,
              autoAlpha: 0,
              duration: 0.75,
              stagger: 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: head,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            });
          });

        ScrollTrigger.batch(".landing-feature-card", {
          interval: 0.08,
          batchMax: 6,
          start: "top 90%",
          onEnter: (batch) => {
            gsap.from(batch, {
              y: 40,
              autoAlpha: 0,
              duration: 0.65,
              stagger: 0.08,
              ease: "power2.out",
              overwrite: true,
            });
          },
        });

        gsap.from(".landing-cta__text > *", {
          x: -36,
          autoAlpha: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".landing-cta",
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        });

        gsap.from(".landing-cta__phone-wrap .landing-phone-mock", {
          y: 90,
          scale: 0.78,
          rotation: 8,
          autoAlpha: 0,
          duration: 1.15,
          ease: "back.out(1.55)",
          scrollTrigger: {
            trigger: ".landing-cta__phone-wrap",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });

        gsap.from(".landing-faq__support", {
          y: 32,
          autoAlpha: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".landing-faq__support",
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        });

        const carousel = carouselRef.current;
        const carouselCleanups: Array<() => void> = [];

        if (carousel) {
          const slides = gsap.utils.toArray<HTMLElement>(
            ".landing-how__slide",
            carousel,
          );

          ScrollTrigger.scrollerProxy(carousel, {
            scrollLeft(value?: number) {
              if (value !== undefined) {
                carousel.scrollLeft = value;
              }
              return carousel.scrollLeft;
            },
            getBoundingClientRect() {
              return carousel.getBoundingClientRect();
            },
          });

          ScrollTrigger.create({
            scroller: carousel,
            horizontal: true,
            snap: {
              snapTo: (value) => {
                const maxScroll = getCarouselMaxScroll(carousel);
                if (maxScroll <= 0) return 0;

                const snapPoints = slides.map(
                  (slide) => slide.offsetLeft / maxScroll,
                );

                return snapPoints.reduce((closest, point) =>
                  Math.abs(point - value) < Math.abs(closest - value)
                    ? point
                    : closest,
                );
              },
              duration: { min: 0.25, max: 0.55 },
              delay: 0.04,
              ease: "power3.inOut",
            },
          });

          const slideToScale = slides.map((slide) =>
            gsap.quickTo(slide, "scale", { duration: 0.45, ease: "power2.out" }),
          );
          const slideToOpacity = slides.map((slide) =>
            gsap.quickTo(slide, "opacity", { duration: 0.35, ease: "power2.out" }),
          );
          const phoneToY = slides.map((slide) => {
            const phone = slide.querySelector<HTMLElement>(".landing-phone-mock");
            return phone
              ? gsap.quickTo(phone, "y", { duration: 0.5, ease: "power2.out" })
              : null;
          });
          const phoneToScale = slides.map((slide) => {
            const phone = slide.querySelector<HTMLElement>(".landing-phone-mock");
            return phone
              ? gsap.quickTo(phone, "scale", { duration: 0.5, ease: "power2.out" })
              : null;
          });
          const phoneToRotation = slides.map((slide) => {
            const phone = slide.querySelector<HTMLElement>(".landing-phone-mock");
            return phone
              ? gsap.quickTo(phone, "rotation", { duration: 0.5, ease: "power2.out" })
              : null;
          });

          let lastActiveIndex = -1;
          let phoneEntranceTween: gsap.core.Tween | null = null;
          let phoneEntranceLock = false;

          const updateCarousel = () => {
            const viewportCenter =
              carousel.scrollLeft + carousel.clientWidth * 0.42;
            let activeIndex = 0;
            let minDistance = Number.POSITIVE_INFINITY;

            slides.forEach((slide, index) => {
              const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
              const distance = Math.abs(slideCenter - viewportCenter);
              const proximity = Math.min(
                1,
                distance / (slide.offsetWidth * 0.72),
              );

              if (distance < minDistance) {
                minDistance = distance;
                activeIndex = index;
              }

              slideToScale[index](gsap.utils.interpolate(1, 0.93)(proximity));
              slideToOpacity[index](gsap.utils.interpolate(1, 0.72)(proximity));

              const isActive = index === activeIndex && proximity < 0.35;
              if (phoneEntranceLock && isActive) return;

              phoneToY[index]?.(isActive ? 0 : 18 + proximity * 22);
              phoneToScale[index]?.(isActive ? 1 : 0.9 - proximity * 0.06);
              phoneToRotation[index]?.(isActive ? 0 : -3 + proximity * 2);
            });

            if (activeIndex !== lastActiveIndex) {
              lastActiveIndex = activeIndex;
              onStepChangeRef.current?.(activeIndex);

              const activePhone = slides[activeIndex]?.querySelector<HTMLElement>(
                ".landing-phone-mock",
              );

              if (activePhone) {
                phoneEntranceLock = true;
                phoneEntranceTween?.kill();
                phoneEntranceTween = gsap.fromTo(
                  activePhone,
                  {
                    y: 64,
                    scale: 0.82,
                    rotation: 6,
                    autoAlpha: 0.55,
                  },
                  {
                    y: 0,
                    scale: 1,
                    rotation: 0,
                    autoAlpha: 1,
                    duration: 0.9,
                    ease: "back.out(1.45)",
                    overwrite: "auto",
                    onComplete: () => {
                      phoneEntranceLock = false;
                    },
                  },
                );
              }
            }
          };

          gsap.set(slides, { transformOrigin: "center center" });
          gsap.set(
            slides.flatMap((slide) =>
              Array.from(slide.querySelectorAll<HTMLElement>(".landing-phone-mock")),
            ),
            { transformOrigin: "center bottom" },
          );

          carousel.addEventListener("scroll", updateCarousel, { passive: true });
          carouselCleanups.push(() => {
            carousel.removeEventListener("scroll", updateCarousel);
          });

          requestAnimationFrame(updateCarousel);
        }

        ScrollTrigger.refresh();

        return () => {
          carouselCleanups.forEach((cleanup) => cleanup());
        };
      });

      return () => {
        mm.revert();
      };
    },
    { scope: landingRef, dependencies: [carouselRef] },
  );

  return landingRef;
}

export function animateCarouselToStep(
  carousel: HTMLElement,
  index: number,
) {
  const slide = carousel.children[index] as HTMLElement | undefined;
  if (!slide) return;

  const paddingLeft = Number.parseFloat(getComputedStyle(carousel).paddingLeft);
  const maxScroll = getCarouselMaxScroll(carousel);
  const target = Math.min(
    maxScroll,
    Math.max(0, slide.offsetLeft - paddingLeft),
  );

  gsap.to(carousel, {
    scrollLeft: target,
    duration: 0.75,
    ease: "power3.inOut",
    overwrite: true,
  });
}
