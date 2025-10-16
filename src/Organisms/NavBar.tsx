import React from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext.tsx";
import { useSearch } from "../Context/SearchContext.tsx";
import { useNav } from "../Context/NavManage.tsx";
import Collapse from "bootstrap/js/dist/collapse";

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const { keyword, setKeyword } = useSearch();
  const { isNavActive, toggleNav } = useNav();
  const { isAuthenticated, logout, isLoggingOut } = useAuth();

  const closeNavbar = () => {
    const el = document.getElementById("navbarTogglerDemo02");
    if (!el) return;

    // getOrCreateInstance がある場合はそれを使う
    const instance = (Collapse as any).getOrCreateInstance
      ? (Collapse as any).getOrCreateInstance(el, { toggle: false })
      : new (Collapse as any)(el, { toggle: false });

    instance.hide();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    // 🔽 クエリパラメータ付きで検索ページに遷移
    navigate(
      `/article-search?search=keyword&keywordName=${encodeURIComponent(
        keyword
      )}`
    );
    setKeyword("");
  };

  const toggleNavbar = () => {
    const el = document.getElementById("navbarTogglerDemo02");
    if (!el) return;
    const inst = (Collapse as any).getOrCreateInstance
      ? (Collapse as any).getOrCreateInstance(el, { toggle: false })
      : new (Collapse as any)(el, { toggle: false });
    inst.toggle(); // ← ボタンを押すたびに開閉
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-success">
        <div className="container-fluid">
          <Link
            className="navbar-brand text-white"
            to="/"
            onClick={() => {
              toggleNav();
              closeNavbar();
            }}
          >
            LifeConnect
          </Link>
          <button
            className="navbar-toggler bg-success"
            type="button"
            aria-controls="navbarTogglerDemo02"
            aria-expanded="false"
            aria-label="Toggle navigation"
            onClick={toggleNavbar}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link
                  className="nav-link text-white text-start"
                  to="/"
                  onClick={() => {
                    toggleNav();
                    closeNavbar();
                  }}
                >
                  ブログ一覧
                </Link>
              </li>

              {isAuthenticated ? (
                <>
                  <li className="nav-item">
                    <Link
                      to="/admin-top"
                      type="button"
                      className="nav-link text-white text-start"
                      onClick={closeNavbar}
                    >
                      管理者ページ
                    </Link>
                  </li>
                </>
              ) : (
                <></>
              )}

              <li className="nav-item text-start">
                <Link
                  to="/chat"
                  type="button"
                  className="btn btn-secondary  align-items-center rounded-pill bg-warning"
                  onClick={() => {
                    toggleNav();
                    closeNavbar();
                  }}
                >
                  AIチャット
                  <i className="bi bi-chat-left "></i>
                </Link>
              </li>
            </ul>

            {isAuthenticated ? (
              <div className="d-flex justify-content-start">
                <button
                  className="btn btn btn-link  me-2 text-white"
                  onClick={async () => {
                    await logout();
                    closeNavbar(); // 追加: ログアウト後に閉じる
                  }}
                  disabled={isLoggingOut}
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <div className="d-flex justify-content-start">
                <Link
                  to="/admin-login"
                  className="btn btn btn-link  me-2 text-white"
                  onClick={closeNavbar}
                >
                  管理者ログイン
                </Link>
              </div>
            )}
            <form className="d-flex" role="search">
              <input
                className="form-control me-2"
                type="search"
                placeholder="Search"
                aria-label="Search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              ></input>
              <button
                className="btn btn-outline-success bg-warning text-white"
                type="submit"
                onClick={handleSearch}
              >
                <i className="bi bi-search"></i>
              </button>
            </form>
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
