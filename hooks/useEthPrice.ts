"use client";
import { useState, useEffect } from "react";

export interface EthMarket {
  price: number | null;
  change24h: number | null;
  loading: boolean;
}

export function useEthPrice(): EthMarket {
  const [price, setPrice] = useState<number | null>(null);
  const [change24h, setChange24h] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true",
          { cache: "no-store" }
        );
        const data = await res.json();
        if (!cancelled && data?.ethereum) {
          setPrice(data.ethereum.usd);
          setChange24h(data.ethereum.usd_24h_change ?? null);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    refresh();
    const id = setInterval(refresh, 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return { price, change24h, loading };
}

export function fmtUsd(eth: number, ethPrice: number | null) {
  if (!ethPrice) return null;
  const usd = eth * ethPrice;
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(2)}M`;
  if (usd >= 1_000) return `$${usd.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  return `$${usd.toFixed(2)}`;
}
