import React, { useState, useRef, useEffect } from "react";
import NavBar from "../Organisms/NavBar.tsx";
import styled from "styled-components";
import Footer from "../Organisms/Footer.tsx";
import ChatMessage from "../Organisms/ChatMessage.tsx";
import ChatInput from "../Organisms/ChatInput.tsx";
import TagSelect from "../Organisms/TagSelect.tsx";
import { fetchRagAnswer, IdTitle } from "../API/RagChat.tsx";
import { useChat } from "../Context/ChatContext.tsx";
import { Modal } from "bootstrap";
import Terms from "../Organisms/Terms.tsx";
import { useLocation } from "react-router-dom";
import { useTagSelection } from "../Context/TagSelectionContext.tsx";

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
  const [agreed, setAgreed] = useState<boolean>(false);
  const { pathname } = useLocation();
  const { clearSelection } = useTagSelection();

  const modalRef = useRef<HTMLDivElement | null>(null); // モーダル最上位<div>への参照
  const modalInstance = useRef<Modal | null>(null); //Bootstrap の Modalインスタンスを格納
  const hiddenHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // ★ 追加：後幕や body クラスを掃除するユーティリティ
    // ✅ 追加/修正：スクロールロック解除を強化
    const cleanBootstrapModalArtifacts = () => {
      // 1) body のクラスとスタイルを確実に戻す
      document.body.classList.remove("modal-open");
      document.body.style.removeProperty("padding-right");
      document.body.style.removeProperty("overflow"); // ★ 追加：overflow を明示解除

      // 2) html 側も保険で解除（環境/他ライブラリ対策）
      document.documentElement.style.removeProperty("overflow"); // ★ 追加

      // 3) 残っている backdrop を全削除
      document.querySelectorAll(".modal-backdrop").forEach((bd) => {
        bd.parentNode?.removeChild(bd);
      });
    };
    let cancelled = false; // ← このフラグは「このエフェクトが無効化された（アンマウントされた）」ことを示すための安全スイッチ。
    //非同期待機（await）の“後半処理”が動く前にコンポーネントが消えた場合、続きの処理を中断するために使う
    const showAsync = async () => {
      if (!modalRef.current) return; //ref にまだ DOM が割り当てられていない（初回直後など）場合は何もしないで終了
      if (!document.body.contains(modalRef.current)) return; //要素がまだ実 DOM ツリー（body 配下）に挿入されていない瞬間を弾く保険

      // ←【重要】描画完了フレームまで待つと「.style」nullエラーを回避しやすい
      await new Promise(requestAnimationFrame); //非同期処理は待機中になり、その間に開発中はアンマウントが行われる。

      if (cancelled || !modalRef.current) return; // ← 待機中にアンマウント（または StrictMode の一時アンマウント）が起きたら途中の処理を終了する。

      modalInstance.current = new Modal(modalRef.current, {
        backdrop: "static", // ← 背景クリックでは閉じない
        keyboard: false, // ← Esc キーでは閉じない
        focus: true,
      });

      const el = modalRef.current;

      const onHidden = () => {
        cleanBootstrapModalArtifacts();
        /* 必要ならここで setState 等 */
      };
      hiddenHandlerRef.current = onHidden;
      el.addEventListener("hidden.bs.modal", onHidden);

      modalInstance.current.show(); // ←【ここで自動表示】
    };

    showAsync();
    return () => {
      cancelled = true; //クリーンアップ時に「このエフェクトは無効化された」と印を付ける。
      //← モーダルを確実に閉じ、イベントリスナ等を解放してリークを防ぐ。
      const inst = modalInstance.current;
      const el = modalRef.current;
      if (el && hiddenHandlerRef.current) {
        el.removeEventListener("hidden.bs.modal", hiddenHandlerRef.current);
        hiddenHandlerRef.current = null;
      }
      if (inst && el) {
        // ★ ポイント：hidden を待ってから dispose
        const handleHiddenOnce = () => {
          inst.dispose();
          modalInstance.current = null;
          el.removeEventListener("hidden.bs.modal", handleHiddenOnce);
          cleanBootstrapModalArtifacts();
        };

        // once: true でワンタイム購読（二重dispose対策）
        el.addEventListener("hidden.bs.modal", handleHiddenOnce, {
          once: true,
        });

        // hide は最後に（イベント購読を済ませてから）
        inst.hide();
      } else {
        // 念のため
        modalInstance.current = null;
        cleanBootstrapModalArtifacts();
      }
    };
  }, []);

  useEffect(() => {
    if (pathname === "/chat") {
      clearSelection();
    }
  }, [pathname, clearSelection]);

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
      {/* ====== ここにモーダルのJSXを組み込む（class → className, tabindex → tabIndex） ====== */}
      <div
        ref={modalRef}
        className="modal fade"
        id="staticBackdrop" // ★ 同一idが他所に重複しないよう注意
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex={-1}
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                利用規約
              </h1>
            </div>
            <div className="modal-body">
              <Terms />
              <div className="form-check form-switch text-start">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="flexSwitchCheckChecked"
                  onChange={(e) => setAgreed(e.target.checked)}
                ></input>
                <label className="" for="flexSwitchCheckChecked">
                  同意する
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                disabled={!agreed}
              >
                利用する
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* ====== ここまで ====== */}
      <TagSelect variant="scroll" />
      <ScrollBoxContent style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
        {messages?.map((msg, idx) => (
          <ChatMessage
            key={idx}
            role={msg.role}
            content={msg.content}
            id_title_list={msg.unique_id_title_list}
          />
        ))}
        {loading && <p>AIが考えています...</p>}
      </ScrollBoxContent>
      <ChatInput onSend={handleSend} loading={loading} /> {/* ✅ 修正 */}
      <Footer />
    </div>
  );
};

export default AiChatTemplate;
