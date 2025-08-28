import { useEffect, useState } from "react";

interface LuckyGuy {
    username: string;
    amount: number;
    chance: number;
}

interface LuckyGuysData {
    winners: LuckyGuy[];
}

export function useLuckyGuys() {
    const [data, setData] = useState<LuckyGuysData>({
        winners: []
    });

    useEffect(() => {
        if (!window.electronAPI?.onLuckyGuysUpdate) return;

        window.electronAPI.onLuckyGuysUpdate((returnedData: LuckyGuysData) => {
            setData(returnedData);
        });
    }, []);

    return data;
}
