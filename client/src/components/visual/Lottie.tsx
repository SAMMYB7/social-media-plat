import { useEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';

interface LottieProps {
  animationData: object;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

export function Lottie({ animationData, loop = true, autoplay = true, className }: LottieProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    animRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop,
      autoplay,
      animationData
    });
    return () => { animRef.current?.destroy(); };
  }, [animationData, loop, autoplay]);

  return <div className={className} ref={containerRef} />;
}
