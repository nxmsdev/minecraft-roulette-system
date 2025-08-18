/// <reference types="vite/client" />

export {};

interface DashboardData {
    playerData: { username: string; amount: number }[];
    playerCount: number;
    sumAmount: number;
    winAmount: number;
    taxAmount: number;
    rouletteStatus: boolean;
}

interface ViewerConfig {
    nickname: string;
    servername: string;
    timeToDraw: number,
}

declare global {
    interface Window {
        electronAPI: {
            drawTheWinner: () => Promise<string>;
            onDashboardUpdate: (callback: (data: DashboardData) => void) => void;
            onViewerConfigUpdate: (callback: (data: ViewerConfig) => void) => void;
            removeViewerConfigUpdate?: (callback: (data: ViewerConfig) => void) => void;
            setViewerConfig?: (config: ViewerConfig) => Promise<void>;
        };
    }
}
