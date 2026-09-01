# AIチャットで参照した掲示板を返すためのバックエンド修正

バックエンド側では `rag_answer.py` を修正して、`references` を次の構造で返すようにします。

```json
{
  "matched_message": "AIが直接参考にした投稿/コメント",
  "board_post": "そのメッセージが属する親掲示板"
}
```

## 1. import を追加

`rag_answer.py` の上部に追加します。

```python
from myapp.models import Post
```

すでに間違って次のように書いている場合は、

```python
from myproject.myapp.models import Post
```

必ず次に変更してください。

```python
from myapp.models import Post
```

## 2. RagAnswer クラス内に補助メソッドを追加

`RagAnswer` クラスの中に、以下を追加します。場所は `post()` メソッドより上がおすすめです。

```python
def _get_root_post(self, post: Post) -> Post:
    current = post

    while current.parent_post_id:
        current = current.parent_post

    return current


def _serialize_post_reference(self, post: Post, excerpt=None, score=None):
    return {
        "id": str(post.id),
        "title": post.title,
        "comment": post.comment,
        "excerpt": excerpt,
        "parent_post": str(post.parent_post_id) if post.parent_post_id else None,
        "type": "reply" if post.parent_post_id else "post",
        "comment_count": post.replies.count(),
        "created_at": post.created_at.isoformat(),
        "user": {
            "id": post.user.id,
            "nickname": post.user.nickname,
            "email": post.user.email,
        } if post.user else None,
        "score": score,
        "tags": [
            {
                "id": tag.id,
                "name": tag.name,
            }
            for tag in post.tags.all()
        ],
    }
```

役割は次の通りです。

```txt
_get_root_post:
  返信や返信への返信から、最上位の親投稿までたどる

_serialize_post_reference:
  フロントで表示しやすい形に投稿データを整える
```

## 3. article_id を使っている処理を置き換える

今の `rag_answer.py` には、おそらく次のような処理があります。

```python
id_title_list = [
    {
        "id": int(m.get("metadata", {}).get("article_id"))
        if m.get("metadata", {}).get("article_id") is not None else None,
        "title": m.get("metadata", {}).get("title")
    }
    for m in filtered_matches
    if m.get("metadata", {}).get("title") and m.get("metadata", {}).get("article_id")
]
```

これは古い `article_id` 前提なので不要です。

このブロックから `unique_id_title_list` を作っているところまで削除し、代わりに以下を入れます。

```python
reference_candidates = []

for m in filtered_matches:
    metadata = m.get("metadata", {})
    post_id = metadata.get("post_id")

    if not post_id:
        continue

    reference_candidates.append({
        "post_id": post_id,
        "title": metadata.get("title"),
        "excerpt": metadata.get("text"),
        "parent_post": metadata.get("parent_post"),
        "type": metadata.get("type"),
        "score": m.get("score"),
    })
```

## 4. post_id から DB の Post を取得する

`reference_candidates` を作った直後に追加します。

```python
references = []
seen_matched_post_ids = set()

for item in reference_candidates:
    post_id = item["post_id"]

    if post_id in seen_matched_post_ids:
        continue

    seen_matched_post_ids.add(post_id)

    try:
        matched_post = (
            Post.objects
            .select_related("user", "parent_post")
            .prefetch_related("tags")
            .get(id=post_id)
        )
    except Post.DoesNotExist:
        continue

    board_post = self._get_root_post(matched_post)

    references.append({
        "matched_message": self._serialize_post_reference(
            matched_post,
            excerpt=item["excerpt"],
            score=item["score"],
        ),
        "board_post": self._serialize_post_reference(
            board_post,
            excerpt=None,
            score=None,
        ),
    })
```

これで、AIが直接参考にしたコメントが返信だった場合でも、最上位の親掲示板を `board_post` として返せます。

## 5. 最後の Response を変更

今は最後に次のように返しているはずです。

```python
return Response({
    "answer": answer,
    "article": unique_id_title_list
}, status=200)
```

これを次に変更します。

```python
return Response({
    "answer": answer,
    "references": references,
}, status=200)
```

一時的に古いフロントとの互換性を残したいなら、次の形でもOKです。

```python
return Response({
    "answer": answer,
    "references": references,
    "article": references,
}, status=200)
```

## 返却イメージ

修正後は次のようになります。

```json
{
  "answer": "...",
  "references": [
    {
      "matched_message": {
        "id": "44870241-...",
        "title": "Re: 年金についての申請方法",
        "comment": "私も年金の申請をしましたが、難しかったです。",
        "type": "reply",
        "parent_post": "58103f25-...",
        "comment_count": 0,
        "score": 0.657
      },
      "board_post": {
        "id": "58103f25-...",
        "title": "年金についての申請方法",
        "comment": "親投稿の本文",
        "type": "post",
        "parent_post": null,
        "comment_count": 3
      }
    }
  ]
}
```

## 注意点

Pinecone に保存済みの古いデータに `post_id` が入っていない場合、そのデータは `references` に出ません。

新しく投稿・返信したもの、または再登録したものから正しく出るようになります。
