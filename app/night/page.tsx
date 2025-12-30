"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { copy, formatText } from "../content/copy";

// ========= 設定 =========
const PENALTY = 500;
const RECOVERY_BONUS = 500;

const DEBT_KEY = "commit-debt-by-date";
const PROMISE_KEY = "commit-promise-by-date";
const RESULT_KEY = "commit-result-by-date";

// ========= 日付キー =========
function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}
function todayKey() {
  return dateKey(new Date());
}
function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dateKey(d);
}

// ========= storage =========
function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

type Result = "success" | "fail";

export default function NightPage() {
  const lang = "ja";
  const t = copy[lang].night;

  const key = todayKey();
  const yKey = yesterdayKey();

  const [debtMap, setDebtMap] = useState<Record<string, number>>({});
  const [promiseMap, setPromiseMap] = useState<Record<string, string>>({});
  const [resultMap, setResultMap] = useState<Record<string, Result>>({});
  const [last, setLast] = useState<Result | null>(null);
  const [flash, setFlash] = useState<string>("");

  const debtToday = debtMap[key] ?? 0;
  const promiseToday = (promiseMap[key] ?? "").trim();

  // 初回ロード
  useEffect(() => {
    setDebtMap(readJSON(DEBT_KEY, {}));
    setPromiseMap(readJSON(PROMISE_KEY, {}));
    setResultMap(readJSON(RESULT_KEY, {}));
  }, []);

  // ✅ 守れた
  const onSuccess = () => {
    setLast("success");

    // 1) 結果を保存
    setResultMap((prev) => {
      const next = { ...prev, [key]: "success" as const };
      writeJSON(RESULT_KEY, next);
      return next;
    });

    // 2) 「復帰ボーナス」：昨日fail→今日successなら、昨日のDebtを減らす
    //   ※ 今日のDebtを減らすより、"昨日の失敗を回収する"方が意味が通る
    setDebtMap((prev) => {
      const yResult = resultMap[yKey] ?? null;
      if (yResult !== "fail") {
        setFlash("記録しました。今日は戻れた。");
        return prev;
      }

      const yDebt = prev[yKey] ?? 0;
      const nextYDebt = Math.max(0, yDebt - RECOVERY_BONUS);
      const next = { ...prev, [yKey]: nextYDebt };

      writeJSON(DEBT_KEY, next);
      setFlash(`昨日のDebtを ${RECOVERY_BONUS}円 回収しました。`);
      return next;
    });
  };

  // ❌ 守れなかった
  const onFail = () => {
    setLast("fail");
    setFlash("記録しました。今日は責めない。明日に戻る。");

    // 1) 結果を保存
    setResultMap((prev) => {
      const next = { ...prev, [key]: "fail" as const };
      writeJSON(RESULT_KEY, next);
      return next;
    });

    // 2) Debtを加算
    setDebtMap((prev) => {
      const next = { ...prev, [key]: (prev[key] ?? 0) + PENALTY };
      writeJSON(DEBT_KEY, next);
      return next;
    });
  };

  // 今日をリセット（今日のDebtを0／結果を消す）
  const resetToday = () => {
    setLast(null);
    setFlash("今日の記録をリセットしました。");

    setDebtMap((prev) => {
      const next = { ...prev, [key]: 0 };
      writeJSON(DEBT_KEY, next);
      return next;
    });

    setResultMap((prev) => {
      const next = { ...prev };
      delete next[key];
      writeJSON(RESULT_KEY, next);
      return next;
    });
  };

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 920 }}>
      <h1>{t.title}</h1>

      {/* コンセプト（夜にうるさくない短さ） */}
      <div style={{ marginTop: 12, padding: 14, border: "1px solid #e5e5e5" }}>
        <div style={{ lineHeight: 1.8 }}>
          <div>ここは、裁く場所じゃない。</div>
          <div>自己嫌悪を「復帰」に変える場所。</div>
          <div>今日は事実だけ押して、明日に戻る。</div>
        </div>
      </div>

      <p style={{ marginTop: 18 }}>
        {formatText(t.promiseLabel, { date: key })}
      </p>

      <div style={{ marginTop: 8, padding: 12, border: "1px solid #ddd", maxWidth: 720 }}>
        {promiseToday ? (
          <b>{promiseToday}</b>
        ) : (
          <span>
            {t.noPromise}{" "}
            <Link href="/morning" style={{ textDecoration: "underline" }}>
              {t.writeMorning}
            </Link>
          </span>
        )}
      </div>

      <p style={{ marginTop: 16 }}>{t.question}</p>

      <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
        <button style={{ padding: "12px 20px", cursor: "pointer" }} onClick={onSuccess}>
          {t.success}
        </button>

        <button style={{ padding: "12px 20px", cursor: "pointer" }} onClick={onFail}>
          {formatText(t.fail, { penalty: PENALTY })}
        </button>

        <button style={{ padding: "12px 20px", cursor: "pointer" }} onClick={resetToday}>
          {t.reset}
        </button>
      </div>

      {flash ? (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #eee" }}>
          {flash}
        </div>
      ) : null}

      <p style={{ marginTop: 24, fontSize: 18 }}>
        {t.todayDebt} <b>{debtToday}</b>円
      </p>

      <p style={{ marginTop: 12 }}>
        {t.lastResult} <b>{last ?? "未入力"}</b>
      </p>

      <div style={{ marginTop: 24, display: "flex", gap: 16 }}>
        <Link href="/" style={{ textDecoration: "underline" }}>
          {t.backHome}
        </Link>
        <Link href="/morning" style={{ textDecoration: "underline" }}>
          {t.toMorning}
        </Link>
      </div>
    </main>
  );
}
