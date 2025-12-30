"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const PENALTY = 500;
const DEBT_KEY = "commit-debt-by-date";
const PROMISE_KEY = "commit-promise-by-date";
const RESULT_KEY = "commit-result-by-date";
const RECOVERY_BONUS = 500;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }
  
function readJSON<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

export default function NightPage() {
  const key = useMemo(() => todayKey(), []);
  const [debtMap, setDebtMap] = useState<Record<string, number>>({});
  const [promiseMap, setPromiseMap] = useState<Record<string, string>>({});
  const [last, setLast] = useState<"success" | "fail" | null>(null);
  const [afterFailMsg, setAfterFailMsg] = useState<string | null>(null);
  const [resultMap, setResultMap] = useState<Record<string, "success" | "fail">>({});

  const debtToday = debtMap[key] ?? 0;
  const promiseToday = (promiseMap[key] ?? "").trim();

  useEffect(() => {
    setDebtMap(readJSON(DEBT_KEY, {}));
    setPromiseMap(readJSON(PROMISE_KEY, {}));
    setResultMap(readJSON(RESULT_KEY, {}));
  }, []);

  const onSuccess = () => {
    setLast("success");
    setAfterFailMsg(null);
    const yKey = yesterdayKey();
  
    // 1) resultMap を更新（今日=success）
    setResultMap((prevResults) => {
      const nextResults = { ...prevResults, [key]: "success" as const };
      writeJSON(RESULT_KEY, nextResults);
  
      // 2) 昨日が fail なら、今日の debt を RECOVERY_BONUS 分だけ減らす（最低0円）
      if (prevResults[yKey] === "fail") {
        setDebtMap((prevDebt) => {
          const current = prevDebt[key] ?? 0;
          const nextValue = Math.max(0, current - RECOVERY_BONUS);
          const nextDebt = { ...prevDebt, [key]: nextValue };
          writeJSON(DEBT_KEY, nextDebt);
          return nextDebt;
        });
      }
  
      return nextResults;
    });
  };  
  
  const onFail = () => {
    setLast("fail");
    setAfterFailMsg("OK。今日はここまで。\n明日のことは、朝に決めればいい。");
    setResultMap((prev) => {
        const next = { ...prev, [key]: "fail" as const };
        writeJSON(RESULT_KEY, next);
        return next;
      });      
    setDebtMap((prev) => {
      const next = { ...prev, [key]: (prev[key] ?? 0) + PENALTY };
      writeJSON(DEBT_KEY, next);
      return next;
    });
  };

  const resetToday = () => {
    setLast(null);
    setAfterFailMsg(null);
    setDebtMap((prev) => {
      const next = { ...prev, [key]: 0 };
      writeJSON(DEBT_KEY, next);
      return next;
    });
  };

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>夜のチェック</h1>
      <div style={{ marginTop: 12, padding: 12, border: "1px solid #eee", maxWidth: 640 }}>
  <b>自己嫌悪のまま寝ないための1クリック。</b>
  <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85, lineHeight: 1.7 }}>
    ここは自分を裁く場所じゃない。<br />
    罪悪感を“反省”にせず、“復帰”に変える場所。<br />
    今日は事実だけ押して、明日に戻る。
  </div>
</div>


      <p style={{ marginTop: 12 }}>今日（{key}）の約束：</p>

      <div style={{ marginTop: 8, padding: 12, border: "1px solid #ddd", maxWidth: 520 }}>
        {promiseToday ? (
          <b>{promiseToday}</b>
        ) : (
          <span>
            まだ朝の約束がありません。{" "}
            <Link href="/morning" style={{ textDecoration: "underline" }}>
              朝の約束を書く →
            </Link>
          </span>
        )}
      </div>

      <p style={{ marginTop: 16 }}>今日は、約束を守れましたか？</p>

      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <button style={{ padding: "12px 20px", cursor: "pointer" }} onClick={onSuccess}>
          ✅ 守れた
        </button>
        <button style={{ padding: "12px 20px", cursor: "pointer" }} onClick={onFail}>
          ❌ 守れなかった（+{PENALTY}円）
        </button>
        <button style={{ padding: "12px 20px", cursor: "pointer" }} onClick={resetToday}>
          今日をリセット
        </button>
      </div>

      <p style={{ marginTop: 24, fontSize: 18 }}>
        今日のCommit Debt：<b>{debtToday}</b>円
      </p>
      <p style={{ marginTop: 12 }}>
        最後の結果：<b>{last ?? "未入力"}</b>
      </p>
      {afterFailMsg && (
  <div
    style={{
      marginTop: 12,
      padding: 12,
      border: "1px solid #eee",
      maxWidth: 520,
      whiteSpace: "pre-line",
      lineHeight: 1.7,
      opacity: 0.9,
    }}
  >
    {afterFailMsg}
  </div>
)}

      <div style={{ marginTop: 24, display: "flex", gap: 16 }}>
        <Link href="/" style={{ textDecoration: "underline" }}>
          ← トップに戻る
        </Link>
        <Link href="/morning" style={{ textDecoration: "underline" }}>
          朝の約束へ →
        </Link>
      </div>
    </main>
  );
}
