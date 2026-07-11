export type Ticker = {
  symbol: string;
  name: string;
  kind: "stock" | "etf" | "commodity";
  logo: string;
};

// Free CDN for stock/ETF logos — returns transparent PNG for the ticker.
const logo = (sym: string) => `https://financialmodelingprep.com/image-stock/${sym}.png`;

export const ALL_TICKERS: Ticker[] = [
  { symbol: "AAPL",  name: "Apple",                    kind: "stock",     logo: logo("AAPL")  },
  { symbol: "AMD",   name: "Advanced Micro Devices",   kind: "stock",     logo: logo("AMD")   },
  { symbol: "AMZN",  name: "Amazon",                   kind: "stock",     logo: logo("AMZN")  },
  { symbol: "BABA",  name: "Alibaba",                  kind: "stock",     logo: logo("BABA")  },
  { symbol: "BE",    name: "Bloom Energy",             kind: "stock",     logo: logo("BE")    },
  { symbol: "COIN",  name: "Coinbase",                 kind: "stock",     logo: logo("COIN")  },
  { symbol: "CRCL",  name: "Circle",                   kind: "stock",     logo: logo("CRCL")  },
  { symbol: "CRWV",  name: "CoreWeave",                kind: "stock",     logo: logo("CRWV")  },
  { symbol: "GOOGL", name: "Alphabet",                 kind: "stock",     logo: logo("GOOGL") },
  { symbol: "INTC",  name: "Intel",                    kind: "stock",     logo: logo("INTC")  },
  { symbol: "META",  name: "Meta Platforms",           kind: "stock",     logo: logo("META")  },
  { symbol: "MSFT",  name: "Microsoft",                kind: "stock",     logo: logo("MSFT")  },
  { symbol: "MU",    name: "Micron Technology",        kind: "stock",     logo: logo("MU")    },
  { symbol: "NVDA",  name: "NVIDIA",                   kind: "stock",     logo: logo("NVDA")  },
  { symbol: "ORCL",  name: "Oracle",                   kind: "stock",     logo: logo("ORCL")  },
  { symbol: "PLTR",  name: "Palantir",                 kind: "stock",     logo: logo("PLTR")  },
  { symbol: "SNDK",  name: "SanDisk",                  kind: "stock",     logo: logo("SNDK")  },
  { symbol: "SPCX",  name: "SpaceX (private)",         kind: "stock",     logo: logo("SPCX")  },
  { symbol: "TSLA",  name: "Tesla",                    kind: "stock",     logo: logo("TSLA")  },
  { symbol: "USAR",  name: "USA Rare Earth",           kind: "stock",     logo: logo("USAR")  },
  { symbol: "QQQ",   name: "Invesco QQQ Trust",        kind: "etf",       logo: logo("QQQ")   },
  { symbol: "SGOV",  name: "iShares 0-3M Treasury",    kind: "etf",       logo: logo("SGOV")  },
  { symbol: "SLV",   name: "iShares Silver Trust",     kind: "commodity", logo: logo("SLV")   },
  { symbol: "SPY",   name: "SPDR S&P 500 ETF",         kind: "etf",       logo: logo("SPY")   },
];
