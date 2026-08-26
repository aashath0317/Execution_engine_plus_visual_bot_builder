import React from "react";

export default function HeroVideoBackgroundMoving({
  videoSrc = "/Video/dark-gradient-abstract-animated-background-2026-01-28-04-39-11-utc.mov",
  poster,
  overlayOpacity = 0.35,

  // Motion toggles
  driftVideo = true,
  animateTint = true,
  ambientBlobs = true,

  children,
}) {
  return (
    <section className="hero">
      <video
        className={`video ${driftVideo ? "videoDrift" : ""}`}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster={poster}
        aria-hidden="true"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      <div className="overlay" aria-hidden="true" style={{ opacity: overlayOpacity }} />

      {/* Moving gradient tint */}
      <div className={`tint ${animateTint ? "tintMove" : ""}`} aria-hidden="true" />

      {/* Ambient moving blobs (The Complex Spin-Slide-Mix) */}
      {ambientBlobs && (
        <div className="blobs-wrapper" aria-hidden="true">
          <div className="blobs-container">
            <div className="blobs">
              <span className="blob b1" />
              <span className="blob b2" />
              <span className="blob b3" />
              <span className="blob b4" />
            </div>
          </div>
        </div>
      )}

      <div className="content">
        {children ?? (
          <div className="inner">
            <h1>Your Hero Headline</h1>
            <p>Subheadline goes here — readable, cinematic, premium.</p>
            <div className="ctaRow">
              <a className="btnPrimary" href="#start">Get Started</a>
              <a className="btnSecondary" href="#learn">Learn More</a>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .hero{
          position:relative;
          width:100%;
          min-height:100svh;
          padding: 2rem 0;
          overflow-x:hidden;
          overflow-y:hidden;
          display:flex;
          align-items:center;
          background:#05060a;
          perspective: 1000px;
        }

        .video{
          position:absolute;
          inset:0;
          width:100%;
          height:100%;
          object-fit:cover;
          object-position:center;
          transform:scale(1.03) translateZ(0);
          filter:saturate(1.05) contrast(1.05);
          will-change: transform;
        }

        .videoDrift{
          animation: videoDrift 9s ease-in-out infinite alternate;
        }
        @keyframes videoDrift{
          0%   { transform: scale(1.05) translate3d(0px, 0px, 0); }
          50%  { transform: scale(1.10) translate3d(-14px, 10px, 0); }
          100% { transform: scale(1.08) translate3d(14px, -10px, 0); }
        }

        .overlay{
          position:absolute;
          inset:0;
          background:black;
          pointer-events:none;
        }

        .tint{
          position:absolute;
          inset:-50%;
          pointer-events:none;
          mix-blend-mode: screen;
          background:
            radial-gradient(50% 50% at 30% 20%, rgba(0,255,157,0.25) 0%, rgba(0,0,0,0) 65%),
            radial-gradient(50% 50% at 75% 65%, rgba(0,163,255,0.20) 0%, rgba(0,0,0,0) 70%),
            linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.65) 100%);
          transform: translate3d(0,0,0);
          will-change: transform;
        }

        .tintMove{
          animation: tintMove 7s ease-in-out infinite alternate;
        }
        @keyframes tintMove{
          0%   { transform: translate3d(-2%, -2%, 0) rotate(-1deg) scale(1.02); }
          50%  { transform: translate3d(2%, -1%, 0) rotate(1deg)  scale(1.04); }
          100% { transform: translate3d(1%, 2%, 0) rotate(-0.5deg) scale(1.03); }
        }

        /* --- COMPLEX ANIMATION LAYERS --- */

        /* Wrapper positions it massive in center */
        .blobs-wrapper {
            position: absolute;
            inset: -100%;
            pointer-events: none;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* Container handles the SPIN -> SLIDE -> MIX Sequence */
        .blobs-container {
            width: 100%;
            height: 100%;
            animation: spinSlideMix 12s cubic-bezier(0.4, 0.0, 0.2, 1) infinite;
            will-change: transform;
        }
        
        /* 
           Sequence:
           0-35%: Fast Spin (Rotate 0 -> 180)
           35-65%: Slide (Translate X/Y while holding rotation)
           65-100%: Spin Mix (Rotate 180 -> 360 + Pulse)
        */
        @keyframes spinSlideMix {
            /* Phase 1: Spin */
            0% { transform: rotate(0deg) translate3d(0,0,0) scale(1); }
            30% { transform: rotate(180deg) translate3d(0,0,0) scale(1.1); }
            
            /* Phase 2: Slide */
            40% { transform: rotate(190deg) translate3d(10%, 5%, 0) scale(1); }
            55% { transform: rotate(170deg) translate3d(-10%, -5%, 0) scale(1); }

            /* Phase 3: Spin Mix */
            65% { transform: rotate(180deg) translate3d(0,0,0) scale(0.9); }
            100% { transform: rotate(360deg) translate3d(0,0,0) scale(1); }
        }

        .blobs{
          position:absolute;
          inset:0;
          filter: blur(40px);
          opacity:0.9;
          mix-blend-mode: screen;
          transform: translateZ(0); 
        }

        .blob{
          position:absolute;
          width: 40%;
          height: 40%;
          border-radius: 999px;
          opacity: 0.7;
          will-change: transform, background;
        }

        /* Inner Blob Pulse - High Speed */
        .b1{
          top: 0; left: 0;
          background: radial-gradient(circle at 50% 50%, rgba(0,255,157,0.4), rgba(0,0,0,0) 70%);
          transform-origin: 60% 60%;
          animation: pulseMove 2.5s ease-in-out infinite alternate;
        }
        .b2{
          bottom: 0; right: 0;
          background: radial-gradient(circle at 50% 50%, rgba(0,163,255,0.35), rgba(0,0,0,0) 70%);
          transform-origin: 40% 40%;
          animation: pulseMove 3s ease-in-out infinite alternate-reverse;
        }
        .b3{
          top: 0; right: 0;
          background: radial-gradient(circle at 50% 50%, rgba(0, 255, 200, 0.3), rgba(0,0,0,0) 70%);
          transform-origin: 30% 70%;
          animation: pulseMove 2s ease-in-out infinite alternate;
        }
        .b4{
          bottom: 0; left: 0;
          background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15), rgba(0,0,0,0) 70%);
          transform-origin: 70% 30%;
          animation: pulseMove 3.5s ease-in-out infinite alternate-reverse;
        }

        @keyframes pulseMove {
          0% { transform: scale(1.0) translate(0, 0); }
          100% { transform: scale(1.2) translate(5%, 5%); }
        }

        .content{
          position:relative;
          z-index:2;
          width:100%;
          color:white;
        }
      `}</style>
    </section>
  );
}
