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

interface DrawTheWinner {
    winner: string;
    winAmount: number;
}

declare global {
    interface Window {
        electronAPI: {
            drawTheWinner: () => Promise<DrawTheWinner>;
            onDashboardUpdate: (callback: (data: DashboardData) => void) => void;
            onViewerConfigUpdate: (callback: (data: ViewerConfig) => void) => void;
            removeViewerConfigUpdate?: (callback: (data: ViewerConfig) => void) => void;
            setViewerConfig?: (config: ViewerConfig) => Promise<void>;
        };
    }
}
