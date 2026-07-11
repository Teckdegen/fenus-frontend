export type Ticker = {
  symbol: string;
  name: string;
  kind: "stock" | "etf" | "commodity";
  logo: string;
  founded?: number;
  hq?: string;
  sector?: string;
  ceo?: string;
  about?: string;
};

// Free CDN for stock/ETF logos — returns transparent PNG for the ticker.
const logo = (sym: string) => `https://financialmodelingprep.com/image-stock/${sym}.png`;

export const ALL_TICKERS: Ticker[] = [
  { symbol: "AAPL",  name: "Apple",                    kind: "stock",     logo: logo("AAPL"),  founded: 1976, hq: "Cupertino, USA",     sector: "Consumer Electronics",  ceo: "Tim Cook",         about: "Designs and sells iPhone, Mac, iPad and services." },
  { symbol: "AMD",   name: "Advanced Micro Devices",   kind: "stock",     logo: logo("AMD"),   founded: 1969, hq: "Santa Clara, USA",   sector: "Semiconductors",        ceo: "Lisa Su",          about: "Designs CPUs, GPUs and AI accelerators." },
  { symbol: "AMZN",  name: "Amazon",                   kind: "stock",     logo: logo("AMZN"),  founded: 1994, hq: "Seattle, USA",       sector: "E-commerce / Cloud",    ceo: "Andy Jassy",       about: "Global e-commerce, AWS cloud, devices and media." },
  { symbol: "BABA",  name: "Alibaba",                  kind: "stock",     logo: logo("BABA"),  founded: 1999, hq: "Hangzhou, China",    sector: "E-commerce / Cloud",    ceo: "Eddie Wu",         about: "China's largest e-commerce and cloud platform." },
  { symbol: "BE",    name: "Bloom Energy",             kind: "stock",     logo: logo("BE"),    founded: 2001, hq: "San Jose, USA",      sector: "Clean Energy",          ceo: "KR Sridhar",       about: "Solid-oxide fuel-cell power for data centers." },
  { symbol: "COIN",  name: "Coinbase",                 kind: "stock",     logo: logo("COIN"),  founded: 2012, hq: "Remote, USA",        sector: "Crypto Exchange",       ceo: "Brian Armstrong",  about: "Largest US crypto exchange and custodian." },
  { symbol: "CRCL",  name: "Circle",                   kind: "stock",     logo: logo("CRCL"),  founded: 2013, hq: "New York, USA",      sector: "Stablecoins",           ceo: "Jeremy Allaire",   about: "Issuer of the USDC stablecoin." },
  { symbol: "CRWV",  name: "CoreWeave",                kind: "stock",     logo: logo("CRWV"),  founded: 2017, hq: "Roseland, USA",      sector: "AI Cloud",              ceo: "Michael Intrator", about: "GPU cloud provider for AI workloads." },
  { symbol: "GOOGL", name: "Alphabet",                 kind: "stock",     logo: logo("GOOGL"), founded: 1998, hq: "Mountain View, USA", sector: "Internet / Ads",        ceo: "Sundar Pichai",    about: "Parent of Google, YouTube, Android and Waymo." },
  { symbol: "INTC",  name: "Intel",                    kind: "stock",     logo: logo("INTC"),  founded: 1968, hq: "Santa Clara, USA",   sector: "Semiconductors",        ceo: "Lip-Bu Tan",       about: "Designs and manufactures CPUs and foundry services." },
  { symbol: "META",  name: "Meta Platforms",           kind: "stock",     logo: logo("META"),  founded: 2004, hq: "Menlo Park, USA",    sector: "Social / Ads",          ceo: "Mark Zuckerberg",  about: "Facebook, Instagram, WhatsApp and Reality Labs." },
  { symbol: "MSFT",  name: "Microsoft",                kind: "stock",     logo: logo("MSFT"),  founded: 1975, hq: "Redmond, USA",       sector: "Software / Cloud",      ceo: "Satya Nadella",    about: "Windows, Office, Azure cloud and OpenAI partner." },
  { symbol: "MU",    name: "Micron Technology",        kind: "stock",     logo: logo("MU"),    founded: 1978, hq: "Boise, USA",         sector: "Semiconductors",        ceo: "Sanjay Mehrotra",  about: "DRAM, NAND and HBM memory manufacturer." },
  { symbol: "NVDA",  name: "NVIDIA",                   kind: "stock",     logo: logo("NVDA"),  founded: 1993, hq: "Santa Clara, USA",   sector: "AI / GPUs",             ceo: "Jensen Huang",     about: "GPUs and accelerators powering the AI era." },
  { symbol: "ORCL",  name: "Oracle",                   kind: "stock",     logo: logo("ORCL"),  founded: 1977, hq: "Austin, USA",        sector: "Enterprise Software",   ceo: "Safra Catz",       about: "Databases, enterprise apps and OCI cloud." },
  { symbol: "PLTR",  name: "Palantir",                 kind: "stock",     logo: logo("PLTR"),  founded: 2003, hq: "Denver, USA",        sector: "Data / AI",             ceo: "Alex Karp",        about: "Data and AI platforms for governments and enterprise." },
  { symbol: "SNDK",  name: "SanDisk",                  kind: "stock",     logo: logo("SNDK"),  founded: 1988, hq: "Milpitas, USA",      sector: "Storage",               ceo: "David Goeckeler",  about: "NAND flash memory and SSD storage products." },
  { symbol: "SPCX",  name: "SpaceX (private)",         kind: "stock",     logo: logo("SPCX"),  founded: 2002, hq: "Hawthorne, USA",     sector: "Aerospace",             ceo: "Elon Musk",        about: "Rockets, Starlink satellite internet, Starship." },
  { symbol: "TSLA",  name: "Tesla",                    kind: "stock",     logo: logo("TSLA"),  founded: 2003, hq: "Austin, USA",        sector: "EVs / Energy",          ceo: "Elon Musk",        about: "Electric vehicles, energy storage and autonomy." },
  { symbol: "USAR",  name: "USA Rare Earth",           kind: "stock",     logo: logo("USAR"),  founded: 2019, hq: "Stillwater, USA",    sector: "Mining / Materials",    ceo: "Joshua Ballard",   about: "Rare-earth mining and magnet manufacturing." },
  { symbol: "QQQ",   name: "Invesco QQQ Trust",        kind: "etf",       logo: logo("QQQ"),   founded: 1999, hq: "Atlanta, USA",       sector: "Nasdaq-100 ETF",        about: "Tracks the 100 largest Nasdaq non-financial stocks." },
  { symbol: "SGOV",  name: "iShares 0-3M Treasury",    kind: "etf",       logo: logo("SGOV"),  founded: 2020, hq: "New York, USA",      sector: "Short-Term Treasuries", about: "Ultra-short US Treasury bill ETF." },
  { symbol: "SLV",   name: "iShares Silver Trust",     kind: "commodity", logo: logo("SLV"),   founded: 2006, hq: "New York, USA",      sector: "Precious Metals",       about: "Physically-backed silver bullion trust." },
  { symbol: "SPY",   name: "SPDR S&P 500 ETF",         kind: "etf",       logo: logo("SPY"),   founded: 1993, hq: "Boston, USA",        sector: "S&P 500 ETF",           about: "First and largest ETF tracking the S&P 500." },
];
