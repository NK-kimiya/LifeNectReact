"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import "./posts.css";
import { useAuth } from "../context/AuthContext";
import ReplyList from "../components/ReplyList";
import UserAvatar from "../components/UserAvatar";
import Image from "next/image";
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
    title: string;
    comment: string;
    parent_post: string | null;
    type?: "post" | "reply";
    comment_count?: number;
    created_at: string;
    user: User | null;
    tags?: Tag[];
    score?: number | null;
    excerpt?: string | null;
    image_url?: string | null;
  };
  
  type ChatReference = {
    matched_message: Post;
    board_post: Post;
  };
  
  type AiResponse = {
    answer: string;
    references: ChatReference[];
  };
  
  

export default function PostsPage() {
  
  const [aiMessage, setAiMessage] = useState("");
  const [aiResponse, setAiResponse] = useState<AiResponse | null>(null);
  const [isSendingAiMessage, setIsSendingAiMessage] = useState(false);
  const [aiError, setAiError] = useState("");

  const [isAiChatMode, setIsAiChatMode] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [tag, setTag] = useState("");

  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [tagError, setTagError] = useState("");

  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postError, setPostError] = useState("");

  //返信フォーム用state
  const [replyingPostId, setReplyingPostId] = useState<string | null>(null);
  const [replyComment, setReplyComment] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");

  //返信一覧
  const [openReplyIds, setOpenReplyIds] = useState<Record<string, boolean>>({});
  const [repliesByPostId, setRepliesByPostId] = useState<Record<string, Post[]>>({});
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [replyListError, setReplyListError] = useState("");

  const { accessToken, isLoggedIn } = useAuth();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoadingTags(true);
        setTagError("");
  
        const response = await fetch(`${API_BASE_URL}/tags/`);
        const data = await response.json().catch(() => []);
  
        if (!response.ok) {
          throw new Error("タグ一覧の取得に失敗しました。");
        }
  
        setTags(data);
      } catch (error) {
        setTagError("タグを読み込めませんでした。");
      } finally {
        setIsLoadingTags(false);
      }
    };
  
    fetchTags();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoadingPosts(true);
        setPostError("");
  
        const response = await fetch(`${API_BASE_URL}/posts/`);
        const data = await response.json().catch(() => []);
  
        if (!response.ok) {
          throw new Error("投稿一覧の取得に失敗しました。");
        }
  
        setPosts(data);
      } catch (error) {
        setPostError("投稿を読み込めませんでした。");
      } finally {
        setIsLoadingPosts(false);
      }
    };
  
    fetchPosts();
  }, []);

  const handleSendAiMessage = async () => {
    const text = aiMessage.trim();
  
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
        },
        body: JSON.stringify({
          text,
        }),
      });
  
      const data = await response.json().catch(() => null);
  
      if (!response.ok) {
        throw new Error(data?.detail ?? "AIチャットの取得に失敗しました。");
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

  const toggleReplies = (postId: string) => {
    setOpenReplyIds((current) => ({
      ...current,
      [postId]: !current[postId],
    }));
  
    if (!repliesByPostId[postId]) {
      fetchReplies(postId);
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((post: Post) => {
      const keywordMatch =
        keyword.trim() === "" ||
        post.title.includes(keyword) ||
        post.comment.includes(keyword);

      const tagMatch = tag === "" || (post.tags ?? []).some((postTag) => postTag.name === tag);

      return keywordMatch && tagMatch;
    });
  }, [posts, keyword, tag]);

  const handleSubmitReply = async (post: Post) => {
    setReplyMessage("");
  
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
  
      const response = await fetch(`${API_BASE_URL}/posts/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `Re: ${post.title}`,
          comment,
          image_url: null,
          tag_ids: [],
          parent_post: post.id,
        }),
      });
  
      const data = await response.json().catch(() => null);
  
      if (response.status === 401) {
        setReplyMessage("ログインの有効期限が切れています。再ログインしてください。");
        return;
      }
  
      if (!response.ok) {
        const errorMessage =
          data?.detail ??
          data?.comment?.[0] ??
          data?.parent_post?.[0] ??
          "コメントの投稿に失敗しました。";
  
        throw new Error(errorMessage);
      }
  
      setReplyComment("");
      setReplyingPostId(null);
  
      // 投稿一覧を再取得する関数があるならここで呼ぶ
      // fetchPosts();
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
      setReplyListError("返信を読み込めませんでした。");
    } finally {
      setIsLoadingReplies(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800 sm:px-6 lg:px-10">
      <header className="mx-auto mb-6 flex max-w-6xl flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-sm font-bold text-blue-600">
            LifeConnect Forum
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            投稿スレッド
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-500">
            悩みや情報を共有できる掲示板です。気になる投稿を探したり、新しく相談を投稿できます。
          </p>
        </div>
  
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsAiChatMode(true)}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-blue-200 bg-white px-5 font-bold text-blue-700 hover:bg-blue-50"
            >
              AI相談
            </button>

            <Link
              href="/posts/new"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-5 font-bold text-white hover:bg-blue-700"
            >
              新規投稿
            </Link>
        </div>
      </header>

      {isAiChatMode ? (
        <div className="w-4xl m-auto">

          <button
                type="button"
                onClick={() => setIsAiChatMode(false)}
                className="mb-4 rounded border px-4 py-2"
              >
                投稿一覧に戻る
          </button>
          <textarea 
            value={aiMessage} 
            onChange={(e) => setAiMessage(e.target.value)}
            className="border border-black w-4xl"
          >
          </textarea>
          <div>
          <button type="button"  onClick={handleSendAiMessage} disabled={isSendingAiMessage}>
            {isSendingAiMessage ? "送信中..." : "送信"}
          </button>
          </div>
          {aiError && (
            <p className="mt-4 text-red-600">
              {aiError}
            </p>
          )}

          {aiResponse?.answer && (
            <div
              className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700"
              dangerouslySetInnerHTML={{ __html: aiResponse.answer }}
            />
          )}

          {aiResponse?.references?.length ? (
            <div className="mt-6 grid gap-4">
              <h2 className="text-base font-bold text-slate-900">
                参考にした掲示板
              </h2>

              {aiResponse.references.map((reference) => {
                const boardPost = reference.board_post;
                const matchedMessage = reference.matched_message;
                const commentCount = boardPost.comment_count ?? 0;

                return (
                  <section
                    key={`${boardPost.id}-${matchedMessage.id}`}
                    className="rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {boardPost.title}
                        </h3>
                        {boardPost.image_url && (
                           <div className="relative mt-4 h-80 w-full overflow-hidden rounded-lg">
                          <Image
                            src={boardPost.image_url}
                            alt={boardPost.title}
                            unoptimized
                            className="mt-4 max-h-96 w-full rounded-lg object-cover"
                          />
                          </div>
                        )}
                        <p className="mt-2 text-sm leading-7 text-slate-700">
                          {boardPost.comment}
                        </p>
                      </div>

                      <span className="shrink-0 text-xs text-slate-500">
                        {new Date(boardPost.created_at).toLocaleString("ja-JP")}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        avatarUrl={boardPost.user?.avatar_url}
                        name={boardPost.user?.nickname}
                        size="sm"
                      />
                      <span>{boardPost.user?.nickname ?? "匿名ユーザー"}</span>
                    </div>

                      {commentCount > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleReplies(boardPost.id)}
                          className="font-bold text-blue-600 hover:text-blue-700"
                        >
                          {openReplyIds[boardPost.id]
                            ? "返信を閉じる"
                            : `返信を見る（${commentCount}件）`}
                        </button>
                      )}
                    </div>

                    <div className="mt-4 rounded-lg bg-slate-50 p-3">
                      <p className="text-xs font-bold text-slate-500">
                        AIが直接参考にしたメッセージ
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-700">
                        {matchedMessage.comment}
                      </p>
                    </div>

                    {openReplyIds[boardPost.id] && (
                      <div className="mt-4">
                        {isLoadingReplies && (
                          <p className="text-sm text-slate-500">返信を取得中です...</p>
                        )}

                        {replyListError && (
                          <p className="text-sm font-bold text-red-600">
                            {replyListError}
                          </p>
                        )}

                        <ReplyList
                          parentId={boardPost.id}
                          repliesByPostId={repliesByPostId}
                          openReplyIds={openReplyIds}
                          toggleReplies={toggleReplies}
                          canReply={false}
                        />
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          ) : null}
        </div>
) : (
  <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[240px_1fr]">
    <aside className="rounded-lg border border-slate-200 bg-white p-4 lg:sticky lg:top-6 lg:self-start">
          <h2 className="mb-3 text-base font-bold text-slate-900">
            タグ
          </h2>
  
          <nav className="flex flex-col gap-2" aria-label="タグメニュー">
            <button
              type="button"
              className={[
                "min-h-10 rounded-lg px-3 text-left text-sm font-bold transition",
                tag === ""
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
              ].join(" ")}
              onClick={() => setTag("")}
            >
              すべて
            </button>
  
            {isLoadingTags && (
              <p className="px-3 py-2 text-sm text-slate-500">
                読み込み中...
              </p>
            )}
  
            {tagError && (
              <p className="px-3 py-2 text-sm text-red-600">
                {tagError}
              </p>
            )}
  
            {tags.map((tagItem) => (
              <button
                type="button"
                key={tagItem.id}
                className={[
                  "min-h-10 rounded-lg px-3 text-left text-sm font-bold transition",
                  tag === tagItem.name
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
                ].join(" ")}
                onClick={() => setTag(tagItem.name)}
              >
                {tagItem.name}
              </button>
            ))}
          </nav>
        </aside>
  
        <div className="min-w-0">
          <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
            <label
              htmlFor="keyword"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              キーワード検索
            </label>
            <input
              id="keyword"
              type="text"
              placeholder="タイトル・本文で検索"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-300 px-3 text-[15px] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </section>
  
          <section className="grid gap-4">
            {filteredPosts.map((post: Post) => (
              <article
                className="rounded-lg border border-slate-200 bg-white p-5"
                key={post.id}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {post.title}
                    </h2>

                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <UserAvatar
                        avatarUrl={post.user?.avatar_url}
                        name={post.user?.nickname}
                        size="sm"
                      />
                      <span>{post.user?.nickname ?? "匿名ユーザー"}</span>
                    </div>
                  </div>

                  <span className="text-sm text-slate-500">
                    {new Date(post.created_at).toLocaleDateString("ja-JP")}
                  </span>
                </div>
                {post.image_url && (
                    <div className="relative mt-4 h-80 w-full overflow-hidden rounded-lg">
                        <Image
                          unoptimized
                          src={post.image_url}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                    </div>
                  )}
  
                <p className="mt-3 leading-7 text-slate-600">
                  {post.comment}
                </p>
  
                <div className="mt-4 flex flex-wrap gap-2">
                {post.tags?.map((tagItem) => (
                  <span
                    key={tagItem.id}
                    className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700"
                  >
                    {tagItem.name}
                  </span>
                ))}
                </div>
  
                <span>返信 {post.comment_count ?? 0}件</span>
                {isLoadingPosts && (
                  <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
                    投稿を読み込み中...
                  </div>
                )}

                {postError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-600">
                    {postError}
                  </div>
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
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      コメント
                    </label>

                    <textarea
                      rows={4}
                      value={replyComment}
                      onChange={(e) => setReplyComment(e.target.value)}
                      placeholder="コメントを入力してください"
                      className="w-full resize-y rounded-lg border border-slate-300 px-3 py-3 text-[15px] leading-7 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    {replyMessage && (
                      <p className="mt-2 text-sm font-bold text-red-600">
                        {replyMessage}
                      </p>
                    )}

                    <div className="">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingPostId(null);
                          setReplyComment("");
                          setReplyMessage("");
                        }}
                        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
                      >
                        キャンセル
                      </button>

                      <button
                        type="button"
                        disabled={isSubmittingReply}
                        onClick={() => handleSubmitReply(post)}
                        className="inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                      >
                        {isSubmittingReply ? "投稿中..." : "投稿する"}
                      </button>
                    </div>
                  </div>
                )}

                {(post.comment_count ?? 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => toggleReplies(post.id)}
                    className="font-bold text-slate-600 hover:text-blue-700"
                  >
                    返信を見る（{post.comment_count}件）
                  </button>
                )}

                {openReplyIds[post.id] && (
  <div className="mt-4 border-t border-slate-100 pt-4">
    {isLoadingReplies && (
      <p className="text-sm text-slate-500">
        返信を読み込み中...
      </p>
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
  </div>
                        )}
                   
              </article>
            ))}
  
            {/* {filteredPosts.length === 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
                条件に一致する投稿がありません。
              </div>
            )} */}
          </section>
        </div>
  </div>
)}
  
    </main>
  );
}
