import "./Header.css";
import { useEffect, useState } from "react";
import ShowWinner from "./ShowWinner.tsx";
import RouletteStatus from "./RouletteStatus.tsx";
import { useDashboard } from "../hooks/useDashboard.ts";
import {useViewerConfig } from "../hooks/useViewerConfig.ts";

export default function Header() {
    let servername = useViewerConfig().servername;

    const dashboard = useDashboard();

    const [rouletteStatus, setRouletteStatus] = useState<boolean>(false);
    const [rouletteStatusOpacity, setRouletteStatusOpacity] = useState<number>(1);

    const [timeLeftToDraw, setTimeLeftToDraw] = useState<number>(0);
    const [winnerAmount, setWinnerAmount] = useState<number>(0);
    const [winner, setWinner] = useState<string>("");
    const [winnerOpacity, setWinnerOpacity] = useState<number>(0);
    const [winnerAnimationDone, setWinnerAnimationDone] = useState(false);

    const timeToDraw = useViewerConfig().timeToDraw;
    const showWinnerBeforeFade = 3;

    // Update rouletteStatus when dashboard changes
    useEffect(() => {
        setRouletteStatus(dashboard.rouletteStatus);
    }, [dashboard.rouletteStatus]);

    // Animate rouletteStatus opacity
    useEffect(() => {
        setRouletteStatusOpacity(rouletteStatus ? 0 : 1);
    }, [rouletteStatus]);

    // Countdown timer logic
    useEffect(() => {
        let timerID: ReturnType<typeof setInterval> | null = null;

        if (dashboard.playerCount >= 2 && rouletteStatus) {
            setTimeLeftToDraw(timeToDraw); // reset timer
            timerID = setInterval(() => {
                setTimeLeftToDraw((prev) => {
                    if (prev <= 1) {
                        setWinnerAmount(dashboard.winAmount);
                        drawTheWinner().catch(console.error);
                        return timeToDraw; // reset timer
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            setTimeLeftToDraw(timeToDraw);
        }

        return () => {
            if (timerID) clearInterval(timerID);
        };
    }, [dashboard.playerCount, rouletteStatus]);

    // Draw winner
    async function drawTheWinner() {
        if (window.electronAPI && window.electronAPI.drawTheWinner) {
            const result = await window.electronAPI.drawTheWinner();
            setWinner(result.winner);
            setWinnerAmount(result.winAmount);
            setWinnerOpacity(1);
        }
    }

    // Winner fade-out effect
    useEffect(() => {
        if (!winner) return;

        const visibleTimeout = setTimeout(() => {
            const fadeInterval = setInterval(() => {
                setWinnerOpacity((prev) => {
                    if (prev <= 0) {
                        clearInterval(fadeInterval);
                        setWinnerOpacity(0);
                        setWinnerAnimationDone(true);
                        return 0;
                    }
                    return +(prev - 0.05).toFixed(2);
                });
            }, 50);
        }, showWinnerBeforeFade * 1000);

        return () => clearTimeout(visibleTimeout);
    }, [winner]);

    // Reset roulette status after winner animation
    useEffect(() => {
        if (winnerAnimationDone) {
            setRouletteStatus(dashboard.rouletteStatus);
            setWinnerAnimationDone(false);
        }
    }, [winnerAnimationDone, dashboard.rouletteStatus]);

    return (
        <>
            <div
                className="show_winner"
                style={{ opacity: winnerOpacity, transition: "opacity 200ms linear" }}
            >
                <ShowWinner username={winner} amount={winnerAmount} />
            </div>

            <div
                className="roulette_status"
                style={{ opacity: rouletteStatusOpacity, transition: "opacity 200ms linear" }}
            >
                <RouletteStatus />
            </div>

            <header className="header">
                <div className="header_title">Ruletka {servername}</div>
                <div className="header_counter">
                    <div id="grey_text">Losowanie za: </div>
                    <div id="yellow_text">
                        {dashboard.playerCount >= 2 ? `${timeLeftToDraw}s` : "Za malo graczy"}
                    </div>
                </div>
                <div className="header_right_container">
                    <div className="right_cont_text">
                        <div>Do wygrania:</div>
                        <div id="yellow_text">{dashboard.winAmount}$</div>
                    </div>
                    <div className="right_cont_text">
                        <div id="grey_text">Podatek:</div>
                        <div>{dashboard.taxAmount}$ (8%)</div>
                    </div>
                    <div className="right_cont_text">
                        <div id="grey_text">Pula:</div>
                        <div>{dashboard.sumAmount}$</div>
                    </div>
                </div>
            </header>
        </>
    );
}
