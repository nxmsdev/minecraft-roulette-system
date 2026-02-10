import { useEffect, useState } from "react";

interface BestWinner {
    username: string;
    amount: number;
    chance: number;
}

interface BestWinnersData {
    winners: BestWinner[];
}

export function useBestWinners() {
    const [data, setData] = useState<BestWinnersData>({
        winners: []
    });

    useEffect(() => {
        if (!window.electronAPI?.onBestWinnersUpdate) return;

        window.electronAPI.onBestWinnersUpdate((returnedData: BestWinnersData) => {
            setData(returnedData);
        });
    }, []);

    return data;
}
