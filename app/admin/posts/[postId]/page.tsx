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
  const { adminAccessToken, isAdminLoggedIn, adminLogout } = useAdminAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [openReplyIds, setOpenReplyIds] = useState<Record<string, boolean>>({});
  const [repliesByPostId, setRepliesByPostId] = useState<Record<string, Post[]>>({});
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [replyListError, setReplyListError] = useState("");

    

  //指定した投稿/コメントに紐づく返信一覧をバックエンドから取得
  const fetchReplies = useCallback(async (postId: string) => {
    try {
      setIsLoadingReplies(true);
      setReplyListError("");
      //返信を読み込み中にして、前回のエラーメッセージを消去
      
      //レスポンスのJAONを取得、変換に失敗したら空配列を返す
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/replies/`);
      const data = await response.json().catch(() => []);
  
      if (!response.ok) {
        throw new Error("返信一覧の取得に失敗しました。");
      }
      
      //取得した返信一覧を状態に保存
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
    
    } finally {//成功・失敗に関係なく、最後に読み込み中を解除する
      setIsLoadingReplies(false);
    }
  }, []);

  

  const handleAuthExpired = useCallback(() => {
    adminLogout();
    router.replace("/admin/login");
  }, [adminLogout, router]);

  useEffect(() => {
    if (!isAdminLoggedIn) {
      router.replace("/admin/login");
    }
  }, [isAdminLoggedIn, router]);

  //現在開いている詳細ページの投稿データを取得
  const fetchPost = useCallback(async () => {
    try {
      //投稿詳細を読み込み中にして、前回のエラーメッセージを消去
      setIsLoading(true);
      setErrorMessage("");

      //URL の postId を使って、投稿詳細APIを叩く
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
      
      //投稿が表示状態の場合は、返信一覧を取得して開く
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
  }, [params.postId, handleAuthExpired, fetchReplies]);

  
  useEffect(() => {
    //URLパラメータにpostIdがない場合は、投稿詳細を取得しない
    if (!params.postId) {
      return;
    }
    
    //fetchPost() をすぐ直接呼ばずに、少し後で呼ぶように予約
    const timeoutId = window.setTimeout(() => {
      fetchPost();
    }, 0);
    
    //コンポーネントが消えたり、postId が変わったりしたときに、予約済みの setTimeout をキャンセル
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchPost, params.postId]);

　//投稿の表示状態を切り替える関数
  const handleToggleVisibility = async (targetPost: { id: string; is_visible?: boolean }) => {
    //管理者トークンが無ければ、ログイン切れとしてログイン画面へ
    if (!adminAccessToken) {
      handleAuthExpired();
      return;
    }
  
    try {
      setErrorMessage("");
      
      //対象の投稿/コメントIDに対して、更新リクエスト
      const response = await fetch(`${API_BASE_URL}/posts/${targetPost.id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${adminAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_visible: !targetPost.is_visible,
        }),
      });
  
      const data = await response.json().catch(() => null);
      
      //認証エラーならログイン切れとして処理
      if (response.status === 401) {
        handleAuthExpired();
        return;
      }
  
      if (!response.ok) {
        throw new Error(data?.detail ?? "表示状態の更新に失敗しました。");
      }
  
      // 投稿本体を再取得
      fetchPost();
  
      // 開いているコメント一覧も再取得
      //OpneReplyIdsを配列に変換
      Object.entries(openReplyIds)
        //開いているコメント一覧だけを抽出
        .filter(([, isOpen]) => isOpen)
        //開いている投稿/コメントIDごとに、返信一覧を再取得
        .forEach(([postId]) => {
          fetchReplies(postId);
        });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "表示状態の更新に失敗しました。",
      );
    }
  };

  //ある投稿/コメントの返信一覧を開閉する関数
  const toggleReplies = (postId: string) => {
    //開閉状態を反転させる
    setOpenReplyIds((current) => ({
      ...current,
      [postId]: !current[postId],
    }));
    
    //まだ返信一覧が取得されていない場合は、バックエンドから取得する
    if (!repliesByPostId[postId]) {
      fetchReplies(postId);
    }
  };
  

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
            <button
            type="button"
            onClick={() => handleToggleVisibility(post)}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            表示に戻す
      </button>
          </article>
        )}

        {post && post.is_visible && (
          <article className="rounded-lg border border-gray-200 bg-white p-6">
            <article className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => handleToggleVisibility(post)}
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                非表示にする
              </button>
            </div>
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
                onToggleVisibility={handleToggleVisibility}
              />
            </section>
          </article>
          </article>
        )}
      </div>
    </main>
  );
}