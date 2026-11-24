"use client"; //使用する機能の読み込み
import Header from "@/app/components/Header";
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

type SupportLink = {
  title?: string;
  name: string;
  url: string;
};

type NormalAiResponse = {
  suicide_detected: false;
  answer: string;
  references: ChatReference[];
};

type UnsafeOutputResponse = {
  suicide_detected: true;
  mode: "safety_only";
  risk_level: "high";
  answer: string;
};

type SelfHarmResponse = UnsafeOutputResponse & {
  primary_support: SupportLink;
  other_supports: SupportLink[];
};

type AiResponse = NormalAiResponse | SelfHarmResponse | UnsafeOutputResponse;
type ChatEntry = NormalAiResponse & { question: string };

export default function AiChatPage() {
  //状態と認証情報の準備

  const [selfHarmResponse, setSelfHarmResponse] =
    useState<SelfHarmResponse | null>(null);
  const [unsafeOutputResponse, setUnsafeOutputResponse] =
    useState<UnsafeOutputResponse | null>(null);
  const [aiMessage, setAiMessage] = useState("");
  const [aiResponses, setAiResponses] = useState<ChatEntry[]>([]);

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
      setSelfHarmResponse(null);
      setUnsafeOutputResponse(null);

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

      const newResponse = data as AiResponse | null;

      if (
        !newResponse ||
        typeof newResponse.suicide_detected !== "boolean" ||
        typeof newResponse.answer !== "string"
      ) {
        throw new Error("AIチャットのレスポンス形式が正しくありません。");
      }

      if (newResponse.suicide_detected) {
        if ("primary_support" in newResponse) {
          setSelfHarmResponse(newResponse);
        } else {
          setUnsafeOutputResponse(newResponse);
        }
        return;
      }

      if (!Array.isArray(newResponse.references)) {
        throw new Error("AIチャットのレスポンス形式が正しくありません。");
      }

      setAiResponses((previous) => [
        ...previous,
        { ...newResponse, question: text },
      ]);
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

  const safetyResponse = selfHarmResponse ?? unsafeOutputResponse;

  return (
    //画面の骨組み
    <div className="h-screen">
      <div className="h-1/10">
        <Header />
      </div>
      <main className="mx-auto flex h-9/10 w-8/10 max-w-4xl flex-col rounded-lg border border-orange-300">
        <h2 className="border-b-1 border-gray-100 p-4 text-slate-900">
          AIチャット
        </h2>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="mx-auto mt-4 md:w-4/5">
            {aiError && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                {aiError}
              </p>
            )}
            {aiResponses.length === 0 && !safetyResponse && (
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
              <article key={index} className="mt-6">
                <div className="mb-4 flex justify-end">
                  <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-lg bg-orange-100 p-4">
                    {response.question}
                  </p>
                </div>
                {response.answer && (
                  <div
                    className="rounded-lg border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700"
                    dangerouslySetInnerHTML={{ __html: response.answer }}
                  />
                )}

                <section className="mt-4">
                  <h3 className="text-sm font-bold text-slate-900">参考投稿</h3>
                  {response.references.length > 0 ? (
                    <div className="mt-2 grid gap-3">
                      {response.references.map(
                        ({
                          matched_message: matchedPost,
                          board_post: boardPost,
                        }) => (
                          <Link
                            key={matchedPost.id}
                            href={`/posts/${boardPost.id}`}
                            className="block rounded-lg border border-slate-200 bg-white p-4 hover:bg-slate-50"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <h4 className="truncate font-bold text-slate-900">
                                  {boardPost.title}
                                </h4>

                                {boardPost.comment && (
                                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                                    {boardPost.comment}
                                  </p>
                                )}
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
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-600">
                      参考にした投稿は見つかりませんでした。
                    </p>
                  )}
                </section>
              </article>
            ))}
            {safetyResponse && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
                <p>{safetyResponse.answer}</p>

                {selfHarmResponse && (
                  <div className="mt-3">
                    <p className="font-bold text-red-700">
                      {selfHarmResponse.primary_support.title}
                    </p>
                    {[
                      selfHarmResponse.primary_support,
                      ...selfHarmResponse.other_supports,
                    ].map((support) => (
                      <a
                        key={support.url}
                        href={support.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mr-3 mt-2 inline-block font-bold text-blue-600 underline"
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
      </main>
    </div>
  );
}
