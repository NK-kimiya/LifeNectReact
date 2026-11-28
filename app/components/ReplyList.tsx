import UserAvatar from "./UserAvatar";

type User = {
  id: number;
  email: string;
  nickname: string;
  avatar_url?: string | null;
};

type Post = {
  id: string;
  is_visible?: boolean;
  user?: User | null;
  title?: string;
  comment?: string;
  image_url?: string | null;
  parent_post?: string | null;
  comment_count?: number;
  created_at?: string;
  updated_at?: string;
  tags?: {
    id: number;
    name: string;
  }[];
};

type ReplyListProps = {
  onToggleVisibility?: (post: Post) => void | Promise<void>;
  parentId: string;
  repliesByPostId: Record<string, Post[]>;
  openReplyIds: Record<string, boolean>;
  toggleReplies: (postId: string) => void;
  canReply?: boolean;

  replyingPostId?: string | null;
  setReplyingPostId?: (postId: string | null) => void;
  replyComment?: string;
  setReplyComment?: (value: string) => void;
  replyMessage?: string;
  setReplyMessage?: (value: string) => void;
  isSubmittingReply?: boolean;
  handleSubmitReply?: (post: Post) => void;

  depth?: number;
};

export default function ReplyList({
  parentId,
  repliesByPostId,
  openReplyIds,
  toggleReplies,
  canReply = false,
  replyingPostId,
  setReplyingPostId,
  replyComment = "",
  setReplyComment,
  replyMessage,
  setReplyMessage,
  isSubmittingReply = false,
  handleSubmitReply,
  onToggleVisibility,
  depth = 0,
}: ReplyListProps) {
  // 親投稿またはコメント ID から、直下の返信一覧を取り出す
  const replies = repliesByPostId[parentId] ?? [];

  return (
    <div
      className={
        depth === 0
          ? "mt-4 grid gap-3"
          : "mt-3 grid gap-3 border-l-2 border-slate-200 pl-4"
      }
    >
      {/* 返信を1件ずつ表示する */}
      {replies.map((reply) => {
        const replyCount =
          repliesByPostId[reply.id]?.length ?? reply.comment_count ?? 0;

        // 非表示のコメントは案内を表示し、管理者には復元ボタンを出す
        if (reply.is_visible === false) {
          return (
            <div key={reply.id} className="rounded-lg bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-bold text-slate-500">
                  このコメントは管理者によって非表示にされました。
                </p>

                {onToggleVisibility && (
                  <button
                    type="button"
                    onClick={() => onToggleVisibility(reply)}
                    className="text-sm font-bold text-slate-700 hover:text-slate-900"
                  >
                    表示に戻す
                  </button>
                )}
              </div>
            </div>
          );
        }

        return (
          <div key={reply.id} className="rounded-lg bg-slate-50 p-4">
            {/* 投稿者・投稿日時・コメント本文を表示する */}
            <div key={reply.id} className="rounded-lg bg-slate-50 p-4">
              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex min-w-0 items-center gap-2">
                  <UserAvatar
                    avatarUrl={reply.user?.avatar_url}
                    name={reply.user?.nickname}
                    size="sm"
                  />
                  <span className="truncate">
                    {reply.user?.nickname ?? "匿名ユーザー"}
                  </span>
                </div>
                <span className="shrink-0">
                  {reply.created_at
                    ? new Date(reply.created_at).toLocaleString("ja-JP")
                    : ""}
                </span>
              </div>
              <p className="leading-7 text-slate-700">{reply.comment}</p>

              {/* 管理者向けの非表示ボタンを表示する */}
              {onToggleVisibility && (
                <button
                  type="button"
                  onClick={() => onToggleVisibility(reply)}
                  className="font-bold text-red-600 hover:text-red-700"
                >
                  非表示にする
                </button>
              )}

              <div className="mt-3 flex gap-4 text-sm">
                {/* 返信できる場合は、入力欄を開くボタンを表示する */}
                {canReply &&
                  setReplyingPostId &&
                  setReplyComment &&
                  setReplyMessage && (
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingPostId(reply.id);
                        setReplyComment("");
                        setReplyMessage("");
                      }}
                      className="font-bold text-blue-600 hover:text-blue-700"
                    >
                      返信する
                    </button>
                  )}

                {/* 返信がある場合は、件数と開閉ボタンを表示する */}
                {replyCount > 0 && (
                  <button
                    type="button"
                    onClick={() => toggleReplies(reply.id)}
                    className="font-bold text-slate-600 hover:text-blue-700"
                  >
                    返信を見る（{replyCount}件）
                  </button>
                )}
              </div>

              {/* 選択中のコメントの下に返信フォームを表示する */}
              {canReply &&
                replyingPostId === reply.id &&
                setReplyingPostId &&
                setReplyComment &&
                setReplyMessage &&
                handleSubmitReply && (
                  <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
                    <textarea
                      rows={3}
                      value={replyComment}
                      onChange={(e) => setReplyComment(e.target.value)}
                      placeholder="返信を入力してください"
                      className="w-full resize-y rounded-lg border border-slate-300 px-3 py-3"
                    />

                    {replyMessage && (
                      <p className="mt-2 text-sm font-bold text-red-600">
                        {replyMessage}
                      </p>
                    )}

                    <div className="mt-3 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingPostId(null);
                          setReplyComment("");
                          setReplyMessage("");
                        }}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold"
                      >
                        キャンセル
                      </button>

                      <button
                        type="button"
                        disabled={isSubmittingReply}
                        onClick={() => handleSubmitReply(reply)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white"
                      >
                        {isSubmittingReply ? "投稿中..." : "投稿する"}
                      </button>
                    </div>
                  </div>
                )}

              {/* 展開中のコメントの返信を、入れ子の ReplyList で表示する */}
              {openReplyIds[reply.id] && (
                <ReplyList
                  parentId={reply.id}
                  repliesByPostId={repliesByPostId}
                  openReplyIds={openReplyIds}
                  toggleReplies={toggleReplies}
                  canReply={canReply}
                  replyingPostId={replyingPostId}
                  setReplyingPostId={setReplyingPostId}
                  replyComment={replyComment}
                  setReplyComment={setReplyComment}
                  replyMessage={replyMessage}
                  setReplyMessage={setReplyMessage}
                  isSubmittingReply={isSubmittingReply}
                  handleSubmitReply={handleSubmitReply}
                  onToggleVisibility={onToggleVisibility}
                  depth={depth + 1}
                />
              )}
            </div>
          </div>
        );
      })}
      {/* 返信が0件の場合は案内を表示する */}
      {replies.length === 0 && (
        <p className="text-sm text-slate-500">まだ返信はありません。</p>
      )}
    </div>
  );
}
