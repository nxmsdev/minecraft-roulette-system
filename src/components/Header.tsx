import "./Header.css";
import { useEffect, useState } from "react";
import ShowWinner from "./ShowWinner.tsx";
import RouletteStatus from "./RouletteStatus.tsx";
import { useDashboard } from "../hooks/useDashboard.ts";
import { useViewerConfig } from "../hooks/useViewerConfig.ts";
import { useTranslations } from "../hooks/useTranslations.ts";

export default function Header() {
    const viewerConfig = useViewerConfig();
    const dashboard = useDashboard();
    const translation = useTranslations();

    const [rouletteStatus, setRouletteStatus] = useState<boolean>(false);
    const [rouletteStatusOpacity, setRouletteStatusOpacity] = useState<number>(1);

    const [timeLeftToDraw, setTimeLeftToDraw] = useState<number>(0);
    const [winner, setWinner] = useState<string>("");
    const [winnerAmount, setWinnerAmount] = useState<number>(0);
    const [winnerOpacity, setWinnerOpacity] = useState<number>(0);
    const [winnerAnimating, setWinnerAnimating] = useState<boolean>(false);

    const [readyToStart, setReadyToStart] = useState<boolean>(false);
    const timeToDraw = viewerConfig.timeToDraw;
    const showWinnerBeforeFade = 3;
    const animationFadeDuration = 200;

    useEffect(() => {
        setReadyToStart(dashboard.playerCount >= 2);
    }, [dashboard.playerCount]);

    useEffect(() => {
        if (!readyToStart || !rouletteStatus) {
            setRouletteStatus(dashboard.rouletteStatus);
        }
    }, [dashboard.rouletteStatus, readyToStart, rouletteStatus]);

    useEffect(() => {
        if (!winnerAnimating) {
            setRouletteStatusOpacity(rouletteStatus ? 0 : 1);
        }
    }, [rouletteStatus, winnerAnimating]);

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

    async function drawTheWinner() {
        if (window.electronAPI?.drawTheWinner) {
            const result = await window.electronAPI.drawTheWinner();
            setWinner(result.winner);
            setWinnerAmount(result.winAmount);
            setWinnerOpacity(1);
            setWinnerAnimating(true);
        }
    }

    useEffect(() => {
        if (!winner) return;

        const visibleTimeout = setTimeout(() => {
            setWinnerOpacity(0);
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
            <div className="show_winner" style={{ opacity: winnerOpacity, transition: `opacity ${animationFadeDuration}ms linear` }}>
                <ShowWinner username={winner} amount={winnerAmount}/>
            </div>

            <div className="roulette_status" style={{ opacity: rouletteStatusOpacity, transition: `opacity ${animationFadeDuration}ms linear` }}>
                <RouletteStatus />
            </div>

            <header className="header">
                <div className="header_title">{translation.headerTitle} {viewerConfig.servername}</div>
                <div className="header_counter">
                    <div id="grey_text">{translation.drawIn}</div>
                    <div id="yellow_text">
                        {dashboard.playerCount >= 2 ? `${timeLeftToDraw}s` : translation.notEnoughPlayers}
                    </div>
                </div>
                <div className="header_right_container">
                    <div className="right_cont_text">
                        <div>{translation.winAmount}</div>
                        <div id="yellow_text">{dashboard.winAmount}$</div>
                    </div>
                    <div className="right_cont_text">
                        <div id="grey_text">{translation.tax}</div>
                        <div>{dashboard.taxAmount}$ ({viewerConfig.taxPercentage}%)</div>
                    </div>
                    <div className="right_cont_text">
                        <div id="grey_text">{translation.pool}</div>
                        <div>{dashboard.sumAmount}$</div>
                    </div>
                </div>
            </header>
        </>
    );
}