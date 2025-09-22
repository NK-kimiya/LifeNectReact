import React from "react";
import styled from "styled-components";
const ScrollBoxContent = styled.div`
  width: 100%;

  @media (min-width: 992px) {
    width: 70%;
    margin: 0 auto;
  }

  overflow-y: auto;

  /* IE, Edge (旧) */
  -ms-overflow-style: none;

  max-height: 60vh;

  /* Chrome, Safari (Webkit系) */
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ChatMessage: React.FC = () => {
  return (
    <>
      <div
        className="container flex-grow-1 pt-5"
        style={{ maxWidth: "80%", height: "80vh" }}
      >
        <ScrollBoxContent className="">
          <div
            className="rounded p-3 text-start ms-auto"
            style={{ maxWidth: "75%", backgroundColor: "#f5f5f5" }}
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
            style={{ maxWidth: "75%", backgroundColor: "#f5f5f5" }}
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
            style={{ maxWidth: "75%", backgroundColor: "#f5f5f5" }}
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
            style={{ maxWidth: "75%", backgroundColor: "#f5f5f5" }}
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
