"use client";

import { useAdminAuth } from "@/app/context/AdminAuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const menuItemClassName = "block w-full py-2 text-left";

export default function AdminHeader() {
  const router = useRouter();
  const { adminLogout } = useAdminAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    adminLogout();
    router.replace("/admin/login");
  };

  return (
    <header className="mx-auto mb-3 flex w-full flex-wrap items-center justify-between gap-x-4 px-4 shadow-sm md:px-10">
      <p className="text-xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
        LifeNect
      </p>

      <button
        type="button"
        className="inline-flex size-11 items-center justify-center rounded text-3xl focus-visible:outline-2 md:hidden"
        aria-label="メニューを開く"
        aria-expanded={isMenuOpen}
        aria-controls="admin-header-navigation"
        onClick={() => setIsMenuOpen(true)}
      >
        <span aria-hidden="true">☰</span>
      </button>

      <nav
        id="admin-header-navigation"
        aria-label="管理者メニュー"
        className={`${isMenuOpen ? "block" : "hidden"} md:block max-md:fixed max-md:inset-y-0 max-md:right-0 max-md:z-40 max-md:w-64 max-md:max-w-[85vw] max-md:overflow-y-auto max-md:bg-[#333] max-md:px-5 max-md:pt-2 max-md:pb-4 max-md:text-white`}
      >
        <button
          type="button"
          className="ml-auto flex size-11 items-center justify-center rounded text-3xl focus-visible:outline-2 md:hidden"
          aria-label="メニューを閉じる"
          onClick={closeMenu}
        >
          <span aria-hidden="true">×</span>
        </button>
        <ul className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4 max-md:text-xl">
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
            <Link
              href="/admin"
              onClick={closeMenu}
              className={menuItemClassName}
            >
              管理ダッシュボード
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
        </ul>
      </nav>
    </header>
  );
}
