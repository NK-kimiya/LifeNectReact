import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext.tsx";
const Footer: React.FC = () => {
  const { isAuthenticated, logout, isLoggingOut } = useAuth();
  return (
    <>
      <footer className="bg-dark text-white">
        <ul className="nav justify-content-center ">
          <li className="nav-item">
            <a
              className="nav-link link-light active"
              aria-current="page"
              href="#"
            >
              プライバシーポリシー
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link link-light" href="#">
              利用規約
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link link-light" href="">
              アンケート募集
            </a>
          </li>

          {isAuthenticated ? (
            <li className="nav-item">
              <Link
                className="nav-link link-light"
                to="/admin-login"
                onClick={() => logout()}
              >
                ログアウト
              </Link>
            </li>
          ) : (
            <li className="nav-item">
              <Link className="nav-link link-light" to="/admin-login">
                管理者ログイン
              </Link>
            </li>
          )}
        </ul>
      </footer>
    </>
  );
};

export default Footer;
