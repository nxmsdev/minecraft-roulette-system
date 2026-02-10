import { useTranslations } from "../hooks/useTranslations.ts";

interface ShowWinnerProps {
    username: string;
    amount: number;
}

export default function ShowWinner({ username, amount }: ShowWinnerProps) {
    const translation = useTranslations();

    return (
        <div className="show_winner_container">
            <div className="show_winner_title" id="grey_text">{translation.winner}</div>
            <div className="show_winner_username" id="yellow_text">{username}</div>
            <div className="show_winner_amount">{amount}$</div>
        </div>
    );
}
