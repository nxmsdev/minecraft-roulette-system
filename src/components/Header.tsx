import "./Header.css";
import { useEffect, useState } from "react";
import ShowWinner from "./ShowWinner.tsx";
import RouletteStatus from "./RouletteStatus.tsx";
import { useDashboard } from "../hooks/useDashboard.ts";
import { useViewerConfig } from "../hooks/useViewerConfig.ts";

export default function Header() {
    const viewerConfig = useViewerConfig();
    const dashboard = useDashboard();

    const [rouletteStatus, setRouletteStatus] = useState<boolean>(false);
    const [rouletteStatusOpacity, setRouletteStatusOpacity] = useState<number>(1);

    const [timeLeftToDraw, setTimeLeftToDraw] = useState<number>(0);
    const [winner, setWinner] = useState<string>("");
    const [winnerAmount, setWinnerAmount] = useState<number>(0);
    const [winnerOpacity, setWinnerOpacity] = useState<number>(0);
    const [winnerAnimating, setWinnerAnimating] = useState<boolean>(false);

    const [readyToStart, setReadyToStart] = useState<boolean>(false);
    const timeToDraw = viewerConfig.timeToDraw;
    const showWinnerBeforeFade = 3; // seconds
    const animationFadeDuration = 200; // ms

    // Update readyToStart based on player count
    useEffect(() => {
        setReadyToStart(dashboard.playerCount >= 2);
    }, [dashboard.playerCount]);

    // Update roulette status from dashboard
    useEffect(() => {
        if (!readyToStart || !rouletteStatus) {
            setRouletteStatus(dashboard.rouletteStatus);
        }
    }, [dashboard.rouletteStatus, readyToStart, rouletteStatus]);

    // Animate roulette opacity
    useEffect(() => {
        // Fade roulette out if game inactive, otherwise fade in after winner finishes
        if (!winnerAnimating) {
            setRouletteStatusOpacity(rouletteStatus ? 0 : 1);
        }
    }, [rouletteStatus, winnerAnimating]);

    // Countdown timer
    useEffect(() => {
        let timerID: ReturnType<typeof setInterval> | null = null;

        if (readyToStart && rouletteStatus) {
            setTimeLeftToDraw(timeToDraw);
            timerID = setInterval(() => {
                setTimeLeftToDraw((prev) => {
                    if (prev <= 1) {
                        drawTheWinner().catch(console.error);
                        return timeToDraw;
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
    }, [readyToStart, rouletteStatus]);

    // Draw winner
    async function drawTheWinner() {
        if (window.electronAPI?.drawTheWinner) {
            const result = await window.electronAPI.drawTheWinner();
            setWinner(result.winner);
            setWinnerAmount(result.winAmount);
            setWinnerOpacity(1);
            setWinnerAnimating(true);
        }
    }

    // Winner fade-out effect & synchronized roulette fade-in
    useEffect(() => {
        if (!winner) return;

        const visibleTimeout = setTimeout(() => {
            // Start fading winner out
            setWinnerOpacity(0);

            // Fade roulette in at the same time
            setRouletteStatusOpacity(rouletteStatus ? 0 : 1);

            const fadeEndTimeout = setTimeout(() => {
                setWinner("");
                setWinnerAnimating(false);
            }, animationFadeDuration);

            return () => clearTimeout(fadeEndTimeout);
        }, showWinnerBeforeFade * 1000);

        return () => clearTimeout(visibleTimeout);
    }, [winner, rouletteStatus]);

    return (
        <>
            <div
                className="show_winner"
                style={{ opacity: winnerOpacity, transition: `opacity ${animationFadeDuration}ms linear` }}
            >
                <ShowWinner username={winner} amount={winnerAmount} />
            </div>

            <div
                className="roulette_status"
                style={{ opacity: rouletteStatusOpacity, transition: `opacity ${animationFadeDuration}ms linear` }}
            >
                <RouletteStatus />
            </div>

            <header className="header">
                <div className="header_title">Ruletka {viewerConfig.servername}</div>
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
