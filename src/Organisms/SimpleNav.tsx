import React from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext.tsx";
import { useSearch } from "../Context/SearchContext.tsx";
import { useNav } from "../Context/NavManage.tsx";
import Collapse from "bootstrap/js/dist/collapse";

const SimpleNav: React.FC = () => {
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
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
  <div className="container-fluid">
  <a className="navbar-brand" href="#">
      <img src="/title.png" alt="" width="100" height="100" className="d-inline-block align-text-top"/>
    </a>
    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse" id="navbarNav">
      <ul className="navbar-nav">
        <li className="nav-item">
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
        </li>
        <li className="nav-item">
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
        </li>
  
        {isAuthenticated ? (
            <li className="nav-item">
                <button
                  type="button"
                  className="btn btn-primary  me-2"
                  onClick={async () => {
                    await logout();
                    closeNavbar(); // 追加: ログアウト後に閉じる
                  }}
                  disabled={isLoggingOut}
                >
                  ログアウト
                </button>
                </li>
    
            ) : (
              <li className="nav-item">
              <button type="button" className="btn btn-link text-primary">
                <Link
                  to="/admin-login"
                  className=" "
                  onClick={closeNavbar}
                >
                  管理者ログイン
                </Link>
                </button>
                </li>
            )}
      </ul>
    </div>
  </div>
</nav>

    </>
  );
};

export default SimpleNav;