import React, { useState } from "react";
import NavBar from "../Organisms/NavBar.tsx";
import styled from "styled-components";
import Footer from "../Organisms/Footer.tsx";
import ChatMessage from "../Organisms/ChatMessage.tsx";
import ChatInput from "../Organisms/ChatInput.tsx";
import TagSelect from "../Organisms/TagSelect.tsx";
import { fetchRagAnswer, IdTitle } from "../API/RagChat.tsx";
import { useChat } from "../Context/ChatContext.tsx";
const ScrollBoxContent = styled.div`
  width: 100%;

  @media (min-width: 992px) {
    width: 70%;
    margin: 0 auto;
  }
`;

interface Message {
  role: "user" | "assistant";
  content: string;
  unique_id_title_list: IdTitle[];
}

const AiChatTemplate: React.FC = () => {
  const { messages, setMessages } = useChat();
  const [loading, setLoading] = useState(false);

  const handleSend = async (text: string, allowSave: boolean) => {
    // ユーザーメッセージを追加
    const userMessage: Message = {
      role: "user",
      content: text,
      unique_id_title_list: [],
    };
    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);
    try {
      const res = await fetchRagAnswer(text, allowSave);
      const botMessage: Message = {
        role: "assistant",
        content: res.data.answer,
        unique_id_title_list: res.data.article,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      // const errorMessage: Message = {
      //   role: "assistant",
      //   content: "エラーが発生しました。もう一度お試しください。",
      // };
      // setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex flex-column"
      style={{ height: "100vh", overflow: "hidden" }}
    >
      <NavBar />
      <TagSelect variant="scroll" />
      <ScrollBoxContent style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
        {messages.map((msg, idx) => (
          <ChatMessage
            key={idx}
            role={msg.role}
            content={msg.content}
            id_title_list={msg.unique_id_title_list}
          />
        ))}
        {loading && <p>AIが考えています...</p>}
      </ScrollBoxContent>
      <ChatInput onSend={handleSend} /> {/* ✅ 修正 */}
      <Footer />
    </div>
  );
};

export default AiChatTemplate;
