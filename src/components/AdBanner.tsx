import { useEffect, useRef } from 'react';

interface AdBannerProps {
  show?: boolean;
}

export default function AdBanner({ show = true }: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!show) return;

    // Wait for next tick to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      try {
        if (adRef.current) {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        }
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [show]);

  if (!show) {
    return null;
  }

  return (
      <div className="ad-space">
          <ins ref={adRef}
               className="adsbygoogle"
               style={{display: 'block', width: '100%'}}
               data-ad-client="ca-pub-6566652854233291"
               data-ad-slot="6414628122"
               data-ad-format="auto"
               data-full-width-responsive="true">
          </ins>
      </div>
  );
}
