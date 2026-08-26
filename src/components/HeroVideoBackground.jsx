import React from "react";

/**
 * Drop this component into your homepage hero.
 * Put your video file in /public/videos/ (Next.js) or /public/videos/ (CRA/Vite).
 * Then set videoSrc to: "/videos/your-file.mp4" (recommended)
 */
export default function HeroVideoBackground({
    videoSrc = "/videos/animated-bg.mp4",
    poster = "/images/hero-poster.jpg", // optional fallback image
    overlayOpacity = 0.45,
    children,
}) {
    return (
        <section style={styles.hero}>
            {/* Background video */}
            <video
                style={styles.video}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                poster={poster}
                aria-hidden="true"
            >
                {/* Best practice: provide multiple formats */}
                <source src={videoSrc} type="video/mp4" />
                {/* If you also export a webm version, add it above for better compression */}
                {/* <source src="/videos/animated-bg.webm" type="video/webm" /> */}
            </video>

            {/* Dark overlay for readability */}
            <div
                style={{
                    ...styles.overlay,
                    opacity: overlayOpacity,
                }}
                aria-hidden="true"
            />

            {/* Optional gradient tint (matches the “dark gradient” vibe) */}
            <div style={styles.gradientTint} aria-hidden="true" />

            {/* Foreground content */}
            <div style={styles.content}>
                {children ?? (
                    <div style={{ maxWidth: 860 }}>
                        <h1 style={styles.h1}>Your Hero Headline</h1>
                        <p style={styles.p}>
                            Short subheadline here. This sits above the animated background video.
                        </p>
                        <div style={styles.ctaRow}>
                            <a href="#start" style={styles.primaryBtn}>Get Started</a>
                            <a href="#learn" style={styles.secondaryBtn}>Learn More</a>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

const styles = {
    hero: {
        position: "relative",
        width: "100%",
        minHeight: "85vh",
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
        background: "#05060a", // fallback if video doesn't load
    },
    video: {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center",
        transform: "scale(1.03)", // tiny scale to avoid edge lines
        filter: "saturate(1.05) contrast(1.05)",
    },
    overlay: {
        position: "absolute",
        inset: 0,
        background: "black",
    },
    gradientTint: {
        position: "absolute",
        inset: 0,
        /* 
           UPDATED: Tweaked to use FydBlock colors:
           1. Top-Left-ish: Green (#00FF9D) - rgba(0, 255, 157, ...)
           2. Bottom-Right-ish: Blue (#00A3FF) - rgba(0, 163, 255, ...)
        */
        background:
            "radial-gradient(60% 60% at 30% 20%, rgba(0, 255, 157, 0.15) 0%, rgba(0,0,0,0) 55%)," +
            "radial-gradient(60% 60% at 70% 60%, rgba(0, 163, 255, 0.12) 0%, rgba(0,0,0,0) 60%)," +
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.65) 100%)",
        mixBlendMode: "screen",
        pointerEvents: "none",
    },
    content: {
        position: "relative",
        zIndex: 2,
        width: "100%", // Changed from min(1100px) to let children handle width
        height: "100%",
        color: "white",
    },
    // Default text styles kept just in case fallback is used
    h1: {
        fontSize: "clamp(36px, 5vw, 64px)",
        lineHeight: 1.05,
        margin: 0,
        letterSpacing: "-0.02em",
    },
    p: {
        fontSize: "clamp(16px, 1.6vw, 20px)",
        lineHeight: 1.5,
        marginTop: 16,
        opacity: 0.9,
        maxWidth: 720,
    },
    ctaRow: {
        display: "flex",
        gap: 12,
        marginTop: 24,
        flexWrap: "wrap",
    },
    primaryBtn: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px 16px",
        borderRadius: 14,
        background: "rgba(0, 255, 157, 0.95)", // Updated to Green
        color: "#0b0b0b",
        textDecoration: "none",
        fontWeight: 700,
    },
    secondaryBtn: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px 16px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.10)",
        color: "white",
        textDecoration: "none",
        border: "1px solid rgba(255,255,255,0.18)",
        backdropFilter: "blur(8px)",
    },
};
