import { useEffect, useState } from "react";

interface Translations {
    [key: string]: string;
}

export function useTranslations() {
    const [translations, setTranslations] = useState<Translations>({});

    useEffect(() => {
        if (window.electronAPI?.onTranslationsUpdate) {
            window.electronAPI.onTranslationsUpdate((data) => {
                setTranslations(data);
            });
        }
    }, []);

    return translations;
}
