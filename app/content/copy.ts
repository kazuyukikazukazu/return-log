export const copy = {
    ja: {
      home: {
        title: "今日は、いくら自分を裏切りましたか？",
        subtitle: "夜、正直にボタンを押してください。",
        note: "※ 評価しない。記録するだけ。",
      },
      review: {
        hero: [
          "変わりたい夜に、ここへ来た時点であなたはもう動いている。",
          "今日の結果は、反省材料じゃない。",
          "“戻れる自分”を作った記録です。",
          "",
          "明日は、朝の約束を小さくする。",
          "夜は、事実だけ押す。",
          "それだけでいい。",
        ].join("\n"),
        intro: [
          "レビューは、月に一度だけ開く。",
          "開いたら、事実（数字）と、最後に“一文”だけ残す。",
          "評価しない。公開しない。自分のために残す。",
        ].join("\n"),
        footer: "自己嫌悪は「やめる」の燃料じゃない。「戻る」の合図だ。",
        openButton: "今月のレビューを開く",
      },
      night: {
        title: "夜のチェック",
        promiseLabel: "今日（{date}）の約束：",
        question: "今日は、約束を守れましたか？",
        success: "✅ 守れた",
        fail: "❌ 守れなかった（+{penalty}円）",
        reset: "今日をリセット",
        backHome: "← トップに戻る",
        toMorning: "朝の約束へ →",
        noPromise: "まだ朝の約束がありません。",
        writeMorning: "朝の約束を書く →",
        todayDebt: "今日のCommit Debt：",
        lastResult: "最後の結果：",
      },
    },
  
    // 国際化の“骨格”だけ先に用意（中身はあとでOK）
    en: {
      home: {
        title: "How many times did you betray yourself today?",
        subtitle: "At night, just press the honest button.",
        note: "*No judgment. Just a record.",
      },
      review: {
        hero: [
          "If you're here on a night you want to change, you're already moving.",
          "Today's result is not a reason to blame yourself.",
          "It's a record of becoming someone who can return.",
          "",
          "Tomorrow, make your morning promise smaller.",
          "At night, press only the facts.",
          "That's enough.",
        ].join("\n"),
        intro: [
          "Open this review only once a month.",
          "Look at the facts (numbers), then leave just one sentence.",
          "No judgment. Not public. For yourself.",
        ].join("\n"),
        footer: "Self-hate is not fuel to quit. It's a signal to return.",
        openButton: "Open this month's review",
      },
      night: {
        title: "Night check",
        promiseLabel: "Today's promise ({date}):",
        question: "Did you keep your promise today?",
        success: "✅ Kept it",
        fail: "❌ Didn't keep it (+{penalty} yen)",
        reset: "Reset today",
        backHome: "← Back to Home",
        toMorning: "Go to Morning →",
        noPromise: "No morning promise yet.",
        writeMorning: "Write morning promise →",
        todayDebt: "Commit Debt today:",
        lastResult: "Last result:",
      },
    },
  } as const;
  
  export type Lang = keyof typeof copy;
  
  // 置換（{date} とか）を安全に行うための共通関数
  export function formatText(
    text: string,
    params: Record<string, string | number> = {}
  ) {
    return text.replace(/\{(\w+)\}/g, (_, key) =>
      params[key] === undefined ? `{${key}}` : String(params[key])
    );
  }
  