"use client"; //使用する機能の読み込み
import UserAvatar from "@/app/components/UserAvatar";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
const API_BASE_URL = //API接続先の設定
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

type User = {
  //基本データの型定義
  id: number;
  nickname: string;
  email: string;
  avatar_url?: string | null;
};

type Post = {
  id: string;
  title?: string;
  image_url?: string | null;
  comment?: string;
  created_at?: string;
  user?: User | null;
};

type ChatReference = {
  matched_message: Post;
  board_post: Post;
};

type NumberedReference = {
  responseNumber: number;
  reference: ChatReference;
};

type SupportLink = {
  title?: string;
  name: string;
  url: string;
};

type SafetyAiResponse = {
  //AI回答の型定義
  mode: "safety_only";
  answer: string;
  primary_support: SupportLink;
  other_supports: SupportLink[];
  suicide_detected: true;
  risk_level: string;
  references?: ChatReference[];
};

type NormalAiResponse = {
  mode?: "rag_answer";
  answer: string;
  references: ChatReference[];
  suicide_detected?: false;
  risk_level?: string | null;
};

type AiResponse = SafetyAiResponse | NormalAiResponse;

export default function AiChatPage() {
  //状態と認証情報の準備
  const [aiMessage, setAiMessage] = useState("");
  const [aiHistory, setAiHistory] = useState<{
    responses: AiResponse[];
    references: NumberedReference[];
  }>({
    responses: [],
    references: [],
  });
  const [selectedResponseNumber, setSelectedResponseNumber] = useState<
    number | null
  >(null);

  // 既存の表示処理でも使えるように取り出す
  const { responses: aiResponses, references: allReferences } = aiHistory;
  const [isSendingAiMessage, setIsSendingAiMessage] = useState(false);
  const [aiError, setAiError] = useState("");

  const { accessToken, isLoggedIn } = useAuth();

  const handleSendAiMessage = async () => {
    //送信前の確認
    const text = aiMessage.trim();

    if (!isLoggedIn || !accessToken) {
      setAiError("AI相談を利用するにはログインが必要です。");
      return;
    }

    if (!text) {
      setAiError("メッセージを入力してください。");
      return;
    }

    try {
      //送信開始の準備
      setIsSendingAiMessage(true);
      setAiError("");

      const response = await fetch(`${API_BASE_URL}/rag-answer/`, {
        //APIへの送信
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json().catch(() => null); //API結果の確認
      console.log(data);

      if (!response.ok) {
        const detail =
          data?.detail ??
          data?.message ??
          data?.error ??
          "AIチャットの取得に失敗しました。";

        throw new Error(detail);
      }

      const newResponse = data as AiResponse;

      setAiHistory((prev) => {
        const responseNumber = prev.responses.length;

        // 今回受け取ったリファレンスだけに回答番号を付ける
        const newReferences: NumberedReference[] =
          newResponse.mode === "safety_only"
            ? []
            : newResponse.references.map((reference) => ({
                responseNumber,
                reference,
              }));

        return {
          responses: [...prev.responses, newResponse],
          references: [...prev.references, ...newReferences],
        };
      });
      // 最新回答の参考情報へ切り替える
      setSelectedResponseNumber(null);
    } catch (error) {
      //エラー処理と終了処理
      setAiError(
        error instanceof Error
          ? error.message
          : "AIチャットの取得に失敗しました。",
      );
    } finally {
      setIsSendingAiMessage(false);
    }
  };
  const latestAiResponse = aiResponses[aiResponses.length - 1] ?? null; //表示用データの整理
  //aiResponse の中に references があれば、それを references に代入
  //aiResponse や references が null / undefined なら、代わりに空配列 []
  //aiResponse.mode が "safety_only" か、aiResponse.suicide_detected が true
  //どちらか一方でも当てはまれば isSafetyResponse は true
  const isSafetyResponse = latestAiResponse?.mode === "safety_only"; // null のときは最新回答、それ以外はクリックした回答

  const displayedResponseNumber =
    selectedResponseNumber ??
    (aiResponses.length > 0 ? aiResponses.length - 1 : null);

  const selectedReferences = allReferences.filter(
    (item) => item.responseNumber === displayedResponseNumber,
  );
  return (
    //画面の骨組み
    <div className="flex flex-col min-h-screen">
      <header className="h-[10vh]">
        <h1>LifeNect</h1>
      </header>
      <div className="h-[90vh]">
        <div className="container mx-auto flex h-full">
          <div className="flex-[2] h-full">
            <div className="flex flex-col h-full">
              <div className="flex-[9] overflow-y-auto">
                <div className="p-4">
                  <p className="w-4/5 rounded-lg bg-gray-100 p-4">
                    うつ病の人が、どのように就職をしているのかを知りたいです。
                  </p>
                  <div className="w-4/5 mx-auto mt-4">
                    {/* *エラー表示* */}
                    {aiError && (
                      <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                        {aiError}
                      </p>
                    )}
                    {/* AI回答の表示 */}
                    {aiResponses.map((response, index) => (
                      <div key={index} className="mt-6">
                        <p>回答 {index + 1}</p>
                        {response.answer && (
                          <div>
                            <div
                              className="rounded-lg border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700"
                              dangerouslySetInnerHTML={{
                                __html: response.answer,
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setSelectedResponseNumber(index)}
                              className="mt-2 text-sm text-blue-600 underline"
                            >
                              参考にした情報を見る
                            </button>
                          </div>
                        )}

                        {/* 各回答の相談先表示 */}
                        {response.mode === "safety_only" && (
                          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
                            <p className="font-bold text-red-700">
                              {response.primary_support.title}
                            </p>
                            <a
                              href={response.primary_support.url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-block font-bold text-blue-600 underline"
                            >
                              {response.primary_support.name}
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                    {/* 最新回答の相談先表示 */}
                    {latestAiResponse?.mode === "safety_only" && (
                      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
                        <p className="font-bold text-red-700">
                          {latestAiResponse.primary_support.title}
                        </p>

                        <a
                          href={latestAiResponse.primary_support.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-block font-bold text-blue-600 underline"
                        >
                          {latestAiResponse.primary_support.name}
                        </a>

                        {latestAiResponse.other_supports?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-3">
                            {latestAiResponse.other_supports.map((support) => (
                              <a
                                key={support.url}
                                href={support.url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-bold text-blue-600 underline"
                              >
                                {support.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* 入力・送信欄 */}
              <div className="flex-[1] relative">
                <form className=" w-full">
                  <textarea
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    className="mt-6 min-h-[10px] w-4/5 rounded-lg border border-slate-300 p-3"
                  />
                  <button
                    type="button"
                    onClick={handleSendAiMessage}
                    disabled={isSendingAiMessage}
                    className="mt-3 rounded-lg bg-blue-600 px-5 py-3 font-bold text-white disabled:bg-slate-400"
                  >
                    {isSendingAiMessage ? "送信中..." : "送信"}
                  </button>
                </form>
              </div>
            </div>
          </div>
          {/* 参考投稿の表示判定 */}
          <div className="flex-[1] overflow-y-auto bg-gray-100 p-2">
            <h2 className="text-base font-bold text-slate-900">
              参考にした投稿
            </h2>
            {latestAiResponse &&
              !isSafetyResponse &&
              selectedReferences.length === 0 && (
                <p>参考にした投稿は見つかりませんでした。</p>
              )}
            {!isSafetyResponse && allReferences.length > 0 ? (
              <div className="mt-6 grid gap-4">
                {/* 参考投稿の表示判定 */}
                {selectedReferences.map(
                  ({ responseNumber, reference }, index) => {
                    const boardPost = reference.board_post;

                    return (
                      <Link
                        key={`${responseNumber}-${boardPost.id}-${index}`}
                        href={`/posts/${boardPost.id}`}
                        className="block rounded-lg border border-slate-200 bg-white p-4 hover:bg-slate-50"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <p>回答 {responseNumber + 1} の参考投稿</p>
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="truncate font-bold text-slate-900">
                              {boardPost.title}
                            </h3>

                            {boardPost.comment && (
                              <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                                {boardPost.comment}
                              </p>
                            )}

                            {boardPost.image_url && (
                              <div className="relative mt-3 h-56 w-full overflow-hidden rounded-lg bg-slate-100">
                                <Image
                                  src={boardPost.image_url}
                                  alt={boardPost.title ?? "投稿画像"}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              </div>
                            )}

                            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                              <UserAvatar
                                avatarUrl={boardPost.user?.avatar_url}
                                name={boardPost.user?.nickname}
                                size="sm"
                              />
                              <span>
                                {boardPost.user?.nickname ?? "匿名ユーザー"}
                              </span>
                            </div>
                          </div>

                          <span className="shrink-0 text-xs text-slate-500">
                            {boardPost.created_at
                              ? new Date(
                                  boardPost.created_at,
                                ).toLocaleDateString("ja-JP")
                              : ""}
                          </span>
                        </div>
                      </Link>
                    );
                  },
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
