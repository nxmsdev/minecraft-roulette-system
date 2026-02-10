import { useTranslations } from "../hooks/useTranslations.ts";

export default function RouletteStatus() {
    const translation = useTranslations();

    return (
        <>
            <div className="roulette_status_container">
                <div className="roulette_status_title" id="red_text">{translation.rouletteStopped}</div>
                <div className="roulette_status_small" id="grey_text">{translation.betsDisabled}</div>
            </div>
        </>
    );
}
