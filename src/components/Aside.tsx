import "./Aside.css"
import {useLastWinner} from "../hooks/useLastWinner.ts";
import {useBestWinners} from "../hooks/useBestWinners.ts";

export default function Aside() {
    let lastWinnerData = useLastWinner();
    let lastWinnerHead: string = `https://mc-heads.net/avatar/${lastWinnerData.lastWinner}`;

    let bestWinnersData = useBestWinners();

    const bestWinners = bestWinnersData.winners
        .slice(0, 3)
        .map((winner, _index) => (
            <div className="best_winners" key={winner.username}>
                <img className={"aside_player_head"} src={`https://mc-heads.net/avatar/${winner.username}`} alt="player_head"></img>
                <div className="best_winner_name" id="grey_text">{winner.username}</div>
                <div id="grey_text">|</div>
                <div className="best_winner_amount" id="yellow_text">{winner.amount}$</div>
                <div id="grey_text">|</div>
                <div className="best_winner_amount" id="grey_text">{winner.chance}%</div>
            </div>
        ));

    return (
        <aside className="aside">
            <div className="last_round_result">
                <div className="title">Wynik ostatniej rundy:</div>
                <div className="list" id="grey_text">
                    <img className={"aside_player_head"} src={lastWinnerHead} alt="player_head"></img>
                    <div className="last_winner_name">
                        <div id="grey_text">Ostatni wygrany:</div>
                        <div id="yellow_text">{lastWinnerData.lastWinner || "Brak wygranego"}</div>
                    </div>
                    <div className="last_winner_amount">
                        <div id="grey_text">Wygrana kwota:</div>
                        <div id="yellow_text">{lastWinnerData.lastWinAmount}$</div>
                    </div>
                    <div className="last_winner_chance">
                        <div id="grey_text">Szansa wygrania:</div>
                        <div id="yellow_text">{lastWinnerData.lastWinnerChance}%</div>
                    </div>
                </div>
            </div>
            <div className="winners">
                <div className="title">Najlepsze wygrane dnia:</div>
                <div className="list" id="grey_text">
                    {bestWinners}
                </div>
            </div>
            <div className="top_payments">
                <div className="title">Najwiecej rozegranych $:</div>
                <div className="list" id="grey_text">W przyszlosci</div>
            </div>
            <div className="chat">Chat</div>
        </aside>
    );
}