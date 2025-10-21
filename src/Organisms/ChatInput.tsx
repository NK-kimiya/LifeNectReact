import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Cookies from "js-cookie";
import { useError } from "../Context/ErrorContext.tsx";
import { safeCookie } from "../utils/safeStorage.tsx";
import Aleart from "./Aleart.tsx";

const ScrollBoxContent = styled.div`
  width: 100%;

  @media (min-width: 992px) {
    width: 70%;
    margin: 0 auto;
  }
`;

interface ChatInputProps {
  onSend: (text: string, allowSave: boolean) => void;
  loading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, loading }) => {
  const [text, setText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const { setError } = useError();

  useEffect(() => {
    const r = safeCookie.get("allowChatSave");
    if (!r.ok) {
      // ← 追加（読み取り例外時は静かにフォールバック）
      // 読み取りに失敗: モーダルを出してユーザーに選択させる
      setShowModal(true);
      return;
    }
    const consent = r.value; // ← 追加: "true"/"false" or null
    if (consent === null) {
      setShowModal(true); // cookieがない場合のみ表示（従来通り）
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const r = safeCookie.get("allowChatSave");
    const consent = r.ok ? r.value : null;
    const allowSave = consent === "true";

    onSend(text, allowSave);
    setText("");
  };

  const verifyWrite = (expected: string) => {
    // ★追加: 書き込み後に読み直して検証（静かに失敗対策）
    const vr = safeCookie.get("allowChatSave");
    return vr.ok && vr.value === expected;
  };

  const handleAllow = () => {
    const r = safeCookie.set("allowChatSave", "true", {
      days: 30,
      path: "/",
      sameSite: "Lax",
    });
    if (!r.ok || !verifyWrite("true")) {
      setError(
        "Cookieが利用できません。サイトによるデバイスへのデータの保存を許可にして再度リロードして下さい。"
      ); // ← 追加: 明示通知
      // 失敗時でもUIは閉じず、ユーザーに再試行させたい場合は return で抜ける
      // return;
    }
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
                className="btn btn-success"
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
                  disabled={loading}
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
