# admin/page.tsx で投稿・返信を削除できるようにする流れ

## 目的

管理者ページに表示されている投稿一覧と、その返信ツリーに「削除」ボタンを追加します。

対象は以下です。

- 親の掲示板投稿
- 親投稿への返信
- 返信に対する返信
- さらに深い階層の返信

既存の `admin/page.tsx` は、投稿一覧を表示し、`ReplyList` を使って返信を階層表示しています。
そのため、削除機能も `admin/page.tsx` と `ReplyList.tsx` の連携で作るのが自然です。

## 全体の考え方

削除処理は、以下の流れにします。

```text
管理者が削除ボタンを押す
  ↓
confirm で確認する
  ↓
DELETE /api/posts/{postId}/ を叩く
  ↓
成功したら画面上の state から対象投稿を消す
  ↓
親投稿の場合は posts から消す
返信の場合は repliesByPostId の中から消す
  ↓
親側の comment_count も 1 減らす
```

ポイントは、削除後に毎回ページ全体を再読み込みするのではなく、React の state を更新して画面から消すことです。

## バックエンド側の確認

現在のバックエンドでは、`PostViewSet` が `DefaultRouter` に登録されています。

```python
router.register(r"posts", PostViewSet)
```

そのため、基本的には以下の DELETE API が使えます。

```text
DELETE /api/posts/{postId}/
```

フロント側では、管理者ログイン時の `adminAccessToken` を付けて呼び出します。

```tsx
await fetch(`${API_BASE_URL}/posts/${postId}/`, {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${adminAccessToken}`,
  },
});
```

## 注意点: 親投稿削除時の Pinecone データ

`Post` モデルでは、返信は以下のように親投稿と紐づいています。

```python
parent_post = models.ForeignKey(
    "self",
    on_delete=models.CASCADE,
    blank=True,
    null=True,
    related_name="replies",
)
```

このため、DB 上では親投稿を削除すると、その子返信もまとめて削除されます。

ただし、現在の `destroy` は以下のように、削除対象の `post_id` だけを Pinecone から削除しています。

```python
index.delete(filter={"post_id": str(post_id)})
```

つまり、親投稿を削除した場合、DB からは子返信も消えますが、Pinecone には子返信のベクトルが残る可能性があります。

安全にするなら、バックエンドの `destroy` で、削除対象とその子孫返信の ID をすべて集めてから Pinecone から削除する形がおすすめです。

## バックエンド側を堅くする場合

`PostViewSet` に、子孫返信の ID を集める補助関数を追加します。

```python
def _collect_descendant_post_ids(self, post):
    ids = [post.id]

    for reply in post.replies.all():
        ids.extend(self._collect_descendant_post_ids(reply))

    return ids
```

そして `destroy` の中で、削除対象の ID だけでなく子孫 ID もまとめて削除対象にします。

```python
def destroy(self, request, *args, **kwargs):
    instance = self.get_object()
    post_ids = self._collect_descendant_post_ids(instance)

    try:
        pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        index = pc.Index("my-index")

        for post_id in post_ids:
            index.delete(filter={"post_id": str(post_id)})
    except Exception:
        return Response(
            {"detail": "削除処理中にエラーが発生しました。"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    self.perform_destroy(instance)
    return Response(status=status.HTTP_204_NO_CONTENT)
```

これで、親投稿を削除した場合でも、親投稿と配下の返信のベクトルを削除できます。

## admin/page.tsx に追加する state

削除中の投稿 ID とエラーメッセージを管理する state を追加します。

```tsx
const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
const [deleteError, setDeleteError] = useState("");
```

役割は以下です。

- `deletingPostId`: 今どの投稿を削除中か
- `deleteError`: 削除に失敗したときのメッセージ

`deletingPostId` があると、削除中のボタンだけ `disabled` にできます。

## admin/page.tsx に削除関数を追加する

投稿と返信の両方を同じ関数で削除します。

```tsx
const handleDeletePost = async (post: Post) => {
  const ok = window.confirm("この投稿を削除しますか？");

  if (!ok) {
    return;
  }

  if (!adminAccessToken) {
    handleAuthExpired();
    return;
  }

  try {
    setDeletingPostId(post.id);
    setDeleteError("");

    const response = await fetch(`${API_BASE_URL}/posts/${post.id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${adminAccessToken}`,
      },
    });

    if (response.status === 401) {
      handleAuthExpired();
      return;
    }

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.detail ?? "投稿の削除に失敗しました。");
    }

    removeDeletedPostFromState(post);
  } catch (error) {
    setDeleteError(
      error instanceof Error ? error.message : "投稿の削除に失敗しました。"
    );
  } finally {
    setDeletingPostId(null);
  }
};
```

ここでは、削除成功後に `removeDeletedPostFromState(post)` を呼んで画面から削除します。

## 削除後に画面から消す関数

削除対象が親投稿か返信かで、更新する state が変わります。

```tsx
const removeDeletedPostFromState = (deletedPost: Post) => {
  if (!deletedPost.parent_post) {
    setPosts((currentPosts) =>
      currentPosts.filter((post) => post.id !== deletedPost.id)
    );
    return;
  }

  setRepliesByPostId((current) => {
    const parentId = deletedPost.parent_post;
    const parentReplies = current[parentId] ?? [];

    return {
      ...current,
      [parentId]: parentReplies.filter((reply) => reply.id !== deletedPost.id),
    };
  });

  decrementCommentCount(deletedPost.parent_post);
};
```

処理の意味は以下です。

- `parent_post` が `null` の場合は親投稿なので、`posts` から消す
- `parent_post` がある場合は返信なので、`repliesByPostId[parent_post]` の中から消す
- 返信を消した場合は、親の `comment_count` を 1 減らす

## comment_count を減らす関数

親投稿や返信の `comment_count` を更新する関数です。

```tsx
const decrementCommentCount = (parentId: string) => {
  setPosts((currentPosts) =>
    currentPosts.map((post) =>
      post.id === parentId
        ? {
            ...post,
            comment_count: Math.max((post.comment_count ?? 0) - 1, 0),
          }
        : post
    )
  );

  setRepliesByPostId((current) => {
    const next = { ...current };

    for (const key of Object.keys(next)) {
      next[key] = next[key].map((reply) =>
        reply.id === parentId
          ? {
              ...reply,
              comment_count: Math.max((reply.comment_count ?? 0) - 1, 0),
            }
          : reply
      );
    }

    return next;
  });
};
```

親投稿の返信数を減らすだけでなく、返信の中にある親コメントの返信数も更新できるようにしています。

## 親投稿カードに削除ボタンを追加する

`admin/page.tsx` の `posts.map((post) => (...))` の中に、削除ボタンを追加します。

おすすめの配置は、投稿日時の近くです。

```tsx
<div className="flex shrink-0 flex-col items-end gap-2">
  <span className="text-xs text-gray-500">
    {new Date(post.created_at).toLocaleString("ja-JP")}
  </span>

  <button
    type="button"
    onClick={() => handleDeletePost(post)}
    disabled={deletingPostId === post.id}
    className="rounded-lg border border-red-200 px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {deletingPostId === post.id ? "削除中..." : "削除"}
  </button>
</div>
```

現在のコードでは、投稿日時は以下のように単体で置かれています。

```tsx
<span className="text-xs text-gray-500">
  {new Date(post.created_at).toLocaleString("ja-JP")}
</span>
```

この `span` を、上の `div` に置き換えるイメージです。

## 返信側にも削除ボタンを出すために ReplyList を拡張する

返信は `ReplyList.tsx` の中で表示されています。

そのため、返信に削除ボタンを出すには、`ReplyList` に削除用の props を追加します。

`ReplyListProps` に追加します。

```tsx
canDelete?: boolean;
deletingPostId?: string | null;
handleDeletePost?: (post: Post) => void;
```

そして引数にも追加します。

```tsx
export default function ReplyList({
  parentId,
  repliesByPostId,
  openReplyIds,
  toggleReplies,
  canReply = false,
  canDelete = false,
  deletingPostId,
  handleDeletePost,
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
```

## ReplyList の返信カード内に削除ボタンを追加する

`ReplyList.tsx` の返信表示の中に、以下を追加します。

```tsx
{canDelete && handleDeletePost && (
  <button
    type="button"
    onClick={() => handleDeletePost(reply)}
    disabled={deletingPostId === reply.id}
    className="font-bold text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {deletingPostId === reply.id ? "削除中..." : "削除"}
  </button>
)}
```

配置場所は、返信カード内のボタン群がある場所がよいです。

現在の `ReplyList.tsx` では、以下のような場所があります。

```tsx
<div className="mt-3 flex gap-4 text-sm">
  {canReply && ...}

  {(reply.comment_count ?? 0) > 0 && (...)}
</div>
```

この `div` の中に、削除ボタンも並べます。

## 再帰表示にも削除 props を渡す

`ReplyList` は自分自身を再帰的に呼び出しています。

そのため、下の階層の返信にも削除ボタンを出すには、再帰している `ReplyList` にも同じ props を渡します。

```tsx
<ReplyList
  parentId={reply.id}
  repliesByPostId={repliesByPostId}
  openReplyIds={openReplyIds}
  toggleReplies={toggleReplies}
  canReply={canReply}
  canDelete={canDelete}
  deletingPostId={deletingPostId}
  handleDeletePost={handleDeletePost}
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
```

これを忘れると、1階層目の返信には削除ボタンが出ても、さらに深い返信には削除ボタンが出ません。

## admin/page.tsx から ReplyList に削除 props を渡す

`admin/page.tsx` で `ReplyList` を呼んでいる箇所を、以下のようにします。

```tsx
<ReplyList
  parentId={post.id}
  repliesByPostId={repliesByPostId}
  openReplyIds={openReplyIds}
  toggleReplies={toggleReplies}
  canReply={false}
  canDelete={true}
  deletingPostId={deletingPostId}
  handleDeletePost={handleDeletePost}
/>
```

管理者ページでは削除したいので、`canDelete={true}` を渡します。

通常ユーザーの posts ページや chat ページでは削除ボタンを出したくないため、何も渡さないか、`canDelete={false}` にします。

## 削除エラーの表示

`admin/page.tsx` の投稿一覧セクション内に、削除エラーを表示します。

```tsx
{deleteError && (
  <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
    {deleteError}
  </p>
)}
```

配置場所は、`postError` の下あたりが自然です。

## 最小構成で必要な変更箇所

変更するファイルは、基本的に以下の2つです。

```text
my-app/app/admin/page.tsx
my-app/app/components/ReplyList.tsx
```

バックエンドの Pinecone 削除まで安全にするなら、以下も変更します。

```text
C:\Users\kinar\Desktop\SystemDevelop\develop\LifeConnect\api\myproject\myapp\views\post.py
```

## 実装順序

おすすめの順番は以下です。

1. `admin/page.tsx` に `deletingPostId` と `deleteError` を追加する
2. `admin/page.tsx` に `handleDeletePost` を追加する
3. `admin/page.tsx` に `removeDeletedPostFromState` を追加する
4. `admin/page.tsx` に `decrementCommentCount` を追加する
5. 親投稿カードに削除ボタンを追加する
6. `ReplyList.tsx` に `canDelete` 系 props を追加する
7. `ReplyList.tsx` の返信カードに削除ボタンを追加する
8. 再帰している `ReplyList` にも削除 props を渡す
9. `admin/page.tsx` から `ReplyList` に `canDelete={true}` を渡す
10. 親投稿削除時の Pinecone 残りが気になる場合は、バックエンドの `destroy` を子孫削除対応にする

## 期待する動き

親投稿の削除:

```text
親投稿の削除ボタンを押す
  ↓
DELETE /api/posts/{親投稿ID}/
  ↓
成功
  ↓
posts state から親投稿を削除
  ↓
画面から親投稿カードが消える
```

返信の削除:

```text
返信の削除ボタンを押す
  ↓
DELETE /api/posts/{返信ID}/
  ↓
成功
  ↓
repliesByPostId[parent_post] から返信を削除
  ↓
親の comment_count を 1 減らす
  ↓
画面から返信が消える
```

深い階層の返信の削除:

```text
深い返信の削除ボタンを押す
  ↓
DELETE /api/posts/{返信ID}/
  ↓
成功
  ↓
その返信の parent_post に紐づく配列から削除
  ↓
親返信の comment_count を 1 減らす
  ↓
ReplyList の再帰表示から消える
```

