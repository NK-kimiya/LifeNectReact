"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import ReplyList from "../../components/ReplyList";
import UserAvatar from "../../components/UserAvatar";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

type User = {
  id: number;
  nickname: string;
  email: string;
  avatar_url?: string | null;
};

type Tag = {
  id: number;
  name: string;
};

type Post = {
  id: string;
  is_visible?: boolean;
  title?: string;
  comment?: string;
  parent_post?: string | null;
  comment_count?: number;
  created_at?: string;
  user?: User | null;
  tags?: Tag[];
  image_url?: string | null;
};

export default function PostDetailPage() {
  const params = useParams<{ postId: string }>();
  const { accessToken, isLoggedIn } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [repliesByPostId, setRepliesByPostId] = useState<Record<string, Post[]>>({});
  const [openReplyIds, setOpenReplyIds] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [replyingPostId, setReplyingPostId] = useState<string | null>(null);
  const [replyComment, setReplyComment] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const fetchReplies = useCallback(async (postId: string) => {
    try {
      setIsLoadingReplies(true);

      const response = await fetch(`${API_BASE_URL}/posts/${postId}/replies/`);
      const data = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error("コメントの取得に失敗しました。");
      }

      setRepliesByPostId((current) => ({
        ...current,
        [postId]: data,
      }));
    } finally {
      setIsLoadingReplies(false);
    }
  }, []);

  const fetchPost = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await fetch(`${API_BASE_URL}/posts/${params.postId}/`);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail ?? "投稿詳細の取得に失敗しました。");
      }

      setPost(data);

      if (data.is_visible !== false) {
        fetchReplies(data.id);
        setOpenReplyIds((current) => ({
          ...current,
          [data.id]: true,
        }));
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "投稿詳細の取得に失敗しました。",
      );
    } finally {
      setIsLoading(false);
    }
  }, [fetchReplies, params.postId]);

  useEffect(() => {
    if (!params.postId) return;

    const timeoutId = window.setTimeout(() => {
      fetchPost();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchPost, params.postId]);

  const toggleReplies = (postId: string) => {
    setOpenReplyIds((current) => ({
      ...current,
      [postId]: !current[postId],
    }));

    if (!repliesByPostId[postId]) {
      fetchReplies(postId);
    }
  };

  const handleSubmitReply = async (targetPost: Post) => {
    const comment = replyComment.trim();

    if (!comment) {
      setReplyMessage("コメントを入力してください。");
      return;
    }

    if (!isLoggedIn || !accessToken) {
      setReplyMessage("コメントするにはログインが必要です。");
      return;
    }

    try {
      setIsSubmittingReply(true);
      setReplyMessage("");

      const response = await fetch(`${API_BASE_URL}/posts/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `Re: ${targetPost.title ?? post?.title ?? "投稿"}`,
          comment,
          tag_ids: [],
          parent_post: targetPost.id,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail ?? "コメントの投稿に失敗しました。");
      }

      setReplyComment("");
      setReplyingPostId(null);
      fetchReplies(targetPost.id);
    } catch (error) {
      setReplyMessage(
        error instanceof Error ? error.message : "コメントの投稿に失敗しました。",
      );
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/posts" className="mb-6 inline-flex text-sm font-bold text-blue-600">
          一覧に戻る
        </Link>

        {isLoading && <p className="text-sm text-slate-500">読み込み中...</p>}

        {errorMessage && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        {post && post.is_visible === false && (
          <article className="rounded-lg border border-slate-200 bg-white p-6">
            <p className="text-sm font-bold text-slate-500">
              この投稿は管理者によって非表示にされました。
            </p>
          </article>
        )}

        {post && post.is_visible !== false && (
          <article className="rounded-lg border border-slate-200 bg-white p-6">
            <h1 className="text-2xl font-bold text-slate-900">{post.title}</h1>

            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <UserAvatar
                avatarUrl={post.user?.avatar_url}
                name={post.user?.nickname}
                size="sm"
              />
              <span>{post.user?.nickname ?? "匿名ユーザー"}</span>
              <span>
                {post.created_at
                  ? new Date(post.created_at).toLocaleString("ja-JP")
                  : ""}
              </span>
            </div>

            {post.image_url && (
              <div className="relative mt-6 h-96 w-full overflow-hidden rounded-lg bg-slate-100">
                <Image
                  src={post.image_url}
                  alt={post.title ?? "投稿画像"}
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
            )}

            <p className="mt-6 whitespace-pre-wrap leading-8 text-slate-700">
              {post.comment}
            </p>

            <section className="mt-8 border-t border-slate-100 pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">コメント</h2>
                <span className="text-sm text-slate-500">
                  {post.comment_count ?? 0}件
                </span>
              </div>

              {isLoadingReplies && (
                <p className="text-sm text-slate-500">コメントを読み込み中...</p>
              )}

              <button
                type="button"
                onClick={() => {
                  setReplyingPostId(post.id);
                  setReplyComment("");
                  setReplyMessage("");
                }}
                className="font-bold text-blue-600 hover:text-blue-700"
              >
                コメントする
              </button>

              {replyingPostId === post.id && (
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <textarea
                    rows={4}
                    value={replyComment}
                    onChange={(e) => setReplyComment(e.target.value)}
                    className="w-full resize-y rounded-lg border border-slate-300 px-3 py-3"
                  />

                  {replyMessage && (
                    <p className="mt-2 text-sm font-bold text-red-600">
                      {replyMessage}
                    </p>
                  )}

                  <button
                    type="button"
                    disabled={isSubmittingReply}
                    onClick={() => handleSubmitReply(post)}
                    className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white"
                  >
                    {isSubmittingReply ? "投稿中..." : "投稿する"}
                  </button>
                </div>
              )}

              <ReplyList
                parentId={post.id}
                repliesByPostId={repliesByPostId}
                openReplyIds={openReplyIds}
                toggleReplies={toggleReplies}
                canReply={true}
                replyingPostId={replyingPostId}
                setReplyingPostId={setReplyingPostId}
                replyComment={replyComment}
                setReplyComment={setReplyComment}
                replyMessage={replyMessage}
                setReplyMessage={setReplyMessage}
                isSubmittingReply={isSubmittingReply}
                handleSubmitReply={handleSubmitReply}
              />
            </section>
          </article>
        )}
      </div>
    </main>
  );
}