type HeroVideoProps = {
  className?: string;
  src?: string;
};

export function HeroVideo({ className, src = "/hero-video.mp4" }: HeroVideoProps) {
  return (
    <video
      className={className}
      src={src}
      poster="/hero-video-background.png"
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      aria-label="EvoCare product demo"
    />
  );
}
