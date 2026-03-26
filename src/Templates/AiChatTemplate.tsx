import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "../Organisms/ChatMessage.tsx";
import ChatInput from "../Organisms/ChatInput.tsx";
// import TagSelect from "../Organisms/TagSelect.tsx";
import { fetchRagAnswer, IdTitle } from "../API/RagChat.tsx";
import { useChat } from "../Context/ChatContext.tsx";
import { Modal } from "bootstrap";
import Terms from "../Organisms/Terms.tsx";
import { useLocation } from "react-router-dom";
import { useTagSelection } from "../Context/TagSelectionContext.tsx";
import Aleart from "../Organisms/Aleart.tsx";
import { useError } from "../Context/ErrorContext.tsx";
import NavBarAi from "../Organisms/NavBarAi.tsx";
import axios from "axios";


interface Message {
  role: "user" | "assistant";
  content: string;
  unique_id_title_list: IdTitle[];

  mode?: "normal" | "safety_only";
  primary_support?: {
    title: string;
    name: string;
    url: string;
  } | null;
  other_supports?: {
    name: string;
    url: string;
  }[];
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
  const { setError } = useError();

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
        unique_id_title_list: res.data.article ?? [],

        mode: res.data.mode,
        primary_support: res.data.primary_support,
        other_supports: res.data.other_supports,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.detail || "エラーが発生しました");
      } else {
        setError("不明なエラーが発生しました");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column">
      <NavBarAi />
      <Aleart />
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
                AIチャットのご利用にあたって
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
                <label className="" htmlFor="flexSwitchCheckChecked">
                  上記に理解し、同意する
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
      {/* <TagSelect variant="scroll" /> */}
      {messages && messages.length > 0 ? (
        <div>
          {messages.map((msg, idx) => (
            <ChatMessage
              key={idx}
              role={msg.role}
              content={msg.content}
              id_title_list={msg.unique_id_title_list}
              mode={msg.mode}
              primary_support={msg.primary_support}
              other_supports={msg.other_supports}
            />
          ))}
          <div className="position-fixed bottom-0 w-100">
            <ChatInput onSend={handleSend} loading={loading} />
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column justify-content-center align-items-center vh-50">
          <h3>LifeConnect-AI</h3>
          <p>当事者の体験をベースに、AIが質問に答えます。</p>
          <div className="container">
            <ChatInput onSend={handleSend} loading={loading} />
            <p className="text-center">このサービスは、当事者の体験談を提供することを目的としています。当事者個人の体験であり個人差があります。診断や治療など重要なことは、専門機関にご相談ください。</p>
          </div>
        </div>
      )}
      <div className="container">{loading && <p>AIが考えています...</p>}</div>
      {/* ✅ 修正 */}
      {/* <Footer /> */}
    </div>
  );
};

export default AiChatTemplate;
