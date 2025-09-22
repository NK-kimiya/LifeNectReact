import React from "react";
import { Link } from "react-router-dom";

const NavBar: React.FC = () => {
  return (
    <>
      <nav className="navbar navbar-expand-lg bg-success">
        <div className="container-fluid">
          <Link className="navbar-brand text-white" to="/">
            LifeConnect
          </Link>
          <button
            className="navbar-toggler   bg-success"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarTogglerDemo02"
            aria-controls="navbarTogglerDemo02"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link text-white text-start" to="/">
                  ブログ一覧
                </Link>
              </li>
              <li className="nav-item text-start">
                <Link
                  to="/chat"
                  type="button"
                  className="btn btn-secondary  align-items-center rounded-pill bg-warning"
                >
                  AIチャット<i className="bi bi-chat-left "></i>
                </Link>
              </li>
            </ul>
            <form className="d-flex" role="search">
              <input
                className="form-control me-2"
                type="search"
                placeholder="Search"
                aria-label="Search"
              ></input>
              <button
                className="btn btn-outline-success bg-warning text-white"
                type="submit"
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
