// useDashboard.ts
import { useEffect, useState } from "react";

export interface DashboardData {
    playerData: { username: string; amount: number }[];
    playerCount: number;
    sumAmount: number;
    winAmount: number;
    taxAmount: number;
    rouletteStatus: boolean;
}

export function useDashboard() {
    const [dashboard, setDashboard] = useState<DashboardData>({
        playerData: [],
        playerCount: 0,
        sumAmount: 0,
        winAmount: 0,
        taxAmount: 0,
        rouletteStatus: false,
    });

    useEffect(() => {
        if (!window.electronAPI?.onDashboardUpdate) return;

        window.electronAPI.onDashboardUpdate((data: DashboardData) => {
            setDashboard(data);
        });
    }, []);

    return dashboard;
}
