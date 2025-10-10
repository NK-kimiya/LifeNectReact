import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Cookies from "js-cookie";

const ScrollBoxContent = styled.div`
  width: 100%;

  @media (min-width: 992px) {
    width: 70%;
    margin: 0 auto;
  }
`;

interface ChatInputProps {
  onSend: (text: string, allowSave: boolean) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const [text, setText] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const consent = Cookies.get("allowChatSave");
    if (consent === undefined) {
      setShowModal(true); // cookieがない場合のみ表示
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const consent = Cookies.get("allowChatSave");
    const allowSave = consent === "true";

    onSend(text, allowSave);
    setText("");
  };

  const handleAllow = () => {
    Cookies.set("allowChatSave", "true", { expires: 30 }); // 30日有効
    setShowModal(false);
  };

  // モーダルの拒否処理
  const handleDeny = () => {
    Cookies.set("allowChatSave", "false", { expires: 30 });
    setShowModal(false);
  };
  return (
    <>
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h5>チャット内容を保存して精度向上に利用してもよろしいですか？</h5>
            <div style={{ marginTop: "15px" }}>
              <button
                onClick={handleAllow}
                style={{ marginRight: "10px" }}
                className="btn btn-primary"
              >
                許可する
              </button>
              <button onClick={handleDeny} className="btn btn-secondary">
                拒否する
              </button>
            </div>
          </div>
        </div>
      )}

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
