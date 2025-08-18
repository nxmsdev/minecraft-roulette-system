/// <reference types="vite/client" />

export {};

interface DashboardData {
    playerData: { username: string, amount: number }[];
    playerCount: number;
    sumAmount: number;
    winAmount: number;
    taxAmount: number;
    rouletteStatus: boolean;
}

declare global {
    interface Window {
        electronAPI: {
            drawTheWinner: () =>  Promise<string>;
            onDashboardUpdate: (callback: (data: DashboardData) => void) => void;
        };
    }
}
