"use client"; //使用する機能の読み込み
import Header from "@/app/components/Header";
import UserAvatar from "@/app/components/UserAvatar";
import Link from "next/link";
import { useRef, useState } from "react";
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

type ChatEntry = AiResponse & {
  question: string;
};

export default function AiChatPage() {
  //状態と認証情報の準備
  const [aiMessage, setAiMessage] = useState("");
  const [aiHistory, setAiHistory] = useState<{
    responses: ChatEntry[];
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
  const [isOpen, setIsOpen] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

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
          responses: [
            ...prev.responses,
            {
              ...newResponse,
              question: text,
            },
          ],
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
    <div className="h-screen">
      <div className="h-1/10">
        <Header />
      </div>
      <div className="w-8/10 mx-auto h-9/10">
        <div className="container mx-auto flex lg:flex-row flex-col h-full justify-between">
          <div
            className={`${
              isOpen ? "h-2/10" : "h-8/10"
            } lg:h-full w-full lg:w-4/6 md:mr-2 mb-1`}
          >
            <div className="h-full">
              <div className="md:flex-[8] overflow-y-auto h-full lg:h-9/10 border border-orange-300 rounded-lg">
                <div className="flex flex-col h-full">
                  <div className="flex-[9]">
                    <h2 className="text-slate-900 p-4 border-b-1 border-gray-100">
                      AIチャット
                    </h2>
                    <div className="p-4">
                      <div className="w-4/5 mx-auto mt-4">
                        {/* *エラー表示* */}
                        {aiError && (
                          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                            {aiError}
                          </p>
                        )}
                        {/* AI回答の表示 */}
                        {aiResponses.length === 0 && (
                          <div className="py-8">
                            <p className="text-4xl text-center">
                              しりたいことを質問してみましょう
                            </p>
                            <p className="mt-4 text-3sm text-gray-600 text-center">
                              投稿データをもとに、AIが回答し、使用した投稿もあわせて確認できます。
                            </p>
                          </div>
                        )}
                        {aiResponses.map((response, index) => (
                          <div key={index} className="mt-6">
                            <div className="mb-4 flex justify-end">
                              <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-lg bg-orange-100 p-4">
                                {response.question}
                              </p>
                            </div>

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
                                  onClick={() =>
                                    setSelectedResponseNumber(index)
                                  }
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
                                {latestAiResponse.other_supports.map(
                                  (support) => (
                                    <a
                                      key={support.url}
                                      href={support.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="font-bold text-blue-600 underline"
                                    >
                                      {support.name}
                                    </a>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-[1]">
                    <form className="flex w-full items-center justify-center p-2">
                      <textarea
                        value={aiMessage}
                        onChange={(e) => setAiMessage(e.target.value)}
                        className="min-h-[10px]  rounded-lg border border-orange-300  w-7/10  h-[50px]"
                      />
                      <button
                        type="button"
                        onClick={handleSendAiMessage}
                        disabled={isSendingAiMessage}
                        className="rounded-lg bg-orange-500 px-5 font-bold text-white disabled:bg-slate-400 w-3/10  p-2 h-[50px]"
                      >
                        {isSendingAiMessage ? "送信中..." : "送信"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* 参考投稿の表示判定 */}
          <div
            className={`${
              isOpen ? "h-8/10" : "h-2/10"
            } lg:h-9/10 w-full overflow-y-auto border-1 border-orange-300 rounded-lg lg:w-2/6 md:static`}
          >
            <div
              onTouchStart={(event) => {
                const touch = event.touches[0];

                touchStart.current = {
                  x: touch.clientX,
                  y: touch.clientY,
                };
              }}
              onTouchEnd={(event) => {
                const start = touchStart.current;
                touchStart.current = null;

                if (!start) return;

                const touch = event.changedTouches[0];
                const deltaX = touch.clientX - start.x;
                const deltaY = start.y - touch.clientY;

                // 50px未満の移動や、横方向のスワイプは無視
                if (
                  Math.abs(deltaY) < 50 ||
                  Math.abs(deltaY) <= Math.abs(deltaX)
                ) {
                  return;
                }

                setIsOpen(deltaY > 0);
              }}
              onTouchCancel={() => {
                touchStart.current = null;
              }}
              className="flex px-5 lg:hidden"
            >
              <button className="w-full text-custom-black text-4xl text-center text-5xl">
                -
              </button>
              {isOpen ? (
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-3xl"
                >
                  v
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="text-3xl"
                >
                  ^
                </button>
              )}
            </div>
            <h2 className="text-center text-slate-900 p-4 border-b-1 border-gray-100">
              回答に使用した投稿データ
            </h2>
            {aiResponses.length === 0 && (
              <div>
                <p className="text-xl p-2 text-center ">
                  まだ使用した投稿データはありません。
                </p>
                <p className="p-2 text-center text-gray-600">
                  質問すると、回答に使用した投稿データが表示されます。
                </p>
              </div>
            )}
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
