import React from "react";
import styled from "styled-components";
const ScrollBoxContent = styled.div`
  width: 100%;

  @media (min-width: 992px) {
    width: 70%;
    margin: 0 auto;
  }
`;
const ChatMessage = () => {
  return (
    <>
      <div
        className="container flex-grow-1 overflow-auto"
        style={{ maxWidth: "80%", height: "80vh" }}
      >
        <ScrollBoxContent>
          <div
            className="rounded p-3 text-start ms-auto"
            style={{ maxWidth: "75%", backgroundColor: "#f0f8ff" }}
          >
            <p className="fw-bold mb-1">質問：</p>
            <p>うつ病の人がどのように就職をしているかを教えて</p>
          </div>
          <div
            className="border-bottom text-start mt-3"
            style={{ maxWidth: "75%" }}
          >
            <p className="fw-bold mb-1">回答</p>
            <p>
              うつ病を経験した方の就職方法としては以下の通りです。…（省略）…
              …（省略）……（省略）……（省略）……（省略）……（省略）…
              …（省略）……（省略）……（省略）……（省略）……（省略）…
              …（省略）……（省略）……（省略）……（省略）……（省略）…
              …（省略）……（省略）……（省略）……（省略）……（省略）…
            </p>
          </div>

          <div
            className="rounded p-3 text-start ms-auto"
            style={{ maxWidth: "75%", backgroundColor: "#f0f8ff" }}
          >
            <p className="fw-bold mb-1">質問：</p>
            <p>うつ病の人がどのように就職をしているかを教えて</p>
          </div>
          <div
            className="border-bottom text-start mt-3"
            style={{ maxWidth: "75%" }}
          >
            <p className="fw-bold mb-1">回答</p>
            <p>
              うつ病を経験した方の就職方法としては以下の通りです。…（省略）…
              …（省略）……（省略）……（省略）……（省略）……（省略）…
              …（省略）……（省略）……（省略）……（省略）……（省略）…
              …（省略）……（省略）……（省略）……（省略）……（省略）…
              …（省略）……（省略）……（省略）……（省略）……（省略）…
            </p>
          </div>

          <div
            className="rounded p-3 text-start ms-auto"
            style={{ maxWidth: "75%", backgroundColor: "#f0f8ff" }}
          >
            <p className="fw-bold mb-1">質問：</p>
            <p>うつ病の人がどのように就職をしているかを教えて</p>
          </div>
          <div
            className="border-bottom text-start mt-3"
            style={{ maxWidth: "75%" }}
          >
            <p className="fw-bold mb-1">回答</p>
            <p>
              うつ病を経験した方の就職方法としては以下の通りです。…（省略）…
              …（省略）……（省略）……（省略）……（省略）……（省略）…
              …（省略）……（省略）……（省略）……（省略）……（省略）…
              …（省略）……（省略）……（省略）……（省略）……（省略）…
              …（省略）……（省略）……（省略）……（省略）……（省略）…
            </p>
          </div>

          <div
            className="rounded p-3 text-start ms-auto"
            style={{ maxWidth: "75%", backgroundColor: "#f0f8ff" }}
          >
            <p className="fw-bold mb-1">質問：</p>
            <p>うつ病の人がどのように就職をしているかを教えて</p>
          </div>
          <div
            className="border-bottom text-start mt-3"
            style={{ maxWidth: "75%" }}
          >
            <p className="fw-bold mb-1">回答</p>
            <p>
              うつ病を経験した方の就職方法としては以下の通りです。…（省略）…
              …（省略）……（省略）……（省略）……（省略）……（省略）…
              …（省略）……（省略）……（省略）……（省略）……（省略）…
              …（省略）……（省略）……（省略）……（省略）……（省略）…
              …（省略）……（省略）……（省略）……（省略）……（省略）…
            </p>
          </div>
        </ScrollBoxContent>
      </div>
    </>
  );
};

export default ChatMessage;
