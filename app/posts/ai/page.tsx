"use client";
import UserAvatar from "@/app/components/UserAvatar";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

type User = {
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

type AiResponse = {
  answer: string;
  references: ChatReference[];
};

export default function AiChatPage() {
  const [aiMessage, setAiMessage] = useState("");
  const [aiResponse, setAiResponse] = useState<AiResponse | null>(null);
  const [isSendingAiMessage, setIsSendingAiMessage] = useState(false);
  const [aiError, setAiError] = useState("");

  const { accessToken, isLoggedIn } = useAuth();

  const handleSendAiMessage = async () => {
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
      setIsSendingAiMessage(true);
      setAiError("");
      setAiResponse(null);

      const response = await fetch(`${API_BASE_URL}/rag-answer/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const detail =
          data?.detail ??
          data?.message ??
          data?.error ??
          "AIチャットの取得に失敗しました。";

        throw new Error(detail);
      }

      setAiResponse(data);
    } catch (error) {
      setAiError(
        error instanceof Error
          ? error.message
          : "AIチャットの取得に失敗しました。",
      );
    } finally {
      setIsSendingAiMessage(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/posts"
          className="mb-4 inline-block text-sm font-bold text-blue-600"
        >
          投稿一覧に戻る
        </Link>

        <h1 className="text-3xl font-bold text-slate-900">AI相談</h1>

        <textarea
          value={aiMessage}
          onChange={(e) => setAiMessage(e.target.value)}
          className="mt-6 min-h-36 w-full rounded-lg border border-slate-300 p-3"
        />

        <button
          type="button"
          onClick={handleSendAiMessage}
          disabled={isSendingAiMessage}
          className="mt-3 rounded-lg bg-blue-600 px-5 py-3 font-bold text-white disabled:bg-slate-400"
        >
          {isSendingAiMessage ? "送信中..." : "送信"}
        </button>

        {aiError && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            {aiError}
          </p>
        )}

        {aiResponse?.answer && (
          <div
            className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700"
            dangerouslySetInnerHTML={{ __html: aiResponse.answer }}
          />
        )}

        {aiResponse && aiResponse.references.length === 0 && (
          <p className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
            参考にした投稿は見つかりませんでした。
          </p>
        )}
        {aiResponse?.references?.length ? (
          <div className="mt-6 grid gap-4">
            <h2 className="text-base font-bold text-slate-900">
              参考にした投稿
            </h2>

            {aiResponse.references.map((reference) => {
              const boardPost = reference.board_post;

              return (
                <Link
                  key={boardPost.id}
                  href={`/posts/${boardPost.id}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 hover:bg-slate-50"
                >
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
                        ? new Date(boardPost.created_at).toLocaleDateString(
                            "ja-JP",
                          )
                        : ""}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </main>
  );
}
