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
            <Link className="nav-link link-light" to="/policy">
              プライバシーポリシー・Cookie
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link link-light" to="/term">
              ご利用にあたって
            </Link>
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
