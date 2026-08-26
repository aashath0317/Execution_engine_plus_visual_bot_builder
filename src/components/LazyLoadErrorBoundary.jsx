import React from 'react';

// Error Boundary specifically for catching lazy loading chunk failures
class LazyLoadErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("LazyLoadErrorBoundary caught an error:", error, errorInfo);

        const errorStr = (error?.message || error?.stack || String(error) || '').toLowerCase();

        // check if it's a chunk loading error (e.g. new deployment with new hashes)
        const isChunkError =
            errorStr.includes("failed to fetch dynamically imported module") ||
            errorStr.includes("importing a module script failed") ||
            errorStr.includes("missing") ||
            errorStr.includes("chunk") ||
            error?.name === 'ChunkLoadError';

        if (isChunkError) {
            const hasReloaded = sessionStorage.getItem('chunk_reload_attempted');
            if (!hasReloaded) {
                sessionStorage.setItem('chunk_reload_attempted', 'true');
                console.log("Chunk loading error detected. Reloading page to fetch fresh chunks...");
                window.location.reload();
            }
        }
    }

    render() {
        if (this.state.hasError) {
            // If we didn't auto-reload (e.g. not a chunk error, or loop prevention), show fallback
            // For chunk errors, the reload should happen before this renders usually, 
            // but if it persists, show a user friendly message.
            return (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
                    <h2 className="text-xl font-bold text-red-400 mb-2">Something went wrong</h2>
                    <p className="text-gray-400 mb-4">We encountered an issue loading the application resources.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-[#00FF9D] text-black font-bold rounded hover:bg-[#00cc7d] transition-colors"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default LazyLoadErrorBoundary;
