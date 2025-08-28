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
    taxPercentage: number;
}

interface DrawTheWinnerData {
    winner: string;
    winAmount: number;
}

interface LastWinnerData {
    lastWinner: string;
    lastWinAmount: number;
    lastWinnerChance: number;
}

interface BestWinner {
    username: string;
    amount: number;
    chance: number;
}

interface BestWinnersData {
    winners: BestWinner[];
}

interface LuckyGuy {
    username: string;
    amount: number;
    chance: number;
}

interface LuckyGuysData {
    winners: LuckyGuy[];
}

declare global {
    interface Window {
        electronAPI: {
            drawTheWinner: () => Promise<DrawTheWinnerData>;
            onDashboardUpdate: (callback: (data: DashboardData) => void) => void;
            onLastWinnerUpdate: (callback: (data: LastWinnerData) => void) => void;
            onBestWinnersUpdate: (callback: (data: BestWinnersData) => void) => void;
            onLuckyGuysUpdate: (callback: (data: LuckyGuysData) => void) => void;
            onViewerConfigUpdate: (callback: (data: ViewerConfig) => void) => void;
            removeViewerConfigUpdate?: (callback: (data: ViewerConfig) => void) => void;
            setViewerConfig?: (config: ViewerConfig) => Promise<void>;
        };
    }
}
