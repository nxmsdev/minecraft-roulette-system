import { useEffect, useState } from "react";

export interface LastWinnerData {
    lastWinner: string;
    lastWinAmount: number;
    lastWinnerChance: number;
}

export function useLastWinner() {
    const [data, setData] = useState<LastWinnerData>({
        lastWinner: "",
        lastWinAmount: 0,
        lastWinnerChance: 0
    });

    useEffect(() => {
        if (!window.electronAPI?.onLastWinnerUpdate) return;

        window.electronAPI.onLastWinnerUpdate((returnedData: LastWinnerData) => {
            setData(returnedData);
        });
    }, []);

    return data;
}
