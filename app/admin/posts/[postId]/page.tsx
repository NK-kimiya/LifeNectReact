"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useAdminAuth } from "../../../context/AdminAuthContext";
import UserAvatar from "../../../components/UserAvatar";
import ReplyList from "../../../components/ReplyList";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

type Tag = {
  id: number;
  name: string;
};

type User = {
  id: number;
  email: string;
  nickname: string;
  avatar_url?: string | null;
};

type Post = {
  id: string;
  is_visible: boolean;
  user: User | null;
  title: string;
  comment: string;
  image_url?: string | null;
  parent_post: string | null;
  comment_count?: number;
  created_at: string;
  updated_at?: string;
  tags: Tag[];
};

export default function AdminPostDetailPage() {
  const params = useParams<{ postId: string }>();
  const router = useRouter();
  const { isAdminLoggedIn, adminLogout } = useAdminAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [openReplyIds, setOpenReplyIds] = useState<Record<string, boolean>>({});
  const [repliesByPostId, setRepliesByPostId] = useState<Record<string, Post[]>>({});
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [replyListError, setReplyListError] = useState("");

  const fetchReplies = async (postId: string) => {
    try {
      setIsLoadingReplies(true);
      setReplyListError("");
  
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/replies/`);
      const data = await response.json().catch(() => []);
  
      if (!response.ok) {
        throw new Error("返信一覧の取得に失敗しました。");
      }
  
      setRepliesByPostId((current) => ({
        ...current,
        [postId]: data,
      }));
    } catch (error) {
      setReplyListError(
        error instanceof Error
          ? error.message
          : "返信一覧の取得に失敗しました。",
      );
    } finally {
      setIsLoadingReplies(false);
    }
  };

  const toggleReplies = (postId: string) => {
    setOpenReplyIds((current) => ({
      ...current,
      [postId]: !current[postId],
    }));
  
    if (!repliesByPostId[postId]) {
      fetchReplies(postId);
    }
  };

  

  const handleAuthExpired = useCallback(() => {
    adminLogout();
    router.replace("/admin/login");
  }, [adminLogout, router]);

  useEffect(() => {
    if (!isAdminLoggedIn) {
      router.replace("/admin/login");
    }
  }, [isAdminLoggedIn, router]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await fetch(`${API_BASE_URL}/posts/${params.postId}/`);
        const data = await response.json().catch(() => null);

        if (response.status === 401) {
          handleAuthExpired();
          return;
        }

        if (!response.ok) {
          throw new Error(data?.detail ?? "投稿詳細の取得に失敗しました。");
        }

        setPost(data);
          
        if (data.is_visible) {
          fetchReplies(data.id);
          setOpenReplyIds((current) => ({
            ...current,
            [data.id]: true,
          }));
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "投稿詳細の取得に失敗しました。",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (params.postId) {
      fetchPost();
    }
  }, [params.postId, handleAuthExpired]);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="mb-6 inline-flex min-h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          一覧に戻る
        </button>

        {isLoading && (
          <p className="text-sm text-gray-500">投稿を読み込み中...</p>
        )}

        {errorMessage && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </p>
        )}
        
        {post && !post.is_visible && (
          <article className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="text-sm font-bold text-gray-600">
              この投稿は管理者によって非表示にされました。
            </p>
          </article>
        )}

        {post && post.is_visible && (
          <article className="rounded-lg border border-gray-200 bg-white p-6">
            <article className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex flex-col gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {post.title}
                </h1>

                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                  <UserAvatar
                    avatarUrl={post.user?.avatar_url}
                    name={post.user?.nickname}
                    size="sm"
                  />
                  <span>{post.user?.nickname ?? "匿名ユーザー"}</span>
                </div>
              </div>

              <span className="text-sm text-gray-500">
              {post.created_at
  ? new Date(post.created_at).toLocaleString("ja-JP")
  : ""}
              </span>
            </div>

            {post.image_url && (
              <div className="relative mt-6 h-96 w-full overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={post.image_url}
                  alt={post.title ?? "投稿画像"}
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
            )}

            <p className="mt-6 whitespace-pre-wrap leading-8 text-gray-700">
              {post.comment}
            </p>

            {(post.tags ?? []).length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {(post.tags ?? []).map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-[#c2410c]"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            <section className="mt-8 border-t border-gray-100 pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  コメント
                </h2>

                <span className="text-sm text-gray-500">
                  {post.comment_count ?? 0}件
                </span>
              </div>

              {isLoadingReplies && (
                <p className="text-sm text-gray-500">コメントを読み込み中...</p>
              )}

              {replyListError && (
                <p className="text-sm font-bold text-red-600">
                  {replyListError}
                </p>
              )}

              <ReplyList
                parentId={post.id}
                repliesByPostId={repliesByPostId}
                openReplyIds={openReplyIds}
                toggleReplies={toggleReplies}
                canReply={false}
              />
            </section>
          </article>
          </article>
        )}
      </div>
    </main>
  );
}