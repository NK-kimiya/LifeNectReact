// ★新規: 検索キーワード共有Context
import React, { createContext, useContext, useMemo, useState } from "react";

type SearchCtx = {
  keyword: string;
  setKeyword: React.Dispatch<React.SetStateAction<string>>;
};

const SearchContext = createContext<SearchCtx | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [keyword, setKeyword] = useState("");
  const value = useMemo(() => ({ keyword, setKeyword }), [keyword]); // ★valueを安定化
  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};

export const useSearch = (): SearchCtx => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
};
