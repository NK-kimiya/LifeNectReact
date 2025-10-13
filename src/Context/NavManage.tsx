// NavManage.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

// コンテキストで管理する状態の型を定義
type NavContextType = {
  isNavActive: boolean; // trueかfalseかを管理
  toggleNav: () => void; // true/falseを切り替えるための関数
};

// 初期値を設定
const defaultState: NavContextType = {
  isNavActive: false,
  toggleNav: () => {},
};

// コンテキストを作成
const NavContext = createContext<NavContextType>(defaultState);

// コンテキストプロバイダー
type NavProviderProps = {
  children: ReactNode;
};

export const NavProvider = ({ children }: NavProviderProps) => {
  const [isNavActive, setIsNavActive] = useState<boolean>(false);

  const toggleNav = () => {
    setIsNavActive((prevState) => !prevState);
  };

  return (
    <NavContext.Provider value={{ isNavActive, toggleNav }}>
      {children}
    </NavContext.Provider>
  );
};

// コンテキストを呼び出すためのカスタムフック
export const useNav = () => {
  return useContext(NavContext);
};
