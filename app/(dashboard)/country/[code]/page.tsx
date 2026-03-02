import { notFound } from "next/navigation";
import { CountryBrief } from "@/components/intelligence/country-brief";

const COUNTRY_NAMES: Record<string, string> = {
  UA: "Ukraine", SD: "Sudan", PS: "Palestine", MM: "Myanmar", SY: "Syria",
  YE: "Yemen", SO: "Somalia", HT: "Haiti", CD: "DR Congo", ML: "Mali",
  BF: "Burkina Faso", LB: "Lebanon", IR: "Iran", RU: "Russia", IL: "Israel",
  KP: "North Korea", TW: "Taiwan", VE: "Venezuela", AF: "Afghanistan",
  PK: "Pakistan", CN: "China", SA: "Saudi Arabia", TR: "Turkey", AE: "UAE",
  US: "United States", GB: "United Kingdom", DE: "Germany", FR: "France",
  JP: "Japan", IN: "India", BR: "Brazil", MX: "Mexico", EG: "Egypt",
  IQ: "Iraq", KR: "South Korea", QA: "Qatar",
};

const FLAGS: Record<string, string> = {
  UA: "🇺🇦", SD: "🇸🇩", PS: "🇵🇸", MM: "🇲🇲", SY: "🇸🇾", YE: "🇾🇪", SO: "🇸🇴",
  HT: "🇭🇹", CD: "🇨🇩", ML: "🇲🇱", BF: "🇧🇫", LB: "🇱🇧", IR: "🇮🇷", RU: "🇷🇺",
  IL: "🇮🇱", KP: "🇰🇵", TW: "🇹🇼", VE: "🇻🇪", AF: "🇦🇫", PK: "🇵🇰", CN: "🇨🇳",
  SA: "🇸🇦", TR: "🇹🇷", AE: "🇦🇪", US: "🇺🇸", GB: "🇬🇧", DE: "🇩🇪", FR: "🇫🇷",
  JP: "🇯🇵", IN: "🇮🇳", BR: "🇧🇷", MX: "🇲🇽", EG: "🇪🇬", IQ: "🇮🇶", KR: "🇰🇷", QA: "🇶🇦",
};

export async function generateStaticParams() {
  return Object.keys(COUNTRY_NAMES).map((code) => ({ code }));
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const name = COUNTRY_NAMES[code.toUpperCase()];
  return { title: name ? `${name} — WorldView` : "Country Brief — WorldView" };
}

export default async function CountryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const upper = code.toUpperCase();
  const name = COUNTRY_NAMES[upper];
  if (!name) notFound();

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">{FLAGS[upper] ?? ""}</span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">{name}</h1>
          <p className="text-sm text-text-muted font-mono">{upper}</p>
        </div>
      </div>
      <CountryBrief code={upper} name={name} />
    </div>
  );
}
