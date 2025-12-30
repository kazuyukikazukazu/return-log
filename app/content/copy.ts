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
  } as const;
  
  export type Lang = keyof typeof copy;
  