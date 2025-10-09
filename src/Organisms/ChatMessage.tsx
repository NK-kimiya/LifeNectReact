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

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content }) => {
  const isUser = role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        margin: "5px 0",
      }}
    >
      <div
        className="text-start"
        style={{
          background: isUser ? "#007bff" : "#e9ecef",
          color: isUser ? "#fff" : "#000",
          padding: "8px 12px",
          borderRadius: "12px",
          maxWidth: "70%",
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
        }}
      >
        {content}
      </div>
    </div>
  );
};

export default ChatMessage;
