"use client";

import { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export type Language = "en" | "ja"; //| "zh";

type Translations = {
  title: string;
  subtitle: string;
  yesButton: string;
  yesResponse: string;
  yesSubtext: string;
  hintMild: string;
  hintStrong: string;
  footer: string;
  noMessages: string[];
};

const translations: Record<Language, Translations> = {
  en: {
    title: "Ray, Will you be Jan's Valentine?",
    subtitle: "She promises a lot of laughter, warmth, and a little black girl magic. ;)",
    yesButton: "Yes!",
    yesResponse: "Yay! I knew you’d say yes!",
    yesSubtext: "I can’t wait to spend Valentine’s Day with you!",
    hintMild: "The yes button is looking pretty tempting…",
    hintStrong: "Come on—just say yes already!",
    footer: "Made with love, just for you",
    noMessages: [
      "No",
      "No?!?",
      "Are you sure?",
      "Really sure?",
      "Please…",
      "Think again!",
      "Come on…",
      "Seriously?",
      "I mean it…",
      "One more thought?",
      "Are you absolutely sure?",
      "You might regret this!",
      "Have a heart!",
      "Don’t be so cold!",
      "Second thoughts?",
      "Would you reconsider?",
      "Is that your final answer?",
      "Just say yes already!",
      "You’re breaking my heart ;(",
    ],
  },
  
  ja: {
    title: "レイ、ジャンのバレンタインになってくれる？",
    subtitle: "彼女は、毎瞬を特別にして、笑顔と幸せでいっぱいにすると約束してるよ。",
    yesButton: "うん！",
    yesResponse: "やった！そう言ってくれるって信じてた！",
    yesSubtext: "バレンタインを一緒に過ごせるの、楽しみすぎる！",
    hintMild: "「はい」って、なんだか魅力的に見えてきたでしょ…？",
    hintStrong: "ほら、もう「はい」でいいじゃん！",
    footer: "大切なあなたへ、愛を込めて",
    noMessages: [
      "いや",
      "えっ！？",
      "本当に？",
      "マジで？",
      "お願い…",
      "もう一回考えて！",
      "ねぇ…",
      "さすがに嘘でしょ？",
      "本気なんだけど…",
      "もう一度だけ考えて？",
      "本当に本当にいいの？",
      "後悔するかもよ？",
      "冷たすぎない？",
      "気持ち変わらない？",
      "考え直してくれない？",
      "それで最終決定？",
      "もう「はい」でよくない？",
      "心が折れそう… ૮(˶ㅠ︿ㅠ)ა",
    ],
  },

  /*zh: {
    title: "Ray，你願意當 Jan 的情人嗎？",
    subtitle: "她答應，會讓每一刻都變得特別，讓你的每一天充滿笑聲與幸福。",
    yesButton: "願意！",
    yesResponse: "耶！我就知道你會答應！",
    yesSubtext: "好期待和你一起過情人節！",
    hintMild: "那個「願意」看起來是不是越來越吸引人了…",
    hintStrong: "來啦，直接答應就好嘛！",
    footer: "滿滿的愛，送給特別的你",
    noMessages: [
      "不要",
      "蛤！？",
      "你確定？",
      "真的確定嗎？",
      "拜託啦…",
      "再想一下嘛！",
      "欸…",
      "不會吧？",
      "我是認真的喔…",
      "再考慮一次？",
      "你真的很確定嗎？",
      "這可能會後悔喔！",
      "有點良心好嗎！",
      "別這麼冷淡嘛！",
      "改變心意了嗎？",
      "這是最後的答案？",
      "就說願意啦！",
      "你傷到我的心了 ;(",
    ],
  },*/
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const hasInitialized = useRef(false);
  
  // Get language from URL parameter or default to "en"
  const urlLang = searchParams.get("lang") as Language | null;
  const language = urlLang && (urlLang === "en" || urlLang === "ja") ? urlLang : "en";

  // Set initial language in URL if not present (only once)
  useEffect(() => {
    if (!hasInitialized.current && !urlLang) {
      hasInitialized.current = true;
      const params = new URLSearchParams(searchParams.toString());
      params.set("lang", "en");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [urlLang, pathname, router, searchParams]);

  // Function to update URL (which will cause re-render with new language)
  const setLanguage = (lang: Language) => {
    // Update URL with new language parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", lang);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}