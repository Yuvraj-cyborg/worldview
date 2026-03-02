export type EntityType = "company" | "index" | "commodity" | "crypto" | "sector" | "country";

export interface EntityEntry {
  id: string;
  type: EntityType;
  name: string;
  aliases: string[];
  keywords: string[];
  sector?: string;
  related?: string[];
}

export const ENTITIES: EntityEntry[] = [
  // Indices
  { id: "SPX", type: "index", name: "S&P 500", aliases: ["SPX", "S&P", "SP500"], keywords: ["s&p", "sp500", "s&p 500", "wall street"], related: ["QQQ", "DIA"] },
  { id: "DJI", type: "index", name: "Dow Jones", aliases: ["DJI", "DJIA", "Dow"], keywords: ["dow jones", "dow", "djia"], related: ["SPX", "QQQ"] },
  { id: "QQQ", type: "index", name: "NASDAQ", aliases: ["QQQ", "NASDAQ", "NDX"], keywords: ["nasdaq", "tech stocks"], related: ["SPX", "DJI"] },

  // Tech
  { id: "AAPL", type: "company", name: "Apple", aliases: ["AAPL", "Apple Inc"], keywords: ["apple", "iphone", "tim cook"], sector: "tech", related: ["QQQ"] },
  { id: "MSFT", type: "company", name: "Microsoft", aliases: ["MSFT", "Microsoft"], keywords: ["microsoft", "azure", "satya nadella"], sector: "tech", related: ["QQQ"] },
  { id: "NVDA", type: "company", name: "NVIDIA", aliases: ["NVDA", "Nvidia"], keywords: ["nvidia", "gpu", "jensen huang", "cuda"], sector: "tech", related: ["QQQ", "SMH"] },
  { id: "GOOGL", type: "company", name: "Alphabet", aliases: ["GOOGL", "Google", "Alphabet"], keywords: ["google", "alphabet", "deepmind"], sector: "tech", related: ["QQQ"] },
  { id: "AMZN", type: "company", name: "Amazon", aliases: ["AMZN", "Amazon"], keywords: ["amazon", "aws", "bezos"], sector: "tech", related: ["QQQ"] },
  { id: "META", type: "company", name: "Meta", aliases: ["META", "Facebook", "Meta Platforms"], keywords: ["meta", "facebook", "instagram", "zuckerberg"], sector: "tech", related: ["QQQ"] },
  { id: "TSM", type: "company", name: "TSMC", aliases: ["TSM", "TSMC"], keywords: ["tsmc", "taiwan semiconductor"], sector: "tech", related: ["TW", "SMH"] },

  // Defense
  { id: "LMT", type: "company", name: "Lockheed Martin", aliases: ["LMT", "Lockheed"], keywords: ["lockheed martin", "f-35", "f35"], sector: "defense" },
  { id: "RTX", type: "company", name: "RTX Corp", aliases: ["RTX", "Raytheon"], keywords: ["raytheon", "rtx", "patriot missile"], sector: "defense" },
  { id: "NOC", type: "company", name: "Northrop Grumman", aliases: ["NOC", "Northrop"], keywords: ["northrop grumman", "b-21"], sector: "defense" },
  { id: "BA", type: "company", name: "Boeing", aliases: ["BA", "Boeing"], keywords: ["boeing", "737", "747", "777"], sector: "defense" },
  { id: "RHM", type: "company", name: "Rheinmetall", aliases: ["RHM", "Rheinmetall"], keywords: ["rheinmetall", "leopard tank"], sector: "defense" },

  // Commodities
  { id: "VIX", type: "commodity", name: "VIX", aliases: ["VIX", "CBOE VIX"], keywords: ["vix", "fear index", "volatility index"] },
  { id: "GC", type: "commodity", name: "Gold", aliases: ["GC", "XAUUSD"], keywords: ["gold", "gold price", "bullion", "xau"], related: ["SLV"] },
  { id: "CL", type: "commodity", name: "Crude Oil", aliases: ["CL", "WTI", "Brent"], keywords: ["crude oil", "oil price", "brent", "wti", "opec"], related: ["XLE"] },
  { id: "NG", type: "commodity", name: "Natural Gas", aliases: ["NG", "NATGAS"], keywords: ["natural gas", "lng", "gas price"] },
  { id: "SLV", type: "commodity", name: "Silver", aliases: ["SLV", "XAGUSD"], keywords: ["silver", "silver price"], related: ["GC"] },
  { id: "HG", type: "commodity", name: "Copper", aliases: ["HG"], keywords: ["copper", "copper price"] },

  // Crypto
  { id: "BTC", type: "crypto", name: "Bitcoin", aliases: ["BTC", "Bitcoin", "XBT"], keywords: ["bitcoin", "btc", "satoshi"] },
  { id: "ETH", type: "crypto", name: "Ethereum", aliases: ["ETH", "Ethereum", "Ether"], keywords: ["ethereum", "eth", "vitalik"] },
  { id: "SOL", type: "crypto", name: "Solana", aliases: ["SOL", "Solana"], keywords: ["solana", "sol"] },

  // Countries
  { id: "CN", type: "country", name: "China", aliases: ["China", "PRC", "Beijing"], keywords: ["china", "beijing", "xi jinping", "prc", "ccp", "pla"] },
  { id: "TW", type: "country", name: "Taiwan", aliases: ["Taiwan", "ROC", "Taipei"], keywords: ["taiwan", "taipei", "tsmc"], related: ["CN", "TSM"] },
  { id: "RU", type: "country", name: "Russia", aliases: ["Russia", "Moscow", "Kremlin"], keywords: ["russia", "putin", "kremlin", "moscow"] },
  { id: "UA", type: "country", name: "Ukraine", aliases: ["Ukraine", "Kyiv", "Kiev"], keywords: ["ukraine", "kyiv", "zelensky"], related: ["RU"] },
  { id: "IR", type: "country", name: "Iran", aliases: ["Iran", "Tehran", "Persia"], keywords: ["iran", "tehran", "irgc", "khamenei"], related: ["IL"] },
  { id: "IL", type: "country", name: "Israel", aliases: ["Israel", "Tel Aviv", "Jerusalem"], keywords: ["israel", "idf", "netanyahu", "mossad"], related: ["IR", "PS"] },
  { id: "PS", type: "country", name: "Palestine", aliases: ["Palestine", "Gaza", "West Bank"], keywords: ["palestine", "gaza", "hamas", "west bank"], related: ["IL"] },
  { id: "SA", type: "country", name: "Saudi Arabia", aliases: ["Saudi Arabia", "KSA", "Riyadh"], keywords: ["saudi", "mbs", "aramco", "riyadh"], related: ["AE"] },
  { id: "AE", type: "country", name: "UAE", aliases: ["UAE", "Abu Dhabi", "Dubai"], keywords: ["uae", "dubai", "abu dhabi", "emirates"] },
  { id: "TR", type: "country", name: "Turkey", aliases: ["Turkey", "Türkiye", "Ankara"], keywords: ["turkey", "erdogan", "ankara", "turkish"] },
  { id: "KP", type: "country", name: "North Korea", aliases: ["North Korea", "DPRK", "Pyongyang"], keywords: ["north korea", "pyongyang", "kim jong"] },
  { id: "SD", type: "country", name: "Sudan", aliases: ["Sudan", "Khartoum"], keywords: ["sudan", "khartoum", "darfur", "rsf"] },
  { id: "MM", type: "country", name: "Myanmar", aliases: ["Myanmar", "Burma"], keywords: ["myanmar", "burma", "junta", "rohingya"] },
  { id: "YE", type: "country", name: "Yemen", aliases: ["Yemen", "Sana'a"], keywords: ["yemen", "houthi", "sanaa", "aden"] },
  { id: "SY", type: "country", name: "Syria", aliases: ["Syria", "Damascus"], keywords: ["syria", "damascus", "assad", "idlib"] },
  { id: "LB", type: "country", name: "Lebanon", aliases: ["Lebanon", "Beirut"], keywords: ["lebanon", "beirut", "hezbollah"] },

  // Sectors
  { id: "XLK", type: "sector", name: "Tech Sector", aliases: ["XLK"], keywords: ["tech sector", "technology"], related: ["AAPL", "MSFT", "NVDA"] },
  { id: "XLE", type: "sector", name: "Energy Sector", aliases: ["XLE"], keywords: ["energy sector", "oil sector"], related: ["CL"] },
  { id: "SMH", type: "sector", name: "Semiconductors", aliases: ["SMH"], keywords: ["semiconductor", "chips", "chip war"], related: ["NVDA", "TSM"] },
];

export function getEntityById(id: string): EntityEntry | undefined {
  return ENTITIES.find((e) => e.id === id);
}
