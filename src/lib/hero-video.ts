export const HERO_VIDEO_SRC = "/images/SkinCodeVideo.mp4";

const READY_EVENT = "msc-hero-ready";

let heroReady = false;
const waiters = new Set<() => void>();

export function notifyHeroVideoReady() {
  if (heroReady) return;
  heroReady = true;
  waiters.forEach((fn) => fn());
  waiters.clear();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(READY_EVENT));
  }
}

export function onHeroVideoReady(callback: () => void): () => void {
  if (heroReady) {
    callback();
    return () => {};
  }
  waiters.add(callback);
  return () => {
    waiters.delete(callback);
  };
}

export function resetHeroVideoReady() {
  heroReady = false;
}

export function isHeroVideoElementReady(video: HTMLVideoElement | null): boolean {
  return Boolean(video && video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA);
}
