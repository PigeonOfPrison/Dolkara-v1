import React, { useEffect, useState } from 'react';
import '../css/SplashScreen.css';

/**
 * SplashScreen - Full-screen overlay that plays the intro animation,
 * then fades out to reveal the editor underneath.
 *
 * @param {Function} onRevealEditor - called when the screen starts fading (mount editor now)
 * @param {Function} onDone - called when the splash is fully gone (unmount splash)
 */
export default function SplashScreen({ onRevealEditor, onDone }) {
  const [contentFading, setContentFading] = useState(false);
  const [screenFading, setScreenFading] = useState(false);

  useEffect(() => {
    // Fade out logo/text first
    const t1 = setTimeout(() => setContentFading(true), 3500);
    // Fade out the entire overlay — also signal to mount the editor
    const t2 = setTimeout(() => {
      setScreenFading(true);
      onRevealEditor?.();
    }, 4000);
    // Unmount after fade completes
    const t3 = setTimeout(() => onDone(), 5500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onRevealEditor, onDone]);

  return (
    <div className={`splash-screen${screenFading ? ' splash-screen--fading' : ''}`}>

      {/* Full-screen background grid */}
      <div className="splash-bg-grid" />

      {/* Ambient center glow */}
      <div className="splash-glow" />

      {/* Corner brackets */}
      <div className="splash-corner splash-corner--tl" />
      <div className="splash-corner splash-corner--tr" />
      <div className="splash-corner splash-corner--bl" />
      <div className="splash-corner splash-corner--br" />

      {/* Top edge bar */}
      <div className="splash-top-bar">
        <span className="splash-bar-label">Dolkaraa Studio</span>
        <span className="splash-bar-label">Game Editor</span>
      </div>

      {/* Bottom edge bar */}
      <div className="splash-bottom-bar">
        <span className="splash-bar-label">v0.1.0</span>
        <span className="splash-bar-label">Design · Compile · Play</span>
      </div>

      {/* Scan line */}
      <div className="splash-scan-line" />

      {/* Main centered content */}
      <div className={`splash-content${contentFading ? ' splash-content--fading' : ''}`}>
        <div className="splash-logo-box">
          <span className="splash-logo-letter">D</span>
        </div>
        <div className="splash-app-name">Dolkara</div>
        <div className="splash-separator" />
        <div className="splash-slogan">
          <span>Design.</span> Compile. <span>Play.</span>
        </div>
      </div>

    </div>
  );
}
