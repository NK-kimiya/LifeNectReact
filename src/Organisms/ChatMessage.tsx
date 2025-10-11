import React from "react";
import styled from "styled-components";
import { IdTitle } from "../API/RagChat.tsx";
import { Link } from "react-router-dom";
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
  id_title_list: IdTitle[];
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  id_title_list,
}) => {
  const TopTitleBlogFetch = () => {
    let tagQuery = "";
  };
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
        <div>{content}</div>

        {id_title_list && id_title_list.length > 0 && (
          // style={{
          //   display: isUser ? "none" : "block",
          // }}
          <>
            <h6>もっとも関連度の高い記事</h6>
            {id_title_list?.map((item) => (
              <div>
                <Link key={item.id} className="" to={`/articles/${item.id}`}>
                  {item.title}
                </Link>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
