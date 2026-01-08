"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { copy } from "../content/copy";

const DEBT_KEY = "commit-debt-by-date";
const RESULT_KEY = "commit-result-by-date";
const REVIEW_OPENED_KEY = "commit-review-opened-by-month"; // { "2025-12": true }
const REVIEW_NOTE_KEY = "commit-review-note-by-month";     // { "2025-12": "..." }

function monthKey(date: Date) {
  // "YYYY-MM"
  return date.toISOString().slice(0, 7);
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

type Result = "success" | "fail";

export default function ReviewPage() {
　const lang = "ja";
　const t = copy[lang].review;
  const nowMonth = useMemo(() => monthKey(new Date()), []);
  const [mounted, setMounted] = useState(false);

  const [debtMap, setDebtMap] = useState<Record<string, number>>({});
  const [resultMap, setResultMap] = useState<Record<string, Result>>({});
  const [openedByMonth, setOpenedByMonth] = useState<Record<string, boolean>>({});
  const [noteByMonth, setNoteByMonth] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");

  useEffect(() => {
    setDebtMap(readJSON<Record<string, number>>(DEBT_KEY, {}));
    setResultMap(readJSON<Record<string, Result>>(RESULT_KEY, {}));
    const opened = readJSON<Record<string, boolean>>(REVIEW_OPENED_KEY, {});
    const notes = readJSON<Record<string, string>>(REVIEW_NOTE_KEY, {});
    setOpenedByMonth(opened);
    setNoteByMonth(notes);
    setNote(notes[nowMonth] ?? "");
    setMounted(true);
  }, [nowMonth]);

  const isOpened = !!openedByMonth[nowMonth];

  // ---- 月の統計（開いた後だけ表示する前提） ----
  const monthPrefix = nowMonth; // "YYYY-MM"
  const monthResults = Object.entries(resultMap).filter(([d]) => d.startsWith(monthPrefix));
  const recordedDays = monthResults.length;

  const successDays = monthResults.filter(([, v]) => v === "success").length;
  const failDays = monthResults.filter(([, v]) => v === "fail").length;

  const successRate =
    recordedDays === 0 ? null : Math.round((successDays / recordedDays) * 100);

  // 最長 streak（success 連続最大）
  const sortedDays = monthResults
    .map(([d, v]) => ({ d, v }))
    .sort((a, b) => a.d.localeCompare(b.d));

  let bestStreak = 0;
  let curStreak = 0;
  for (const item of sortedDays) {
    if (item.v === "success") {
      curStreak += 1;
      if (curStreak > bestStreak) bestStreak = curStreak;
    } else {
      curStreak = 0;
    }
  }

  // fail -> success の回数（前日が fail で当日 success）
  let comebackCount = 0;
  for (let i = 1; i < sortedDays.length; i++) {
    if (sortedDays[i - 1].v === "fail" && sortedDays[i].v === "success") {
      comebackCount += 1;
    }
  }

  // 月の debt 合計
  const monthDebtTotal = Object.entries(debtMap)
    .filter(([d]) => d.startsWith(monthPrefix))
    .reduce((sum, [, v]) => sum + (v ?? 0), 0);

  const openReview = () => {
    setOpenedByMonth((prev) => {
      const next = { ...prev, [nowMonth]: true };
      writeJSON(REVIEW_OPENED_KEY, next);
      return next;
    });
  };

  const saveNote = () => {
    setNoteByMonth((prev) => {
      const next = { ...prev, [nowMonth]: note };
      writeJSON(REVIEW_NOTE_KEY, next);
      return next;
    });
  };

  // localStorage 未読込みの一瞬をガード（表示ズレ防止）
  if (!mounted) {
    return <main style={{ padding: 40, fontFamily: "sans-serif" }} />;
  }

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 900 }}>
      {/* --- 上の“思想メッセージ”は常に表示でOK --- */}
      <div style={{ border: "1px solid #e5e5e5", padding: 16, lineHeight: 1.9, whiteSpace: "pre-line" }}>
 　　 {t.hero}
　　　</div>


      <h1 style={{ marginTop: 28 }}>月末レビュー</h1>
      <p style={{ marginTop: 8 }}>今月（{nowMonth}）の記録を、静かに確認する。</p>

      {/* ===== B案：開く前は“説明＋ボタンのみ” ===== */}
      {!isOpened ? (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 14, lineHeight: 1.8, color: "#333", whiteSpace: "pre-line" }}>
 　　　　　 {t.intro}
　　　　　</div>


          <button
            onClick={openReview}
            style={{
              marginTop: 16,
              padding: "12px 18px",
              border: "1px solid #000",
              background: "transparent",
              cursor: "pointer",
            }}
          >
           {t.openButton}
          </button>

          <div style={{ marginTop: 20, display: "flex", gap: 14 }}>
            <Link href="/" style={{ textDecoration: "underline" }}>
              ← トップに戻る
            </Link>
            <Link href="/night" style={{ textDecoration: "underline" }}>
              夜のチェックへ →
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* ===== 開いた後：事実ブロック ===== */}
          <div
            style={{
              marginTop: 18,
              border: "1px solid #e5e5e5",
              padding: 18,
              lineHeight: 2.0,
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 18 }}>今月の事実</h2>

            <div>記録した日数：<b>{recordedDays}</b>日</div>
            <div>
              守れた日数：<b>{successDays}</b>日 ／ 裏切った日数：<b>{failDays}</b>日
            </div>
            <div>
              今月の守れた率：<b>{successRate === null ? "-" : `${successRate}%`}</b>
            </div>
            <div>一番長く続いた streak：<b>{bestStreak}</b>日</div>
            <div>戻ってきた回数（fail→success）：<b>{comebackCount}</b>回</div>
            <div>今月のCommit Debt 合計：<b>{monthDebtTotal}</b>円</div>
          </div>

          {/* ===== 開いた後：一文入力 ===== */}
          <div
            style={{
              marginTop: 18,
              border: "1px solid #e5e5e5",
              padding: 18,
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 18 }}>今月の自分へ（一文）</h2>
            <div style={{ fontSize: 12, marginBottom: 10 }}>
              評価しない。公開しない。自分のために残す。
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例：戻ってきた。次は朝の約束を小さくする。"
              style={{
                width: "100%",
                height: 180,
                padding: 12,
                fontSize: 14,
                lineHeight: 1.8,
                border: "1px solid #ddd",
                resize: "vertical",
              }}
            />

            <div style={{ marginTop: 12, display: "flex", gap: 14, alignItems: "center" }}>
              <button
                onClick={saveNote}
                style={{
                  padding: "10px 16px",
                  border: "1px solid #000",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                保存
              </button>

              <Link
                href="/night"
                style={{
                  display: "inline-block",
                  padding: "10px 16px",
                  border: "1px solid #000",
                  textDecoration: "none",
                }}
              >
                夜のチェックへ →
              </Link>
            </div>
          </div>

          <p style={{ marginTop: 18, color: "#333" }}>{t.footer}</p>

          <div style={{ marginTop: 12, display: "flex", gap: 14 }}>
            <Link href="/" style={{ textDecoration: "underline" }}>
              ← トップに戻る
            </Link>
            <Link href="/morning" style={{ textDecoration: "underline" }}>
              朝の約束へ →
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
