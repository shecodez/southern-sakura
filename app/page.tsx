"use client";

import { SakuraPetals } from "@/components/sakura-petals";
import { ValentineCard } from "@/components/valentine-card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LanguageProvider, useLanguage } from "@/lib/language-context";

function ValentineContent() {
  const { t } = useLanguage();

  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      <SakuraPetals />

      {/* Language switcher */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      {/* Decorative background elements */}
      <div className="absolute top-10 left-10 w-32 h-32 md:w-48 md:h-48 rounded-full bg-sakura-pink/20 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 md:w-56 md:h-56 rounded-full bg-sakura-light/40 blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary/10 blur-2xl" />

      {/* Main content */}
      <div className="relative z-20 flex items-center justify-center min-h-screen px-4">
        <div className="bg-sakura-white/30 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl border border-sakura-pink/30 max-w-xl w-full">
          <ValentineCard />
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-10 pb-8 text-center">
        <p className="text-sm text-muted-foreground/70">
          {t.footer}
        </p>
      </footer>
    </main>
  );
}

export default function ValentinePage() {
  return (
    <LanguageProvider>
      <ValentineContent />
    </LanguageProvider>
  );
}
