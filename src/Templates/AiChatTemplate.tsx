import React from "react";
import NavBar from "../Organisms/NavBar.tsx";
import styled from "styled-components";
import Footer from "../Organisms/Footer.tsx";
import ChatMessage from "../Organisms/ChatMessage.tsx";
import ChatInput from "../Organisms/ChatInput.tsx";
import TagSelect from "../Organisms/TagSelect.tsx";

const ScrollBoxContent = styled.div`
  width: 100%;

  @media (min-width: 992px) {
    width: 70%;
    margin: 0 auto;
  }
`;

const AiChatTemplate: React.FC = () => {
  return (
    <div
      className="d-flex flex-column"
      style={{ height: "100vh", overflow: "hidden" }}
    >
      <NavBar />
      <TagSelect variant="scroll" />
      <ChatMessage />
      <ChatInput />
      <Footer />
    </div>
  );
};

export default AiChatTemplate;
