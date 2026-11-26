"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { useAuth } from "../context/AuthContext";

const subscribe = () => () => {};
const menuItemClassName = "block w-full py-2 text-left ";

export default function Header() {
  const router = useRouter();
  const { isLoggedIn, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isHydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();
    router.replace("/");
  };

  return (
    <header className="mx-auto mb-3 flex w-full flex-wrap items-center justify-between gap-x-4 px-4 shadow-sm md:px-10">
      <h1 className="text-3xl font-bold text-slate-900 md:text-4xl items-center">
        LifeNect
      </h1>

      <button
        type="button"
        className="inline-flex size-11 justify-center rounded text-3xl focus-visible:outline-2 md:hidden"
        aria-label={isMenuOpen ? "メニューを閉じる" : "メニューを開く"}
        aria-expanded={isMenuOpen}
        aria-controls="header-navigation"
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        <span aria-hidden="true">{isMenuOpen ? "×" : "☰"}</span>
      </button>

      <nav
        id="header-navigation"
        className={`${isMenuOpen ? "block" : "hidden"} md:block max-md:fixed max-md:inset-y-0 max-md:right-0 max-md:z-40 max-md:w-64 max-md:max-w-[85vw] max-md:overflow-y-auto max-md:bg-[#333] max-md:px-5 max-md:pt-2 max-md:pb-4 max-md:text-white`}
      >
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded text-3xl focus-visible:outline-2 md:hidden text-white"
          aria-label={isMenuOpen ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={isMenuOpen}
          aria-controls="header-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">{isMenuOpen ? "×" : "☰"}</span>
        </button>
        <ul className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4 max-md:text-2xl">
          <li>
            <Link
              href="/posts"
              onClick={closeMenu}
              className={menuItemClassName}
            >
              ホーム
            </Link>
          </li>
          <li>
            <Link
              href="/posts/ai"
              onClick={closeMenu}
              className={menuItemClassName}
            >
              AIモード
            </Link>
          </li>
          {isHydrated &&
            (isLoggedIn ? (
              <>
                <li>
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className={menuItemClassName}
                  >
                    マイページ
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={menuItemClassName}
                  >
                    ログアウト
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  href="/auth"
                  onClick={closeMenu}
                  className={menuItemClassName}
                >
                  ログイン
                </Link>
              </li>
            ))}
        </ul>
      </nav>
    </header>
  );
}
