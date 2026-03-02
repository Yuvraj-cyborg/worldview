import type { Feed } from "@/lib/types";

export const SOURCE_TIERS: Record<string, number> = {
  // Tier 1 - Wire Services
  'Reuters': 1,
  'AP News': 1,
  'AFP': 1,
  'Bloomberg': 1,

  // Tier 2 - Major Outlets
  'BBC World': 2,
  'BBC Middle East': 2,
  'Guardian World': 2,
  'Guardian ME': 2,
  'NPR News': 2,
  'CNN World': 2,
  'CNBC': 2,
  'MarketWatch': 2,
  'Al Jazeera': 2,
  'Financial Times': 2,
  'Politico': 2,
  'Axios': 2,
  'EuroNews': 2,
  'France 24': 2,
  'Le Monde': 2,
  // Spanish
  'El País': 2,
  'El Mundo': 2,
  'BBC Mundo': 2,
  // German
  'Tagesschau': 1,
  'Der Spiegel': 2,
  'Die Zeit': 2,
  'DW News': 2,
  // Italian
  'ANSA': 1,
  'Corriere della Sera': 2,
  'Repubblica': 2,
  // Dutch
  'NOS Nieuws': 1,
  'NRC': 2,
  'De Telegraaf': 2,
  // Swedish
  'SVT Nyheter': 1,
  'Dagens Nyheter': 2,
  'Svenska Dagbladet': 2,
  'Reuters World': 1,
  'Reuters Business': 1,
  'Reuters US': 1,
  'Fox News': 2,
  'NBC News': 2,
  'CBS News': 2,
  'The National': 2,
  'Yonhap News': 2,
  'Chosun Ilbo': 2,
  'OpenAI News': 3,
  // Portuguese
  'Brasil Paralelo': 2,

  // Tier 1 - Official Government & International Orgs
  'White House': 1,
  'State Dept': 1,
  'Pentagon': 1,
  'UN News': 1,
  'CISA': 1,
  'Treasury': 2,
  'DOJ': 2,
  'DHS': 2,
  'CDC': 2,
  'FEMA': 2,

  // Tier 3 - Specialty
  'Defense One': 3,
  'Breaking Defense': 3,
  'The War Zone': 3,
  'Defense News': 3,
  'Janes': 3,
  'Military Times': 2,
  'Task & Purpose': 3,
  'USNI News': 2,
  'gCaptain': 3,
  'Oryx OSINT': 2,
  'UK MOD': 1,
  'Foreign Policy': 3,
  'The Diplomat': 3,
  'Bellingcat': 3,
  'Krebs Security': 3,
  'Ransomware.live': 3,
  'Federal Reserve': 3,
  'SEC': 3,
  'MIT Tech Review': 3,
  'Ars Technica': 3,
  'Atlantic Council': 3,
  'Foreign Affairs': 3,
  'CrisisWatch': 3,
  'CSIS': 3,
  'RAND': 3,
  'Brookings': 3,
  'Carnegie': 3,
  'IAEA': 1,
  'WHO': 1,
  'UNHCR': 1,
  'Xinhua': 3,
  'TASS': 3,
  'RT': 3,
  'RT Russia': 3,
  'Layoffs.fyi': 3,
  'BBC Persian': 2,
  'Iran International': 3,
  'Fars News': 3,
  'MIIT (China)': 1,
  'MOFCOM (China)': 1,
  // Turkish
  'BBC Turkce': 2,
  'DW Turkish': 2,
  'Hurriyet': 2,
  // Polish
  'TVN24': 2,
  'Polsat News': 2,
  'Rzeczpospolita': 2,
  // Russian (independent)
  'BBC Russian': 2,
  'Meduza': 2,
  'Novaya Gazeta Europe': 2,
  // Thai
  'Bangkok Post': 2,
  'Thai PBS': 2,
  // Australian
  'ABC News Australia': 2,
  'Guardian Australia': 2,
  // Vietnamese
  'VnExpress': 2,
  'Tuoi Tre News': 2,

  // Tier 2 - Premium Startup/VC Sources
  'Y Combinator Blog': 2,
  'a16z Blog': 2,
  'Sequoia Blog': 2,
  'Crunchbase News': 2,
  'CB Insights': 2,
  'PitchBook News': 2,
  'The Information': 2,

  // Tier 3 - Regional/Specialty Startup Sources
  'EU Startups': 3,
  'Tech.eu': 3,
  'Sifted (Europe)': 3,
  'The Next Web': 3,
  'Tech in Asia': 3,
  'TechCabal (Africa)': 3,
  'Inc42 (India)': 3,
  'YourStory': 3,
  'Paul Graham Essays': 2,
  'Stratechery': 2,
  // Asia - Regional
  'e27 (SEA)': 3,
  'DealStreetAsia': 3,
  'Pandaily (China)': 3,
  '36Kr English': 3,
  'TechNode (China)': 3,
  'China Tech News': 3,
  'The Bridge (Japan)': 3,
  'Japan Tech News': 3,
  'Nikkei Tech': 2,
  'NHK World': 2,
  'Nikkei Asia': 2,
  'Korea Tech News': 3,
  'KED Global': 3,
  'Entrackr (India)': 3,
  'India Tech News': 3,
  'Taiwan Tech News': 3,
  'GloNewswire (Taiwan)': 4,
  // LATAM
  'La Silla Vacía': 3,
  'LATAM Tech News': 3,
  'Startups.co (LATAM)': 3,
  'Contxto (LATAM)': 3,
  'Brazil Tech News': 3,
  'Mexico Tech News': 3,
  'LATAM Fintech': 3,
  // Africa & MENA
  'Wamda (MENA)': 3,
  'Magnitt': 3,
  // Nigeria
  'Premium Times': 2,
  'Vanguard Nigeria': 2,
  'Channels TV': 2,
  'Daily Trust': 3,
  'ThisDay': 2,
  // Greek
  'Kathimerini': 2,
  'Naftemporiki': 2,
  'in.gr': 3,
  'iefimerida': 3,
  'Proto Thema': 3,

  // Tier 3 - Think Tanks
  'Brookings Tech': 3,
  'CSIS Tech': 3,
  'MIT Tech Policy': 3,
  'Stanford HAI': 2,
  'AI Now Institute': 3,
  'OECD Digital': 2,
  'Bruegel (EU)': 3,
  'Chatham House Tech': 3,
  'ISEAS (Singapore)': 3,
  'ORF Tech (India)': 3,
  'RIETI (Japan)': 3,
  'Lowy Institute': 3,
  'China Tech Analysis': 3,
  'DigiChina': 2,
  // Security/Defense Think Tanks
  'RUSI': 2,
  'Wilson Center': 3,
  'GMF': 3,
  'Stimson Center': 3,
  'CNAS': 2,
  // Nuclear & Arms Control
  'Arms Control Assn': 2,
  'Bulletin of Atomic Scientists': 2,
  // Food Security
  'FAO GIEWS': 2,
  'EU ISS': 3,
  // New verified think tanks
  'War on the Rocks': 2,
  'AEI': 3,
  'Responsible Statecraft': 3,
  'FPRI': 3,
  'Jamestown': 3,

  // Tier 3 - Policy Sources
  'Politico Tech': 2,
  'AI Regulation': 3,
  'Tech Antitrust': 3,
  'EFF News': 3,
  'EU Digital Policy': 3,
  'Euractiv Digital': 3,
  'EU Commission Digital': 2,
  'China Tech Policy': 3,
  'UK Tech Policy': 3,
  'India Tech Policy': 3,

  // Tier 2-3 - Podcasts & Newsletters
  'Acquired Podcast': 2,
  'All-In Podcast': 2,
  'a16z Podcast': 2,
  'This Week in Startups': 3,
  'The Twenty Minute VC': 2,
  'Lex Fridman Tech': 3,
  'The Vergecast': 3,
  'Decoder (Verge)': 3,
  'Hard Fork (NYT)': 2,
  'Pivot (Vox)': 2,
  'Benedict Evans': 2,
  'The Pragmatic Engineer': 2,
  'Lenny Newsletter': 2,
  'AI Podcast (NVIDIA)': 3,
  'Gradient Dissent': 3,
  'Eye on AI': 3,
  'How I Built This': 2,
  'Masters of Scale': 2,
  'The Pitch': 3,

  // Tier 4 - Aggregators
  'Hacker News': 4,
  'The Verge': 4,
  'The Verge AI': 4,
  'VentureBeat AI': 4,
  'Yahoo Finance': 4,
  'TechCrunch Layoffs': 4,
  'ArXiv AI': 4,
  'AI News': 4,
  'Layoffs News': 4,

  // Tier 2 - Positive News Sources
  'Good News Network': 2,
  'Positive.News': 2,
  'Reasons to be Cheerful': 2,
  'Optimist Daily': 2,
  'GNN Science': 3,
  'GNN Animals': 3,
  'GNN Health': 3,
  'GNN Heroes': 3,
};

export function getSourceTier(source: string): number {
  return SOURCE_TIERS[source] ?? 4;
}

export const FEEDS: Feed[] = [
  // ── politics ──────────────────────────────────────────────────────────
  { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'politics', tier: 2 },
  { name: 'Guardian World', url: 'https://www.theguardian.com/world/rss', category: 'politics', tier: 2 },
  { name: 'AP News', url: 'https://news.google.com/rss/search?q=site:apnews.com&hl=en-US&gl=US&ceid=US:en', category: 'politics', tier: 1 },
  { name: 'Reuters World', url: 'https://news.google.com/rss/search?q=site:reuters.com+world&hl=en-US&gl=US&ceid=US:en', category: 'politics', tier: 1 },
  { name: 'CNN World', url: 'https://news.google.com/rss/search?q=site:cnn.com+world+news+when:1d&hl=en-US&gl=US&ceid=US:en', category: 'politics', tier: 2 },

  // ── us ────────────────────────────────────────────────────────────────
  { name: 'NPR News', url: 'https://feeds.npr.org/1001/rss.xml', category: 'us', tier: 2 },
  { name: 'Politico', url: 'https://news.google.com/rss/search?q=site:politico.com+when:1d&hl=en-US&gl=US&ceid=US:en', category: 'us', tier: 2 },
  { name: 'Axios', url: 'https://api.axios.com/feed/', category: 'us', tier: 2 },
  { name: 'Fox News', url: 'https://moxie.foxnews.com/google-publisher/us.xml', category: 'us', tier: 2 },
  { name: 'NBC News', url: 'http://feeds.nbcnews.com/feeds/topstories', category: 'us', tier: 2 },
  { name: 'CBS News', url: 'http://www.cbsnews.com/latest/rss/main', category: 'us', tier: 2 },
  { name: 'Reuters US', url: 'http://feeds.reuters.com/Reuters/domesticNews', category: 'us', tier: 1 },

  // ── europe ────────────────────────────────────────────────────────────
  { name: 'France 24', url: 'https://www.france24.com/en/rss', category: 'europe', tier: 2 },
  { name: 'EuroNews', url: 'https://www.euronews.com/rss?format=xml', category: 'europe', tier: 2 },
  { name: 'Le Monde', url: 'https://www.lemonde.fr/en/rss/une.xml', category: 'europe', tier: 2 },
  { name: 'DW News', url: 'https://rss.dw.com/xml/rss-en-all', category: 'europe', tier: 2 },
  // Spanish
  { name: 'El País', url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada', category: 'europe', tier: 2 },
  { name: 'El Mundo', url: 'https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml', category: 'europe', tier: 2 },
  { name: 'BBC Mundo', url: 'https://www.bbc.com/mundo/index.xml', category: 'europe', tier: 2 },
  // German
  { name: 'Tagesschau', url: 'https://www.tagesschau.de/xml/rss2/', category: 'europe', tier: 1 },
  { name: 'Bild', url: 'https://www.bild.de/feed/alles.xml', category: 'europe', tier: 4 },
  { name: 'Der Spiegel', url: 'https://www.spiegel.de/schlagzeilen/tops/index.rss', category: 'europe', tier: 2 },
  { name: 'Die Zeit', url: 'https://newsfeed.zeit.de/index', category: 'europe', tier: 2 },
  // Italian
  { name: 'ANSA', url: 'https://www.ansa.it/sito/notizie/topnews/topnews_rss.xml', category: 'europe', tier: 1 },
  { name: 'Corriere della Sera', url: 'https://www.corriere.it/rss/homepage.xml', category: 'europe', tier: 2 },
  { name: 'Repubblica', url: 'https://www.repubblica.it/rss/homepage/rss2.0.xml', category: 'europe', tier: 2 },
  // Dutch
  { name: 'NOS Nieuws', url: 'https://feeds.nos.nl/nosnieuwsalgemeen', category: 'europe', tier: 1 },
  { name: 'NRC', url: 'https://www.nrc.nl/rss/', category: 'europe', tier: 2 },
  { name: 'De Telegraaf', url: 'https://news.google.com/rss/search?q=site:telegraaf.nl+when:1d&hl=nl&gl=NL&ceid=NL:nl', category: 'europe', tier: 2 },
  // Swedish
  { name: 'SVT Nyheter', url: 'https://www.svt.se/nyheter/rss.xml', category: 'europe', tier: 1 },
  { name: 'Dagens Nyheter', url: 'https://www.dn.se/rss/', category: 'europe', tier: 2 },
  { name: 'Svenska Dagbladet', url: 'https://www.svd.se/feed/articles.rss', category: 'europe', tier: 2 },
  // Turkish
  { name: 'BBC Turkce', url: 'https://feeds.bbci.co.uk/turkce/rss.xml', category: 'europe', tier: 2 },
  { name: 'DW Turkish', url: 'https://rss.dw.com/xml/rss-tur-all', category: 'europe', tier: 2 },
  { name: 'Hurriyet', url: 'https://www.hurriyet.com.tr/rss/anasayfa', category: 'europe', tier: 2 },
  // Polish
  { name: 'TVN24', url: 'https://tvn24.pl/swiat.xml', category: 'europe', tier: 2 },
  { name: 'Polsat News', url: 'https://www.polsatnews.pl/rss/wszystkie.xml', category: 'europe', tier: 2 },
  { name: 'Rzeczpospolita', url: 'https://www.rp.pl/rss_main', category: 'europe', tier: 2 },
  // Greek
  { name: 'Kathimerini', url: 'https://news.google.com/rss/search?q=site:kathimerini.gr+when:2d&hl=el&gl=GR&ceid=GR:el', category: 'europe', tier: 2 },
  { name: 'Naftemporiki', url: 'https://www.naftemporiki.gr/feed/', category: 'europe', tier: 2 },
  { name: 'in.gr', url: 'https://www.in.gr/feed/', category: 'europe', tier: 3 },
  { name: 'iefimerida', url: 'https://www.iefimerida.gr/rss.xml', category: 'europe', tier: 3 },
  { name: 'Proto Thema', url: 'https://news.google.com/rss/search?q=site:protothema.gr+when:2d&hl=el&gl=GR&ceid=GR:el', category: 'europe', tier: 3 },
  // Russia & Ukraine
  { name: 'BBC Russian', url: 'https://feeds.bbci.co.uk/russian/rss.xml', category: 'europe', tier: 2 },
  { name: 'Meduza', url: 'https://meduza.io/rss/all', category: 'europe', tier: 2 },
  { name: 'Novaya Gazeta Europe', url: 'https://novayagazeta.eu/feed/rss', category: 'europe', tier: 2 },
  { name: 'TASS', url: 'https://news.google.com/rss/search?q=site:tass.com+OR+TASS+Russia+when:1d&hl=en-US&gl=US&ceid=US:en', category: 'europe', tier: 3 },
  { name: 'RT', url: 'https://www.rt.com/rss/', category: 'europe', tier: 3 },
  { name: 'RT Russia', url: 'https://www.rt.com/rss/russia/', category: 'europe', tier: 3 },
  { name: 'Kyiv Independent', url: 'https://news.google.com/rss/search?q=site:kyivindependent.com+when:3d&hl=en-US&gl=US&ceid=US:en', category: 'europe', tier: 3 },
  { name: 'Moscow Times', url: 'https://www.themoscowtimes.com/rss/news', category: 'europe', tier: 3 },

  // ── middleeast ────────────────────────────────────────────────────────
  { name: 'BBC Middle East', url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml', category: 'middleeast', tier: 2 },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'middleeast', tier: 2 },
  { name: 'Al Arabiya', url: 'https://news.google.com/rss/search?q=site:english.alarabiya.net+when:2d&hl=en-US&gl=US&ceid=US:en', category: 'middleeast', tier: 2 },
  { name: 'Guardian ME', url: 'https://www.theguardian.com/world/middleeast/rss', category: 'middleeast', tier: 2 },
  { name: 'BBC Persian', url: 'http://feeds.bbci.co.uk/persian/tv-and-radio-37434376/rss.xml', category: 'middleeast', tier: 2 },
  { name: 'Iran International', url: 'https://news.google.com/rss/search?q=site:iranintl.com+when:2d&hl=en-US&gl=US&ceid=US:en', category: 'middleeast', tier: 3 },
  { name: 'Fars News', url: 'https://news.google.com/rss/search?q=site:farsnews.ir+when:2d&hl=en-US&gl=US&ceid=US:en', category: 'middleeast', tier: 3 },
  { name: 'Haaretz', url: 'https://news.google.com/rss/search?q=site:haaretz.com+when:7d&hl=en-US&gl=US&ceid=US:en', category: 'middleeast', tier: 2 },
  { name: 'Arab News', url: 'https://news.google.com/rss/search?q=site:arabnews.com+when:7d&hl=en-US&gl=US&ceid=US:en', category: 'middleeast', tier: 3 },
  { name: 'The National', url: 'https://news.google.com/rss/search?q=site:thenationalnews.com+when:2d&hl=en-US&gl=US&ceid=US:en', category: 'middleeast', tier: 2 },
  { name: 'Oman Observer', url: 'https://www.omanobserver.om/rssFeed/1', category: 'middleeast', tier: 4 },
  { name: 'Asharq Business', url: 'https://asharqbusiness.com/rss.xml', category: 'middleeast', tier: 3 },
  { name: 'Asharq News', url: 'https://asharq.com/snapchat/rss.xml', category: 'middleeast', tier: 3 },

  // ── tech ───────────────────────────────────────────────────────────────
  { name: 'Hacker News', url: 'https://hnrss.org/frontpage', category: 'tech', tier: 4 },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', category: 'tech', tier: 3 },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'tech', tier: 4 },
  { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/', category: 'tech', tier: 3 },

  // ── ai ─────────────────────────────────────────────────────────────────
  { name: 'AI News', url: 'https://news.google.com/rss/search?q=(OpenAI+OR+Anthropic+OR+Google+AI+OR+"large+language+model"+OR+ChatGPT)+when:2d&hl=en-US&gl=US&ceid=US:en', category: 'ai', tier: 4 },
  { name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/', category: 'ai', tier: 4 },
  { name: 'The Verge AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', category: 'ai', tier: 4 },
  { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed', category: 'ai', tier: 3 },
  { name: 'ArXiv AI', url: 'https://export.arxiv.org/rss/cs.AI', category: 'ai', tier: 4 },

  // ── finance ────────────────────────────────────────────────────────────
  { name: 'CNBC', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', category: 'finance', tier: 2 },
  { name: 'MarketWatch', url: 'https://news.google.com/rss/search?q=site:marketwatch.com+markets+when:1d&hl=en-US&gl=US&ceid=US:en', category: 'finance', tier: 2 },
  { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex', category: 'finance', tier: 4 },
  { name: 'Financial Times', url: 'https://www.ft.com/rss/home', category: 'finance', tier: 2 },
  { name: 'Reuters Business', url: 'https://news.google.com/rss/search?q=site:reuters.com+business+markets&hl=en-US&gl=US&ceid=US:en', category: 'finance', tier: 1 },

  // ── gov ────────────────────────────────────────────────────────────────
  { name: 'White House', url: 'https://news.google.com/rss/search?q=site:whitehouse.gov&hl=en-US&gl=US&ceid=US:en', category: 'gov', tier: 1 },
  { name: 'State Dept', url: 'https://news.google.com/rss/search?q=site:state.gov+OR+"State+Department"&hl=en-US&gl=US&ceid=US:en', category: 'gov', tier: 1 },
  { name: 'Pentagon', url: 'https://news.google.com/rss/search?q=site:defense.gov+OR+Pentagon&hl=en-US&gl=US&ceid=US:en', category: 'gov', tier: 1 },
  { name: 'Treasury', url: 'https://news.google.com/rss/search?q=site:treasury.gov+OR+"Treasury+Department"&hl=en-US&gl=US&ceid=US:en', category: 'gov', tier: 2 },
  { name: 'DOJ', url: 'https://news.google.com/rss/search?q=site:justice.gov+OR+"Justice+Department"+DOJ&hl=en-US&gl=US&ceid=US:en', category: 'gov', tier: 2 },
  { name: 'Federal Reserve', url: 'https://www.federalreserve.gov/feeds/press_all.xml', category: 'gov', tier: 3 },
  { name: 'SEC', url: 'https://www.sec.gov/news/pressreleases.rss', category: 'gov', tier: 3 },
  { name: 'CDC', url: 'https://news.google.com/rss/search?q=site:cdc.gov+OR+CDC+health&hl=en-US&gl=US&ceid=US:en', category: 'gov', tier: 2 },
  { name: 'FEMA', url: 'https://news.google.com/rss/search?q=site:fema.gov+OR+FEMA+emergency&hl=en-US&gl=US&ceid=US:en', category: 'gov', tier: 2 },
  { name: 'DHS', url: 'https://news.google.com/rss/search?q=site:dhs.gov+OR+"Homeland+Security"&hl=en-US&gl=US&ceid=US:en', category: 'gov', tier: 2 },
  { name: 'UN News', url: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml', category: 'gov', tier: 1 },
  { name: 'CISA', url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml', category: 'gov', tier: 1 },

  // ── layoffs ────────────────────────────────────────────────────────────
  { name: 'Layoffs.fyi', url: 'https://news.google.com/rss/search?q=tech+company+layoffs+announced&hl=en&gl=US&ceid=US:en', category: 'layoffs', tier: 3 },
  { name: 'TechCrunch Layoffs', url: 'https://techcrunch.com/tag/layoffs/feed/', category: 'layoffs', tier: 4 },
  { name: 'Layoffs News', url: 'https://news.google.com/rss/search?q=(layoffs+OR+"job+cuts"+OR+"workforce+reduction")+when:3d&hl=en-US&gl=US&ceid=US:en', category: 'layoffs', tier: 4 },

  // ── thinktanks ─────────────────────────────────────────────────────────
  { name: 'Foreign Policy', url: 'https://foreignpolicy.com/feed/', category: 'thinktanks', tier: 3 },
  { name: 'Atlantic Council', url: 'https://www.atlanticcouncil.org/feed/', category: 'thinktanks', tier: 3 },
  { name: 'Foreign Affairs', url: 'https://www.foreignaffairs.com/rss.xml', category: 'thinktanks', tier: 3 },
  { name: 'CSIS', url: 'https://news.google.com/rss/search?q=site:csis.org+when:7d&hl=en-US&gl=US&ceid=US:en', category: 'thinktanks', tier: 3 },
  { name: 'RAND', url: 'https://news.google.com/rss/search?q=site:rand.org+when:7d&hl=en-US&gl=US&ceid=US:en', category: 'thinktanks', tier: 3 },
  { name: 'Brookings', url: 'https://news.google.com/rss/search?q=site:brookings.edu+when:7d&hl=en-US&gl=US&ceid=US:en', category: 'thinktanks', tier: 3 },
  { name: 'Carnegie', url: 'https://news.google.com/rss/search?q=site:carnegieendowment.org+when:7d&hl=en-US&gl=US&ceid=US:en', category: 'thinktanks', tier: 3 },
  { name: 'War on the Rocks', url: 'https://warontherocks.com/feed', category: 'thinktanks', tier: 2 },
  { name: 'AEI', url: 'https://www.aei.org/feed/', category: 'thinktanks', tier: 3 },
  { name: 'Responsible Statecraft', url: 'https://responsiblestatecraft.org/feed/', category: 'thinktanks', tier: 3 },
  { name: 'RUSI', url: 'https://news.google.com/rss/search?q=site:rusi.org+when:3d&hl=en-US&gl=US&ceid=US:en', category: 'thinktanks', tier: 2 },
  { name: 'FPRI', url: 'https://www.fpri.org/feed/', category: 'thinktanks', tier: 3 },
  { name: 'Jamestown', url: 'https://jamestown.org/feed/', category: 'thinktanks', tier: 3 },

  // ── crisis ─────────────────────────────────────────────────────────────
  { name: 'CrisisWatch', url: 'https://www.crisisgroup.org/rss', category: 'crisis', tier: 3 },
  { name: 'IAEA', url: 'https://www.iaea.org/feeds/topnews', category: 'crisis', tier: 1 },
  { name: 'WHO', url: 'https://www.who.int/rss-feeds/news-english.xml', category: 'crisis', tier: 1 },
  { name: 'UNHCR', url: 'https://news.google.com/rss/search?q=site:unhcr.org+OR+UNHCR+refugees+when:3d&hl=en-US&gl=US&ceid=US:en', category: 'crisis', tier: 1 },

  // ── africa ─────────────────────────────────────────────────────────────
  { name: 'Africa News', url: 'https://news.google.com/rss/search?q=(Africa+OR+Nigeria+OR+Kenya+OR+"South+Africa"+OR+Ethiopia)+when:2d&hl=en-US&gl=US&ceid=US:en', category: 'africa', tier: 4 },
  { name: 'Sahel Crisis', url: 'https://news.google.com/rss/search?q=(Sahel+OR+Mali+OR+Niger+OR+"Burkina+Faso"+OR+Wagner)+when:3d&hl=en-US&gl=US&ceid=US:en', category: 'africa', tier: 4 },
  { name: 'News24', url: 'https://feeds.news24.com/articles/news24/TopStories/rss', category: 'africa', tier: 3 },
  { name: 'BBC Africa', url: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml', category: 'africa', tier: 2 },
  { name: 'Jeune Afrique', url: 'https://www.jeuneafrique.com/feed/', category: 'africa', tier: 3 },
  { name: 'Africanews', url: 'https://www.africanews.com/feed/rss', category: 'africa', tier: 3 },
  { name: 'BBC Afrique', url: 'https://www.bbc.com/afrique/index.xml', category: 'africa', tier: 2 },
  // Nigeria
  { name: 'Premium Times', url: 'https://www.premiumtimesng.com/feed', category: 'africa', tier: 2 },
  { name: 'Vanguard Nigeria', url: 'https://www.vanguardngr.com/feed/', category: 'africa', tier: 2 },
  { name: 'Channels TV', url: 'https://www.channelstv.com/feed/', category: 'africa', tier: 2 },
  { name: 'Daily Trust', url: 'https://dailytrust.com/feed/', category: 'africa', tier: 3 },
  { name: 'ThisDay', url: 'https://www.thisdaylive.com/feed', category: 'africa', tier: 2 },

  // ── latam ──────────────────────────────────────────────────────────────
  { name: 'Latin America', url: 'https://news.google.com/rss/search?q=(Brazil+OR+Mexico+OR+Argentina+OR+Venezuela+OR+Colombia)+when:2d&hl=en-US&gl=US&ceid=US:en', category: 'latam', tier: 4 },
  { name: 'BBC Latin America', url: 'https://feeds.bbci.co.uk/news/world/latin_america/rss.xml', category: 'latam', tier: 2 },
  { name: 'Reuters LatAm', url: 'https://news.google.com/rss/search?q=site:reuters.com+(Brazil+OR+Mexico+OR+Argentina)+when:3d&hl=en-US&gl=US&ceid=US:en', category: 'latam', tier: 1 },
  { name: 'Guardian Americas', url: 'https://www.theguardian.com/world/americas/rss', category: 'latam', tier: 2 },
  { name: 'Clarín', url: 'https://www.clarin.com/rss/lo-ultimo/', category: 'latam', tier: 3 },
  { name: 'O Globo', url: 'https://news.google.com/rss/search?q=site:oglobo.globo.com+when:1d&hl=pt-BR&gl=BR&ceid=BR:pt-419', category: 'latam', tier: 3 },
  { name: 'Folha de S.Paulo', url: 'https://feeds.folha.uol.com.br/emcimadahora/rss091.xml', category: 'latam', tier: 2 },
  { name: 'Brasil Paralelo', url: 'https://www.brasilparalelo.com.br/noticias/rss.xml', category: 'latam', tier: 2 },
  { name: 'El Tiempo', url: 'https://www.eltiempo.com/rss/mundo_latinoamerica.xml', category: 'latam', tier: 3 },
  { name: 'El Universal', url: 'https://news.google.com/rss/search?q=site:eluniversal.com.mx+when:1d&hl=es-419&gl=MX&ceid=MX:es-419', category: 'latam', tier: 3 },
  { name: 'La Silla Vacía', url: 'https://www.lasillavacia.com/rss', category: 'latam', tier: 3 },
  // Mexico
  { name: 'Mexico News Daily', url: 'https://mexiconewsdaily.com/feed/', category: 'latam', tier: 4 },
  { name: 'Animal Político', url: 'https://news.google.com/rss/search?q=site:animalpolitico.com+when:1d&hl=es-419&gl=MX&ceid=MX:es-419', category: 'latam', tier: 3 },
  { name: 'Proceso', url: 'https://news.google.com/rss/search?q=site:proceso.com.mx+when:1d&hl=es-419&gl=MX&ceid=MX:es-419', category: 'latam', tier: 3 },
  { name: 'Milenio', url: 'https://news.google.com/rss/search?q=site:milenio.com+when:1d&hl=es-419&gl=MX&ceid=MX:es-419', category: 'latam', tier: 3 },
  { name: 'Mexico Security', url: 'https://news.google.com/rss/search?q=(Mexico+cartel+OR+Mexico+violence+OR+Mexico+troops+OR+narco+Mexico)+when:2d&hl=en-US&gl=US&ceid=US:en', category: 'latam', tier: 4 },
  { name: 'AP Mexico', url: 'https://news.google.com/rss/search?q=site:apnews.com+Mexico+when:3d&hl=en-US&gl=US&ceid=US:en', category: 'latam', tier: 1 },
  // LatAm Security
  { name: 'InSight Crime', url: 'https://insightcrime.org/feed/', category: 'latam', tier: 3 },
  { name: 'France 24 LatAm', url: 'https://www.france24.com/en/americas/rss', category: 'latam', tier: 2 },

  // ── asia ───────────────────────────────────────────────────────────────
  { name: 'Asia News', url: 'https://news.google.com/rss/search?q=(China+OR+Japan+OR+Korea+OR+India+OR+ASEAN)+when:2d&hl=en-US&gl=US&ceid=US:en', category: 'asia', tier: 4 },
  { name: 'BBC Asia', url: 'https://feeds.bbci.co.uk/news/world/asia/rss.xml', category: 'asia', tier: 2 },
  { name: 'The Diplomat', url: 'https://thediplomat.com/feed/', category: 'asia', tier: 3 },
  { name: 'South China Morning Post', url: 'https://www.scmp.com/rss/91/feed/', category: 'asia', tier: 2 },
  { name: 'Reuters Asia', url: 'https://news.google.com/rss/search?q=site:reuters.com+(China+OR+Japan+OR+Taiwan+OR+Korea)+when:3d&hl=en-US&gl=US&ceid=US:en', category: 'asia', tier: 1 },
  { name: 'Xinhua', url: 'https://news.google.com/rss/search?q=site:xinhuanet.com+OR+Xinhua+when:1d&hl=en-US&gl=US&ceid=US:en', category: 'asia', tier: 3 },
  { name: 'Japan Today', url: 'https://japantoday.com/feed/atom', category: 'asia', tier: 3 },
  { name: 'Nikkei Asia', url: 'https://news.google.com/rss/search?q=site:asia.nikkei.com+when:3d&hl=en-US&gl=US&ceid=US:en', category: 'asia', tier: 2 },
  { name: 'Asahi Shimbun', url: 'https://www.asahi.com/rss/asahi/newsheadlines.rdf', category: 'asia', tier: 2 },
  { name: 'The Hindu', url: 'https://www.thehindu.com/news/national/feeder/default.rss', category: 'asia', tier: 2 },
  { name: 'Indian Express', url: 'https://indianexpress.com/section/india/feed/', category: 'asia', tier: 2 },
  { name: 'NDTV', url: 'https://feeds.feedburner.com/ndtvnews-top-stories', category: 'asia', tier: 2 },
  { name: 'India News Network', url: 'https://news.google.com/rss/search?q=India+diplomacy+foreign+policy+news&hl=en&gl=US&ceid=US:en', category: 'asia', tier: 4 },
  { name: 'CNA', url: 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml', category: 'asia', tier: 2 },
  { name: 'MIIT (China)', url: 'https://news.google.com/rss/search?q=site:miit.gov.cn+when:7d&hl=zh-CN&gl=CN&ceid=CN:zh-Hans', category: 'asia', tier: 1 },
  { name: 'MOFCOM (China)', url: 'https://news.google.com/rss/search?q=site:mofcom.gov.cn+when:7d&hl=zh-CN&gl=CN&ceid=CN:zh-Hans', category: 'asia', tier: 1 },
  // Thailand
  { name: 'Bangkok Post', url: 'https://news.google.com/rss/search?q=site:bangkokpost.com+when:1d&hl=en-US&gl=US&ceid=US:en', category: 'asia', tier: 2 },
  { name: 'Thai PBS', url: 'https://news.google.com/rss/search?q=Thai+PBS+World+news&hl=en&gl=US&ceid=US:en', category: 'asia', tier: 2 },
  // Vietnam
  { name: 'VnExpress', url: 'https://vnexpress.net/rss/tin-moi-nhat.rss', category: 'asia', tier: 2 },
  { name: 'Tuoi Tre News', url: 'https://tuoitrenews.vn/rss', category: 'asia', tier: 2 },
  // Korea
  { name: 'Yonhap News', url: 'https://www.yonhapnewstv.co.kr/browse/feed/', category: 'asia', tier: 2 },
  { name: 'Chosun Ilbo', url: 'https://www.chosun.com/arc/outboundfeeds/rss/?outputType=xml', category: 'asia', tier: 2 },
  // Australia
  { name: 'ABC News Australia', url: 'https://www.abc.net.au/news/feed/2942460/rss.xml', category: 'asia', tier: 2 },
  { name: 'Guardian Australia', url: 'https://www.theguardian.com/australia-news/rss', category: 'asia', tier: 2 },
  // Pacific Islands
  { name: 'Island Times (Palau)', url: 'https://islandtimes.org/feed/', category: 'asia', tier: 4 },

  // ── energy ─────────────────────────────────────────────────────────────
  { name: 'Oil & Gas', url: 'https://news.google.com/rss/search?q=(oil+price+OR+OPEC+OR+"natural+gas"+OR+pipeline+OR+LNG)+when:2d&hl=en-US&gl=US&ceid=US:en', category: 'energy', tier: 4 },
  { name: 'Nuclear Energy', url: 'https://news.google.com/rss/search?q=("nuclear+energy"+OR+"nuclear+power"+OR+uranium+OR+IAEA)+when:3d&hl=en-US&gl=US&ceid=US:en', category: 'energy', tier: 4 },
  { name: 'Reuters Energy', url: 'https://news.google.com/rss/search?q=site:reuters.com+(oil+OR+gas+OR+energy+OR+OPEC)+when:3d&hl=en-US&gl=US&ceid=US:en', category: 'energy', tier: 1 },
  { name: 'Mining & Resources', url: 'https://news.google.com/rss/search?q=(lithium+OR+"rare+earth"+OR+cobalt+OR+mining)+when:3d&hl=en-US&gl=US&ceid=US:en', category: 'energy', tier: 4 },
];

export const INTEL_FEEDS: Feed[] = [
  // Defense & Security
  { name: 'Defense One', url: 'https://www.defenseone.com/rss/all/', category: 'defense', tier: 3 },
  { name: 'Breaking Defense', url: 'https://breakingdefense.com/feed/', category: 'defense', tier: 3 },
  { name: 'The War Zone', url: 'https://www.twz.com/feed', category: 'defense', tier: 3 },
  { name: 'Defense News', url: 'https://www.defensenews.com/arc/outboundfeeds/rss/?outputType=xml', category: 'defense', tier: 3 },
  { name: 'Janes', url: 'https://news.google.com/rss/search?q=site:janes.com+when:3d&hl=en-US&gl=US&ceid=US:en', category: 'defense', tier: 3 },
  { name: 'Military Times', url: 'https://www.militarytimes.com/arc/outboundfeeds/rss/?outputType=xml', category: 'defense', tier: 2 },
  { name: 'Task & Purpose', url: 'https://taskandpurpose.com/feed/', category: 'defense', tier: 3 },
  { name: 'USNI News', url: 'https://news.usni.org/feed', category: 'defense', tier: 2 },
  { name: 'gCaptain', url: 'https://gcaptain.com/feed/', category: 'defense', tier: 3 },
  { name: 'Oryx OSINT', url: 'https://www.oryxspioenkop.com/feeds/posts/default?alt=rss', category: 'defense', tier: 2 },
  { name: 'UK MOD', url: 'https://www.gov.uk/government/organisations/ministry-of-defence.atom', category: 'defense', tier: 1 },
  { name: 'CSIS', url: 'https://news.google.com/rss/search?q=site:csis.org&hl=en&gl=US&ceid=US:en', category: 'defense', tier: 3 },

  // International Relations
  { name: 'Chatham House', url: 'https://news.google.com/rss/search?q=site:chathamhouse.org+when:7d&hl=en-US&gl=US&ceid=US:en', category: 'intl', tier: 3 },
  { name: 'ECFR', url: 'https://news.google.com/rss/search?q=site:ecfr.eu+when:7d&hl=en-US&gl=US&ceid=US:en', category: 'intl', tier: 3 },
  { name: 'Foreign Policy', url: 'https://foreignpolicy.com/feed/', category: 'intl', tier: 3 },
  { name: 'Foreign Affairs', url: 'https://www.foreignaffairs.com/rss.xml', category: 'intl', tier: 3 },
  { name: 'Atlantic Council', url: 'https://www.atlanticcouncil.org/feed/', category: 'intl', tier: 3 },
  { name: 'Middle East Institute', url: 'https://news.google.com/rss/search?q=site:mei.edu+when:7d&hl=en-US&gl=US&ceid=US:en', category: 'intl', tier: 3 },

  // Think Tanks & Research
  { name: 'RAND', url: 'https://news.google.com/rss/search?q=site:rand.org+when:7d&hl=en-US&gl=US&ceid=US:en', category: 'research', tier: 3 },
  { name: 'Brookings', url: 'https://news.google.com/rss/search?q=site:brookings.edu&hl=en&gl=US&ceid=US:en', category: 'research', tier: 3 },
  { name: 'Carnegie', url: 'https://news.google.com/rss/search?q=site:carnegieendowment.org&hl=en&gl=US&ceid=US:en', category: 'research', tier: 3 },
  { name: 'FAS', url: 'https://news.google.com/rss/search?q=site:fas.org+nuclear+weapons+security&hl=en&gl=US&ceid=US:en', category: 'research', tier: 3 },
  { name: 'NTI', url: 'https://news.google.com/rss/search?q=site:nti.org+when:30d&hl=en-US&gl=US&ceid=US:en', category: 'research', tier: 3 },
  { name: 'RUSI', url: 'https://news.google.com/rss/search?q=site:rusi.org+when:7d&hl=en-US&gl=US&ceid=US:en', category: 'research', tier: 2 },
  { name: 'Wilson Center', url: 'https://news.google.com/rss/search?q=site:wilsoncenter.org+when:7d&hl=en-US&gl=US&ceid=US:en', category: 'research', tier: 3 },
  { name: 'GMF', url: 'https://news.google.com/rss/search?q=site:gmfus.org+when:7d&hl=en-US&gl=US&ceid=US:en', category: 'research', tier: 3 },
  { name: 'Stimson Center', url: 'https://www.stimson.org/feed/', category: 'research', tier: 3 },
  { name: 'CNAS', url: 'https://news.google.com/rss/search?q=site:cnas.org+when:7d&hl=en-US&gl=US&ceid=US:en', category: 'research', tier: 2 },
  { name: 'Lowy Institute', url: 'https://news.google.com/rss/search?q=site:lowyinstitute.org+when:7d&hl=en-US&gl=US&ceid=US:en', category: 'research', tier: 3 },

  // Nuclear & Arms Control
  { name: 'Arms Control Assn', url: 'https://news.google.com/rss/search?q=site:armscontrol.org+when:7d&hl=en-US&gl=US&ceid=US:en', category: 'nuclear', tier: 2 },
  { name: 'Bulletin of Atomic Scientists', url: 'https://news.google.com/rss/search?q=site:thebulletin.org+when:7d&hl=en-US&gl=US&ceid=US:en', category: 'nuclear', tier: 2 },

  // OSINT & Monitoring
  { name: 'Bellingcat', url: 'https://news.google.com/rss/search?q=site:bellingcat.com+when:30d&hl=en-US&gl=US&ceid=US:en', category: 'osint', tier: 3 },
  { name: 'Krebs Security', url: 'https://krebsonsecurity.com/feed/', category: 'cyber', tier: 3 },
  { name: 'Ransomware.live', url: 'https://www.ransomware.live/rss.xml', category: 'cyber', tier: 3 },

  // Economic & Food Security
  { name: 'FAO News', url: 'https://www.fao.org/feeds/fao-newsroom-rss', category: 'economic', tier: 2 },
  { name: 'FAO GIEWS', url: 'https://news.google.com/rss/search?q=site:fao.org+GIEWS+food+security+when:30d&hl=en-US&gl=US&ceid=US:en', category: 'economic', tier: 2 },
  { name: 'EU ISS', url: 'https://news.google.com/rss/search?q=site:iss.europa.eu+when:7d&hl=en-US&gl=US&ceid=US:en', category: 'intl', tier: 3 },
];

export const ALERT_KEYWORDS = [
  'war', 'invasion', 'military', 'nuclear', 'sanctions', 'missile',
  'airstrike', 'drone strike', 'troops deployed', 'armed conflict', 'bombing', 'casualties',
  'ceasefire', 'peace treaty', 'nato', 'coup', 'martial law',
  'assassination', 'terrorist', 'terror attack', 'cyber attack', 'hostage', 'evacuation order',
];
