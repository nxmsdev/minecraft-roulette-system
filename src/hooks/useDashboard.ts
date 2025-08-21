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
    const [data, setData] = useState<DashboardData>({
        playerData: [],
        playerCount: 0,
        sumAmount: 0,
        winAmount: 0,
        taxAmount: 0,
        rouletteStatus: false,
    });

    useEffect(() => {
        if (!window.electronAPI?.onDashboardUpdate) return;

        window.electronAPI.onDashboardUpdate((returnedData: DashboardData) => {
            setData(returnedData);
        });
    }, []);

    return data;
}
