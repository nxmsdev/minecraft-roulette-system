import "./Aside.css";
import { useLastWinner } from "../hooks/useLastWinner.ts";
import { useBestWinners } from "../hooks/useBestWinners.ts";
import { useLuckyGuys } from "../hooks/useLuckyGuys.ts";
import { useTranslations } from "../hooks/useTranslations.ts";

export default function Aside() {
    const translation = useTranslations();
    const lastWinnerData = useLastWinner();
    const bestWinnersData = useBestWinners();
    const luckyGuysData = useLuckyGuys();

    const bestWinners = bestWinnersData.winners.map((winner) => (
        <div className="best_winners" key={`winner-${winner.username}-${winner.amount}-${winner.chance}`}>
            <img className={"aside_player_head"} src={`https://mc-heads.net/avatar/${winner.username}`} alt="player_head"/>
            <div className="best_winner_name" id="grey_text">{winner.username}</div>
            <div id="grey_text">|</div>
            <div className="best_winner_amount" id="yellow_text">{winner.amount}$</div>
            <div id="grey_text">|</div>
            <div className="best_winner_amount" id="grey_text">{winner.chance}%</div>
        </div>
    ));

    const luckyGuys = luckyGuysData.winners.map((winner) => (
        <div className="lucky_guys" key={`lucky-${winner.username}-${winner.amount}-${winner.chance}`}>
            <img className={"aside_player_head"} src={`https://mc-heads.net/avatar/${winner.username}`} alt="player_head"/>
            <div className="lucky_guy_name" id="grey_text">{winner.username}</div>
            <div id="grey_text">|</div>
            <div className="lucky_guy_amount" id="yellow_text">{winner.amount}$</div>
            <div id="grey_text">|</div>
            <div className="lucky_guy_amount" id="grey_text">{winner.chance}%</div>
        </div>
    ));

    return (
        <aside className="aside">
            <div className="last_round_result">
                <div className="title">{translation.lastRoundResult}</div>
                <div className="list" id="grey_text">
                    <img className={"aside_player_head"} src={`https://mc-heads.net/avatar/${lastWinnerData.lastWinner}`} alt="player_head"/>
                    <div className="last_winner_name">
                        <div id="grey_text">{translation.lastWinner}</div>
                        <div id="yellow_text">{lastWinnerData.lastWinner || translation.noWinner}</div>
                    </div>
                    <div className="last_winner_amount">
                        <div id="grey_text">{translation.lastWinAmount}</div>
                        <div id="yellow_text">{lastWinnerData.lastWinAmount}$</div>
                    </div>
                    <div className="last_winner_chance">
                        <div id="grey_text">{translation.lastWinnerChance}</div>
                        <div id="yellow_text">{lastWinnerData.lastWinnerChance}%</div>
                    </div>
                </div>
            </div>
            <div className="winners">
                <div className="title">{translation.bestWinners}</div>
                <div className="list">{bestWinners}</div>
            </div>
            <div className="lucky">
                <div className="title">{translation.luckyGuys}</div>
                <div className="list">{luckyGuys}</div>
            </div>
            <div className="chat">{translation.chat}</div>
        </aside>
    );
}