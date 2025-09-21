import React from "react";
import styled from "styled-components";
const ScrollBoxContent = styled.div`
  width: 100%;

  @media (min-width: 992px) {
    width: 70%;
    margin: 0 auto;
  }
`;
const ChatInput = () => {
  return (
    <>
      <div className="bg-white border-top" style={{ height: "20vh" }}>
        <div className="container" style={{ maxWidth: "80%" }}>
          <ScrollBoxContent>
            <div className="row h-100 align-items-center">
              <div className="col-10">
                <textarea
                  className="form-control"
                  rows={2}
                  style={{ resize: "none" }}
                ></textarea>
              </div>
              <div className="col-2 d-grid">
                <button className="btn btn-primary" type="submit">
                  <i className="bi bi-send"></i>
                </button>
              </div>
            </div>
          </ScrollBoxContent>
        </div>
      </div>
    </>
  );
};

export default ChatInput;
