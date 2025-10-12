// src/Context/TagSelectionContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

type TagSelectionContextValue = {
  selectedTagIds: number[];
  setSelectedTagIds: React.Dispatch<React.SetStateAction<number[]>>; // ← 互換のまま提供
  toggleTag: (id: number) => void;
  selectOnlyTag: (id: number) => void;
  clearSelection: () => void;
};

const TagSelectionContext = createContext<TagSelectionContextValue | undefined>(
  undefined
);

const STORAGE_KEY = "selectedTagIds"; // ★追加: 保存キー

export const TagSelectionProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  // ★修正: lazy 初期化で sessionStorage から一度だけ読む
  const [selectedTagIds, _setSelectedTagIds] = useState<number[]>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as number[]) : [];
    } catch {
      return [];
    }
  });

  // ★追加: 配列同値チェック
  const arraysEqual = (a: number[], b: number[]) =>
    a.length === b.length && a.every((v, i) => v === b[i]);

  // ★重要: “同値なら更新しない” セッター（React の型そのまま維持）
  const setSelectedTagIds = useCallback<
    React.Dispatch<React.SetStateAction<number[]>>
  >((next) => {
    _setSelectedTagIds((prev) => {
      // next が関数 or 配列、両対応で解決
      const resolved = typeof next === "function" ? (next as any)(prev) : next;
      return arraysEqual(prev, resolved) ? prev : resolved; // ★同値なら prev を返す
    });
  }, []);

  // 既存: 複数選択トグル
  const toggleTag = useCallback(
    (id: number) => {
      setSelectedTagIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    },
    [setSelectedTagIds]
  );

  // 既存: 単一選択
  const selectOnlyTag = useCallback(
    (id: number) => {
      setSelectedTagIds((prev) =>
        prev.length === 1 && prev[0] === id ? [] : [id]
      );
    },
    [setSelectedTagIds]
  );

  // ★修正: 既に空なら更新しない（無限ループ抑止）
  const clearSelection = useCallback(() => {
    setSelectedTagIds((prev) => (prev.length ? [] : prev));
  }, [setSelectedTagIds]);

  // ★追加: 書き込み専用の同期。ここで setState は絶対にしない
  React.useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selectedTagIds));
    } catch {}
  }, [selectedTagIds]);

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
