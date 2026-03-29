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
        keyword,
      )}`,
    );
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
    <div className="container">
      <div className="a">
        <div >
        <Link
            className="text-center"
            to="/"
            onClick={() => {
              toggleNav();
              closeNavbar();
            }}
          >
            <img src="/title.png" alt="Logo" className="navbar-logo me-2 text-center" style={{ display: "block", width: "100px" }}/>
          </Link>
          </div>
          {isAuthenticated ? (
              <div className="col-4">
                <button
                  className="btn btn-primary  me-2 text-white mb-2"
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
              <div className="col-4">
                <Link
                  to="/admin-login"
                  className="btn btn btn-primary  me-2 text-white mb-2"
                  onClick={closeNavbar}
                >
                  管理者ログイン
                </Link>
              </div>
            )}

        <div>
          <form className="position-relative " role="search">
            <input
              className="form-control pe-5 rounded-5 shadow p-3 pe-5"
              type="search"
              placeholder="Search"
              aria-label="Search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />

            <button
              className="btn position-absolute top-50 end-0 translate-middle-y me-2"
              type="submit"
              onClick={handleSearch}
            >
              <i className="bi bi-search"></i>
            </button>
          </form>
        </div>
      </div>
      </div>
      <div className="container p-3">
        <div className="container-fluid">
          <div className="row">
              <div className="nav-item col-4">
                <Link
                  className="nav-link text-start"
                  to="/"
                  onClick={() => {
                    toggleNav();
                    closeNavbar();
                  }}
                >
                  すべて
                </Link>
              </div>

              <div className="col-4">
                <Link
                  to="/chat"
                  type="button"
                  className="nav-link text-start"
                  onClick={() => {
                    toggleNav();
                    closeNavbar();
                  }}
                >
                  AIチャット
                  <i className="bi bi-chat-left "></i>
                </Link>
              </div>

            
          </div>
        </div>
      </div>
    </>
  );
};

export default NavBar;
