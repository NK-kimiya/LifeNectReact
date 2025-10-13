//1)importと型定義
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

import { safeSession } from "../utils/safeStorage.tsx"; // ★追加
import { useError } from "./ErrorContext.tsx";

type TagSelectionContextValue = {
  //Contextが外部に渡すAPIの形
  selectedTagIds: number[]; //（選択中のタグID配列）
  setSelectedTagIds: React.Dispatch<React.SetStateAction<number[]>>; // ← 互換のまま提供
  toggleTag: (id: number) => void; //操作用関数
  selectOnlyTag: (id: number) => void; //操作用関数
  clearSelection: () => void; //操作用関数
};

//2)Context本体の作成
const TagSelectionContext = createContext<TagSelectionContextValue | undefined>(
  undefined
);

//3)sessionStorage に保存・復元するときのキー名を一元管理
const STORAGE_KEY = "selectedTagIds"; // ★追加: 保存キー

export const TagSelectionProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { setError } = useError();
  //4)lazy 初期化で sessionStorage から復元、初回マウント時だけ sessionStorage から読む
  /*
  useState で 状態（selectedTagIds） と セッター（_setSelectedTagIds） を作成
  引数に関数を渡しているのは lazy 初期化 のため（初回マウント時だけこの関数が実行され、以降の再レンダでは実行されない）
  */
  const [selectedTagIds, _setSelectedTagIds] = useState<number[]>(() => {
    const r = safeSession.get(STORAGE_KEY); //sessionStorage からキー STORAGE_KEY（例: "selectedTagIds"）の値を文字列で取得
    if (!r.ok || r.value == null) return []; //値があれば JSON.parse して数値配列として解釈
    try {
      const parsed = JSON.parse(r.value) as number[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      console.log(
        "サイトデータ/ストレージがブロックされているため、選択状態を保存できません。Safariのプライベートブラウジングや、Cookieブロック設定を解除してご利用ください。"
      );
      return [];
    }
  });

  //4-2) 配列の同値判定ユーティリティ、内容が同じ配列かどうかの簡易チェック
  /*
  １：関数定義
  ・引数 a, b は数値配列
  ・返り値は 真偽値
  */
  const arraysEqual = (a: number[], b: number[]) =>
    a.length === b.length && a.every((v, i) => v === b[i]); //数値配列aとbを比べすべて一致してたらtrue

  //4-3) “同値なら更新しない” ラッパーセッター
  const setSelectedTagIds = useCallback<
    React.Dispatch<React.SetStateAction<number[]>>
  >((next) => {
    //引数 next は 配列そのもの か 前回値を受け取って次を返す関数
    _setSelectedTagIds((prev) => {
      const resolved = typeof next === "function" ? (next as any)(prev) : next; //関数なら：prev を渡して次の配列を計算、配列なら：そのまま次の配列
      /* 
      arraysEqual(prev, next) ? prev : next
      →中身が同じ配列なら React に「変更なし」と判定させられる
      */
      return arraysEqual(prev, resolved) ? prev : resolved; //内容が同じ配列なら、前の参照 prev をそのまま返す、内容が違う時だけ、新しい resolved を返して更新
    });
  }, []);

  //4-4) 操作関数、複数選択のトグル。

  const toggleTag = useCallback(
    (id: number) => {
      setSelectedTagIds((prev) =>
        /*
      prev.includes(id)→いまの選択配列 prev に id が含まれているか を判定
       ? prev.filter((x) => x !== id)→含まれている（true）場合：その id を取り除く。
       : [...prev, id]→含まれていない（false）場合：prev の末尾に id を追加した新配列を作る
      */
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    },
    [setSelectedTagIds]
  );

  // 既存: 単一選択
  const selectOnlyTag = useCallback(
    (id: number) => {
      setSelectedTagIds((prev) =>
        /*
      prev.length === 1 && prev[0] === id
      → いま1つだけ選択されており、しかもそれが同じ id なら→ 空配列 [] にする
      それ以外
      → [id] にする（＝この id だけを単一選択）
      */
        prev.length === 1 && prev[0] === id ? [] : [id]
      );
    },
    [setSelectedTagIds]
  );

  // ★修正: 既に空なら更新しない（無限ループ抑止）
  const clearSelection = useCallback(() => {
    /* 
    (prev.length ? [] : prev)
    →prev.length が 0でない（= 何か選ばれている）→ 空配列 [] にする
    →prev.length が 0（= もともと空）→ prev をそのまま返す
    */
    setSelectedTagIds((prev) => (prev.length ? [] : prev));
  }, [setSelectedTagIds]);

  //「描画が反映された後に実行する処理」
  //選択中のタグID配列（selectedTagIds）をブラウザのセッションストレージに保存し、タブを閉じるまでの間は状態を持続させる
  React.useEffect(() => {
    // ユーザー操作（toggle等）の結果として保存し、失敗したら通知
    const r = safeSession.set(STORAGE_KEY, JSON.stringify(selectedTagIds)); // ★修正
    if (!r.ok) {
      setError(
        "ブラウザの保存領域にアクセスできません。設定やプライベートモードをご確認ください"
      ); // ★追加
    }
  }, [selectedTagIds, setError]);

  // ★value を useMemo で安定化（毎レンダ新参照を防ぐ）
  const value = useMemo<TagSelectionContextValue>(
    () => ({
      selectedTagIds,
      setSelectedTagIds, // 互換APIのまま
      toggleTag,
      selectOnlyTag,
      clearSelection,
    }),
    [
      selectedTagIds,
      setSelectedTagIds,
      toggleTag,
      selectOnlyTag,
      clearSelection,
    ]
  );

  return (
    <TagSelectionContext.Provider value={value}>
      {children}
    </TagSelectionContext.Provider>
  );
};

// （必要なら）外部で使うためのフック
export const useTagSelection = () => {
  const ctx = useContext(TagSelectionContext);
  if (!ctx) throw new Error("useTagSelection must be used within provider");
  return ctx;
};
