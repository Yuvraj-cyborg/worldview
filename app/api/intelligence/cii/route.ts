import { NextResponse } from "next/server";

export const revalidate = 3600;

interface CIICountry {
  code: string;
  name: string;
  flag: string;
  score: number;
  level: "critical" | "high" | "medium" | "low" | "info";
  trend: "rising" | "stable" | "falling";
  change: number;
  newsMentions: number;
}

interface CountryProfile {
  code: string;
  name: string;
  flag: string;
  baseline: number;
  keywords: string[];
}

const COUNTRIES: CountryProfile[] = [
  { code: "UA", name: "Ukraine", flag: "🇺🇦", baseline: 85, keywords: ["ukraine", "kyiv", "zelensky", "crimea", "donbas", "kherson", "zaporizhzhia"] },
  { code: "SD", name: "Sudan", flag: "🇸🇩", baseline: 80, keywords: ["sudan", "khartoum", "darfur", "rsf", "hemedti"] },
  { code: "PS", name: "Palestine", flag: "🇵🇸", baseline: 82, keywords: ["gaza", "palestine", "hamas", "rafah", "west bank"] },
  { code: "MM", name: "Myanmar", flag: "🇲🇲", baseline: 72, keywords: ["myanmar", "burma", "junta", "rohingya"] },
  { code: "SY", name: "Syria", flag: "🇸🇾", baseline: 68, keywords: ["syria", "damascus", "assad", "idlib", "aleppo"] },
  { code: "YE", name: "Yemen", flag: "🇾🇪", baseline: 70, keywords: ["yemen", "houthi", "sanaa", "aden", "red sea"] },
  { code: "SO", name: "Somalia", flag: "🇸🇴", baseline: 65, keywords: ["somalia", "mogadishu", "al-shabaab", "shabaab"] },
  { code: "HT", name: "Haiti", flag: "🇭🇹", baseline: 62, keywords: ["haiti", "port-au-prince", "gangs"] },
  { code: "CD", name: "DR Congo", flag: "🇨🇩", baseline: 60, keywords: ["congo", "drc", "goma", "m23", "kivu"] },
  { code: "ML", name: "Mali", flag: "🇲🇱", baseline: 55, keywords: ["mali", "bamako", "jnim", "sahel"] },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫", baseline: 53, keywords: ["burkina faso", "ouagadougou"] },
  { code: "LB", name: "Lebanon", flag: "🇱🇧", baseline: 52, keywords: ["lebanon", "beirut", "hezbollah", "nasrallah"] },
  { code: "IR", name: "Iran", flag: "🇮🇷", baseline: 48, keywords: ["iran", "tehran", "irgc", "khamenei"] },
  { code: "RU", name: "Russia", flag: "🇷🇺", baseline: 42, keywords: ["russia", "kremlin", "putin", "moscow"] },
  { code: "IL", name: "Israel", flag: "🇮🇱", baseline: 45, keywords: ["israel", "idf", "netanyahu", "mossad"] },
  { code: "KP", name: "North Korea", flag: "🇰🇵", baseline: 40, keywords: ["north korea", "pyongyang", "kim jong"] },
  { code: "TW", name: "Taiwan", flag: "🇹🇼", baseline: 30, keywords: ["taiwan", "taipei", "tsmc"] },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", baseline: 38, keywords: ["venezuela", "maduro", "caracas"] },
  { code: "AF", name: "Afghanistan", flag: "🇦🇫", baseline: 60, keywords: ["afghanistan", "kabul", "taliban"] },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", baseline: 35, keywords: ["pakistan", "islamabad", "balochistan"] },
];

export async function GET(request: Request) {
  try {
    const baseUrl = new URL(request.url).origin;
    let headlines: string[] = [];

    try {
      const newsResp = await fetch(`${baseUrl}/api/news/feeds`, {
        signal: AbortSignal.timeout(8000),
      });
      if (newsResp.ok) {
        const newsData = await newsResp.json();
        headlines = (newsData.clusters || []).map(
          (c: { primaryTitle: string }) => c.primaryTitle.toLowerCase()
        );
      }
    } catch {
      // News fetch failed, use baselines only
    }

    const results: CIICountry[] = COUNTRIES.map((country) => {
      let mentions = 0;
      for (const headline of headlines) {
        for (const kw of country.keywords) {
          if (headline.includes(kw)) {
            mentions++;
            break;
          }
        }
      }

      const mentionBoost = Math.min(mentions * 2, 15);
      const score = Math.min(100, Math.max(0, country.baseline + mentionBoost));

      let change = mentionBoost > 5 ? mentionBoost * 0.3 : mentionBoost > 0 ? 0.5 : -0.2;
      change = Math.round(change * 10) / 10;

      const trend: "rising" | "stable" | "falling" =
        change > 1 ? "rising" : change < -0.5 ? "falling" : "stable";

      const level: CIICountry["level"] =
        score >= 80 ? "critical" : score >= 60 ? "high" : score >= 40 ? "medium" : score >= 20 ? "low" : "info";

      return {
        code: country.code,
        name: country.name,
        flag: country.flag,
        score,
        level,
        trend,
        change,
        newsMentions: mentions,
      };
    });

    results.sort((a, b) => b.score - a.score);

    return NextResponse.json({ countries: results, count: results.length });
  } catch (err) {
    console.error("[api/intelligence/cii]", err);
    return NextResponse.json({ countries: [], error: "Failed to compute" }, { status: 500 });
  }
}
