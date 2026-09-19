"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ReplyList from "../../components/ReplyList";
import UserAvatar from "../../components/UserAvatar";
import { useAuth } from "../../context/AuthContext";

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
  like_count?: number;
  is_liked?: boolean;
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

type PostDetailError = {
  code: number | "network" | "unknown";
  title: string;
  message: string;
};

export default function PostDetailPage() {
  const params = useParams<{ postId: string }>();
  const { accessToken, isLoggedIn } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [repliesByPostId, setRepliesByPostId] = useState<
    Record<string, Post[]>
  >({});
  const [openReplyIds, setOpenReplyIds] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [postError, setPostError] = useState<PostDetailError | null>(null);
  const [replyingPostId, setReplyingPostId] = useState<string | null>(null);
  const [replyComment, setReplyComment] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const handleToggleLike = async (postId: string) => {
    if (!isLoggedIn || !accessToken) {
      return;
    }

    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return;
    }

    setPost((current) =>
      current && current.id === postId
        ? { ...current, is_liked: data.is_liked, like_count: data.like_count }
        : current,
    );
  };

  const fetchReplies = useCallback(async (postId: string) => {
    try {
      setIsLoadingReplies(true);

      const response = await fetch(`${API_BASE_URL}/posts/${postId}/replies/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
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

  const getPostDetailError = (status: number): PostDetailError => {
    switch (status) {
      case 400:
        return {
          code: 400,
          title: "リクエストエラー",
          message: "投稿詳細の取得条件に問題があります。",
        };
      case 401:
        return {
          code: 401,
          title: "認証エラー",
          message: "ログイン情報が無効です。再ログインしてください。",
        };
      case 403:
        return {
          code: 403,
          title: "アクセス権限エラー",
          message: "この投稿を表示する権限がありません。",
        };
      case 404:
        return {
          code: 404,
          title: "投稿が見つかりません",
          message: "投稿が削除されたか、URLが正しくない可能性があります。",
        };
      case 500:
        return {
          code: 500,
          title: "サーバーエラー",
          message: "サーバー側で問題が発生しています。",
        };
      default:
        return {
          code: status,
          title: "投稿詳細の取得に失敗しました",
          message: `予期しないエラーが発生しました。HTTP ${status}`,
        };
    }
  };

  const fetchPost = useCallback(async () => {
    try {
      setIsLoading(true);
      setPostError(null);

      const response = await fetch(`${API_BASE_URL}/posts/${params.postId}/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setPostError(getPostDetailError(response.status));
        return;
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
      setPostError({
        code: "network",
        title: "通信エラー",
        message:
          "サーバーに接続できませんでした。ネットワーク状況を確認してください。",
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchReplies, params.postId, accessToken]);

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
        error instanceof Error
          ? error.message
          : "コメントの投稿に失敗しました。",
      );
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/posts"
          className="mb-6 inline-flex text-sm font-bold text-blue-600"
        >
          一覧に戻る
        </Link>

        {isLoading && <p className="text-sm text-slate-500">読み込み中...</p>}

        {postError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
            <p className="text-sm font-bold">エラー番号: {postError.code}</p>
            <p className="mt-2 text-base font-bold">{postError.title}</p>
            <p className="mt-1 text-sm">{postError.message}</p>

            {(postError.code === 401 || postError.code === 403) && (
              <Link
                href="/auth"
                className="font-bold text-blue-600 underline underline-offset-2 hover:text-blue-700 p-2"
              >
                ログインページへ
              </Link>
            )}
          </div>
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
                  sizes="(max-width: 768px) 100vw, 768px"
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

              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  handleToggleLike(post.id);
                }}
                disabled={!isLoggedIn}
                className="text-sm font-bold text-pink-600 hover:text-pink-700 disabled:text-slate-400"
              >
                {post.is_liked ? "いいね済み" : "いいね"} {post.like_count ?? 0}
              </button>

              {isLoadingReplies && (
                <p className="text-sm text-slate-500">
                  コメントを読み込み中...
                </p>
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
