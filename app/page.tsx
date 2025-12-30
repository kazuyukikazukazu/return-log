"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { copy } from "./content/copy";


const STORAGE_KEY = "commit-debt-by-date";
const RESULT_KEY = "commit-result-by-date";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr: string, diff: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function calcStreak(resultMap: Record<string, "success" | "fail">, today: string) {
  let streak = 0;
  let cur = today;

  while (resultMap[cur] === "success") {
    streak += 1;
    cur = addDays(cur, -1);
  }

  return streak;
}

function readMap(): Record<string, number> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function readResultMap(): Record<string, "success" | "fail"> {
  const raw = localStorage.getItem(RESULT_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export default function Home() {
  const lang = "ja";
  const t = copy[lang].home;
  const [map, setMap] = useState<Record<string, number>>({});
  const [resultMap, setResultMap] = useState<Record<string, "success" | "fail">>({});

  const key = useMemo(() => todayKey(), []);

  // ✅ monthPrefix を「先に」作る
  const monthPrefix = key.slice(0, 7);

  const todayDebt = map[key] ?? 0;
  const todayResult = resultMap[key] ?? null;

  const monthTotal = Object.entries(map)
    .filter(([d]) => d.startsWith(monthPrefix))
    .reduce((sum, [, v]) => sum + (v ?? 0), 0);

  // ✅ monthPrefix を使う計算は「後」に置く
  const monthResults = Object.entries(resultMap).filter(([d]) => d.startsWith(monthPrefix));
  const monthSuccess = monthResults.filter(([, v]) => v === "success").length;
  const monthTotalDays = monthResults.length;
  const monthRate = monthTotalDays === 0 ? null : Math.round((monthSuccess / monthTotalDays) * 100);

  const streak = calcStreak(resultMap, key);

  const monthRecordedDays = monthResults.length; 

  useEffect(() => {
    setMap(readMap());
    setResultMap(readResultMap());
  }, []);

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>{t.title}</h1>
      <p style={{ marginTop: 12 }}>{t.subtitle}</p>
      <p style={{ marginTop: 16, fontSize: 12 }}>{t.note}</p>


      <p style={{ marginTop: 24, fontSize: 18 }}>
        今日（{key}）のCommit Debt：<b>{todayDebt}</b>円
      </p>

      <p style={{ marginTop: 8, fontSize: 18 }}>
        今月（{monthPrefix}）の合計：<b>{monthTotal}</b>円
      </p>

      <p style={{ marginTop: 8, fontSize: 18 }}>
        今日の結果：
        <b>
          {todayResult === "success"
            ? " 守れた ✅"
            : todayResult === "fail"
            ? " 守れなかった ❌"
            : " 未入力"}
        </b>
      </p>

      <p style={{ marginTop: 8, fontSize: 18 }}>
        今月の守れた率：<b>{monthRate === null ? " - " : `${monthRate}%`}</b>
      </p>
      <p style={{ marginTop: 8, fontSize: 18 }}>
         連続達成（streak）：<b>{streak}</b>日
      </p>

      <p style={{ marginTop: 8, fontSize: 18 }}>
         今月の記録日数：<b>{monthRecordedDays}</b>日
      </p>


      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <Link
          href="/night"
          style={{
            display: "inline-block",
            padding: "12px 20px",
            border: "1px solid #000",
            textDecoration: "none",
          }}
        >
          夜のチェックへ →
        </Link>

        <Link
          href="/morning"
          style={{
            display: "inline-block",
            padding: "12px 20px",
            border: "1px solid #000",
            textDecoration: "none",
          }}
        >
          朝の約束を書く →
        </Link>

        <Link
          href="/review"
          style={{
            display: "inline-block",
            padding: "12px 20px",
            border: "1px solid #000",
            textDecoration: "none",
          }}
>
  月末レビュー →
</Link>



      </div>

      <p style={{ marginTop: 16, fontSize: 12 }}>※ 評価しない。記録するだけ。</p>
    </main>
  );
}
