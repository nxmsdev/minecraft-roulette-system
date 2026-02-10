import "./PlayerContainer.css";

type PlayerContainerProps = {
    username: string;
    amount: number;
    winChance: number;
    translation: { [key: string]: string };
};

export default function PlayerContainer({ username, amount, winChance, translation }: PlayerContainerProps) {
    const imageURL: string = `https://mc-heads.net/avatar/${username}`;

    function sendPlayerToMain() {
        if (window.electronAPI && window.electronAPI.setRouletteForPlayer) {
            window.electronAPI.setRouletteForPlayer(username);
        }
    }

    return (
        <div className="player_container" onClick={() => sendPlayerToMain()}>
            <img className="player_head" src={imageURL} alt="player_head" />
            <div className="player_username" id="yellow_text">{username}</div>

            <div className="player_info">
                <div id="grey_text">{translation.amount}</div>
                <div>{amount}$</div>
            </div>

            <div className="player_info">
                <div id="grey_text">{translation.chance}</div>
                <div>{winChance}%</div>
            </div>
        </div>
    );
}
