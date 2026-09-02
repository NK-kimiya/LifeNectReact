import UserAvatar from "./UserAvatar";

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
    parent_post: string | null;
    comment_count?: number;
    created_at: string;
  };
  
  type ReplyListProps = {
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
    depth = 0,
  }: ReplyListProps) {
    const replies = repliesByPostId[parentId] ?? [];
  
    return (
      <div className={depth === 0 ? "mt-4 grid gap-3" : "mt-3 grid gap-3 border-l-2 border-slate-200 pl-4"}>

      {replies.map((reply) => {
        if (!reply.is_visible) {
          return (
            <div key={reply.id} className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-500">
                このコメントは管理者によって非表示にされました。
              </p>
            </div>
          );
        }

        return (
          <div key={reply.id} className="rounded-lg bg-slate-50 p-4">
            {/* 既存のコメント表示 */}
            <div key={reply.id} className="rounded-lg bg-slate-50 p-4">
            <p className="leading-7 text-slate-700">{reply.comment}</p>
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
                {new Date(reply.created_at).toLocaleString("ja-JP")}
              </span>
            </div>
  
            <div className="mt-3 flex gap-4 text-sm">
              {canReply && setReplyingPostId && setReplyComment && setReplyMessage && (
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
  
              {(reply.comment_count ?? 0) > 0 && (
                <button
                  type="button"
                  onClick={() => toggleReplies(reply.id)}
                  className="font-bold text-slate-600 hover:text-blue-700"
                >
                  返信を見る（{reply.comment_count}件）
                </button>
              )}
            </div>
  
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
                depth={depth + 1}
              />
            )}
          </div>
          </div>
        );
      })}
        {replies.length === 0 && (
          <p className="text-sm text-slate-500">まだ返信はありません。</p>
        )}
      </div>
    );
  }