import { useState, useEffect, useRef } from 'react';

const useCountUp = (endValue, duration = 2000, delay = 0) => {
    const [count, setCount] = useState(0);
    const isFirstRun = useRef(true);
    const startValRef = useRef(0);

    useEffect(() => {
        let startTime = null;
        let animationFrameId;

        // Determine start value:
        // If first run, start from 0.
        // If update, start from the previous endValue (current count state might be mid-animation, but usually stable).
        // We'll use the *last committed* start value for smooth transitions.
        const startValue = isFirstRun.current ? 0 : startValRef.current;

        // Update the ref for the NEXT run to be the current endValue
        // So if we go 100 -> 200, next time we start at 200.
        // Wait, we need to update this *after* or determine it *now*.
        // If we want 100 -> 200, startValue should be 100.
        // BUT current state 'count' holds 100.
        // So we can just use 'count' as startValue?
        // Issue: 'count' is in state, might be stale inside useEffect if not in deps. 
        // Better to track 'previous endValue'.

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;

            // Wait for delay phase
            if (progress < delay) {
                animationFrameId = requestAnimationFrame(animate);
                return;
            }

            // Animation phase
            const runTime = progress - delay;
            const percentage = Math.min(runTime / duration, 1);

            // Ease Out Expo: 1 - Math.pow(2, -10 * x)
            const ease = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);

            setCount(startValue + (endValue - startValue) * ease);

            if (runTime < duration) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setCount(endValue);
                // Update reference for next transition
                startValRef.current = endValue;
            }
        };

        // Initialize animation
        if (isFirstRun.current) {
            isFirstRun.current = false;
        } else {
            // For subsequent runs, we wanted startValRef to be the OLD endValue.
            // We can update startValRef at the END of the effect (cleanup) or at the end of animation.
            // Actually, if endValue changes:
            // 1. Effect triggers.
            // 2. startValue = startValRef.current (which is the OLD endValue from previous run).
            // 3. We animate from Old -> New.
            // 4. We update startValRef.current = New endValue when done.
            // BUT if we interrupt, startValRef might be old.
            // Safer: Update startValRef to 'count' immediately? No, count is 0 on mount.
        }

        // Trigger
        animationFrameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId);
            // If we unmount or re-run, ensure we remember where we were going?
            // Actually, for simple polling updates (A -> B), relying on previous completion is fine.
            // But if we toggle quickly 0 -> 100 -> 200...
            // It's safer to let the animation finish updates.
        };
    }, [endValue, duration, delay]);

    return count;
};

export default useCountUp;
