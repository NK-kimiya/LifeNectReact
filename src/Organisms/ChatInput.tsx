import React, { useState } from "react";
import styled from "styled-components";

const ScrollBoxContent = styled.div`
  width: 100%;

  @media (min-width: 992px) {
    width: 70%;
    margin: 0 auto;
  }
`;

interface ChatInputProps {
  onSend: (text: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };
  return (
    <>
      <div className="bg-white border-top">
        <div className="container pb-2" style={{ maxWidth: "80%" }}>
          <ScrollBoxContent>
            <div className="row h-100 align-items-center">
              <div className="col-10">
                <textarea
                  className="form-control"
                  rows={2}
                  style={{ resize: "none" }}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                ></textarea>
              </div>
              <div className="col-2 d-grid">
                <button
                  className="btn btn-success"
                  type="submit"
                  onClick={handleSubmit}
                >
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
