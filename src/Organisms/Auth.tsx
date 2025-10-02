import React, { useState } from "react";
import styled from "styled-components";
import { login } from "../API/Login.tsx";
import { useError } from "../Context/ErrorContext.tsx";
import Aleart from "./Aleart.tsx";
import { useNavigate } from "react-router-dom";
const LoginBoxContent = styled.div`
  width: 80%;

  @media (min-width: 992px) {
    width: 480px;
  }
`;

type AuthProps = {
  onSubmit: (username: string, password: string) => void; // 親から渡す
};
const Auth: React.FC<AuthProps> = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { error, setError } = useError(); // Context から取得

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(username, password);
  };
  return (
    <>
      <Aleart />
      <LoginBoxContent className="container border border-secondary-subtle rounded p-3 mt-5">
        <h3>管理者ログイン</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 text-start">
            <label htmlFor="inputEmail3" className="col-form-label ">
              Email
            </label>
            <div className="">
              <input
                type="text"
                placeholder="ユーザー名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-3 text-start">
            <label htmlFor="inputPassword3" className="col-form-label">
              Password
            </label>
            <div className="">
              <input
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary pt-2 pb-2 ps-5 pe-5">
            ログイン
          </button>
        </form>
      </LoginBoxContent>
    </>
  );
};

export default Auth;
