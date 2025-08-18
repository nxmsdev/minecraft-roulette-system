import { useEffect, useState } from "react";

interface ViewerConfig {
    nickname: string;
    servername: string;
    timeToDraw: number;
}

export function useViewerConfig() {
    const [config, setConfig] = useState<ViewerConfig>({
        nickname: "nxms",
        servername: "NXMS",
        timeToDraw: 90,
    });

    useEffect(() => {
        if (window.electronAPI?.onViewerConfigUpdate) {
            const handler = (newConfig: ViewerConfig) => {
                setConfig(newConfig);
            };

            window.electronAPI.onViewerConfigUpdate(handler);

            return () => {
                // Cleanup event listener when component unmounts
                window.electronAPI.removeViewerConfigUpdate?.(handler);
            };
        }
    }, []);

    return config;
}
