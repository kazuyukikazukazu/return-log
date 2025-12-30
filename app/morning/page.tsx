"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "commit-promise-by-date";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function readMap(): Record<string, string> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export default function MorningPage() {
  const key = useMemo(() => todayKey(), []);
  const [map, setMap] = useState<Record<string, string>>({});
  const [text, setText] = useState("");

  useEffect(() => {
    const m = readMap();
    setMap(m);
    setText(m[key] ?? "");
  }, [key]);

  const save = () => {
    const t = text.trim();
    const next = { ...map, [key]: t };
    setMap(next);
    writeMap(next);
    alert("保存しました");
  };

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>朝の約束</h1>
      <p style={{ marginTop: 12 }}>今日（{key}）の約束を1つだけ書く。</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="例：寝る前30分はスマホを触らない"
        rows={4}
        style={{ marginTop: 16, width: "100%", maxWidth: 520, padding: 12 }}
      />

      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <button style={{ padding: "12px 20px", cursor: "pointer" }} onClick={save}>
          保存
        </button>

        <Link
          href="/night"
          style={{ display: "inline-block", padding: "12px 20px", border: "1px solid #000", textDecoration: "none" }}
        >
          夜のチェックへ →
        </Link>
      </div>

      <div style={{ marginTop: 24 }}>
        <Link href="/" style={{ textDecoration: "underline" }}>
          ← トップに戻る
        </Link>
      </div>
    </main>
  );
}
