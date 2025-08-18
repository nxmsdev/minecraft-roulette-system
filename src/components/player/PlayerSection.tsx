import "./PlayerSection.css";
import PlayerContainer from "./PlayerContainer.tsx";
import { useDashboard } from "../../hooks/useDashboard.ts";
import {useViewerConfig} from "../../hooks/useViewerConfig.ts";

export default function PlayerSection() {
    const nickname = useViewerConfig().nickname;
    const amountOfBetsShown = 30;

    const dashboard = useDashboard();

    const calculateWinChance = (amount: number, totalAmount: number) =>
        totalAmount === 0 ? 0 : parseFloat(((amount / totalAmount) * 100).toFixed(2));

    const playerContainers = dashboard.playerData
        .slice(0, amountOfBetsShown)
        .map((player) => (
            <PlayerContainer
                key={player.username}
                username={player.username}
                amount={player.amount}
                winChance={calculateWinChance(player.amount, dashboard.sumAmount)}
            />
        ));

    return (
        <div className="player_section">
            <div className="player_section_top">
                <div className="amount_of_bets" id="grey_text">
                    Pierwsze 30 najwiekszych zakladow:
                </div>
                <div className="payment_command">
                    <div id="grey_text">Postaw zaklad przez:</div>
                    <div id="yellow_text">/pay {nickname} {"<kwota>"}</div>
                </div>
            </div>
            <div className="player_containers">{playerContainers}</div>
        </div>
    );
}
