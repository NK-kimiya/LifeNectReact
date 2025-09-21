import React from "react";
import styled from "styled-components";
const LoginBoxContent = styled.div`
  width: 80%;

  @media (min-width: 992px) {
    width: 480px;
  }
`;
const Auth = () => {
  return (
    <>
      <LoginBoxContent className="container border border-secondary-subtle rounded p-3 mt-5">
        <h3>管理者ログイン</h3>
        <form>
          <div className="mb-3 text-start">
            <label htmlFor="inputEmail3" className="col-form-label ">
              Email
            </label>
            <div className="">
              <input
                type="email"
                className="form-control"
                id="inputEmail3"
              ></input>
            </div>
          </div>

          <div className="mb-3 text-start">
            <label htmlFor="inputPassword3" className="col-form-label">
              Password
            </label>
            <div className="">
              <input
                type="password"
                className="form-control"
                id="inputPassword3"
              ></input>
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
