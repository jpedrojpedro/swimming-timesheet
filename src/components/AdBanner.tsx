import { useEffect } from 'react';

interface AdBannerProps {
  show?: boolean;
}

export default function AdBanner({ show = true }: AdBannerProps) {
  useEffect(() => {
    // Load AdSense script when component mounts
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  if (!show) {
    return null;
  }

  return (
      <div className="ad-space">
          <ins className="adsbygoogle"
               style={{display: 'block'}}
               data-ad-client="ca-pub-6566652854233291"
               data-ad-slot="6414628122"
               data-ad-format="auto"
               data-full-width-responsive="true">
          </ins>
      </div>
  );
}
