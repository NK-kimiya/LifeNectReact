# chat/page.tsx で AI の参照掲示板を表示する流れ

## 目的

AI チャットの回答で使用した投稿やコメントを、チャット画面に表示できるようにします。

表示したい形は、`posts` や `admin` と同じ考え方です。

1. AI の回答を表示する
2. AI が参照したメッセージを表示する
3. そのメッセージが属している親の掲示板を表示する
4. 親掲示板の「返信を見る」を押す
5. `/posts/{id}/replies/` を叩く
6. 返信を取得して、`ReplyList` で階層表示する
7. 返信にさらに返信がある場合も、同じ `ReplyList` の再帰表示で辿れるようにする

## 前提のレスポンス形式

バックエンドの `/api/rag-answer/` は、最終的に以下のような形式で返すのが扱いやすいです。

```json
{
  "answer": "<p>回答本文</p>",
  "references": [
    {
      "matched_message": {
        "id": "返信または投稿のID",
        "title": "Re: 年金についての申請方法",
        "comment": "AIが直接参考にした本文",
        "parent_post": "親投稿ID",
        "type": "reply",
        "comment_count": 0,
        "created_at": "2026-08-06T04:13:32.265215+00:00",
        "user": {
          "id": 3,
          "nickname": "kimikou",
          "email": "example@example.com"
        },
        "score": 0.657
      },
      "board_post": {
        "id": "親掲示板のID",
        "title": "年金についての申請方法",
        "comment": "親掲示板の本文",
        "parent_post": null,
        "type": "post",
        "comment_count": 3,
        "created_at": "2026-08-06T04:00:00+00:00",
        "user": {
          "id": 1,
          "nickname": "匿名ユーザー",
          "email": "example@example.com"
        },
        "tags": []
      }
    }
  ]
}
```

重要なのは、`matched_message` と `board_post` を分けることです。

- `matched_message`: AI が直接参考にした投稿または返信
- `board_post`: そのメッセージが属している一番親の掲示板

フロントでは `board_post` をカードとして表示し、そのカードの「返信を見る」から返信一覧を取得します。

## chat/page.tsx に追加する主な state

`chat/page.tsx` では、最低限以下の state が必要になります。

```tsx
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

const [chatText, setChatText] = useState("");
const [aiResponse, setAiResponse] = useState<AiResponse | null>(null);
const [isSending, setIsSending] = useState(false);
const [chatError, setChatError] = useState("");

const [openReplyIds, setOpenReplyIds] = useState<Record<string, boolean>>({});
const [repliesByPostId, setRepliesByPostId] = useState<Record<string, Post[]>>({});
const [isLoadingReplies, setIsLoadingReplies] = useState(false);
const [replyListError, setReplyListError] = useState("");
```

それぞれの役割は以下です。

- `chatText`: チャット入力欄の文字
- `aiResponse`: バックエンドから返ってきた AI 回答全体
- `isSending`: AI へ問い合わせ中かどうか
- `chatError`: チャット送信時のエラー
- `openReplyIds`: どの投稿の返信欄を開いているか
- `repliesByPostId`: 投稿 ID ごとの返信一覧
- `isLoadingReplies`: 返信取得中かどうか
- `replyListError`: 返信取得時のエラー

## 型定義

`chat/page.tsx` が TypeScript のため、レスポンスに合わせて型を用意します。

```tsx
type User = {
  id: number;
  nickname: string;
  email: string;
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
};

type ChatReference = {
  matched_message: Post;
  board_post: Post;
};

type AiResponse = {
  answer: string;
  references: ChatReference[];
};
```

`ReplyList.tsx` 側の `Post` 型に `tags` がない場合でも、表示に使わなければ基本的には問題ありません。
ただし TypeScript の型エラーが出る場合は、`ReplyList.tsx` の `Post` 型にも以下を追加します。

```tsx
tags?: {
  id: number;
  name: string;
}[];
```

## ReplyList を読み込む

`chat/page.tsx` から既存の `ReplyList` を使います。

`app/chat/page.tsx` から `app/components/ReplyList.tsx` を読む場合は、以下のような import になります。

```tsx
import ReplyList from "../components/ReplyList";
```

`ReplyList` はすでに再帰表示できる作りなので、チャット画面でも再利用できます。

チャット画面では、まずは返信投稿機能までは不要なので、`canReply={false}` として読み取り専用で使うのが安全です。

## AI チャットを送信する関数

チャット送信ボタンを押したら、`/api/rag-answer/` に入力内容を送ります。

```tsx
const handleSendChat = async () => {
  const text = chatText.trim();

  if (!text) {
    setChatError("メッセージを入力してください。");
    return;
  }

  try {
    setIsSending(true);
    setChatError("");
    setAiResponse(null);

    const response = await fetch(`${API_BASE_URL}/rag-answer/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.detail ?? "AIチャットの取得に失敗しました。");
    }

    setAiResponse(data);
  } catch (error) {
    setChatError(
      error instanceof Error
        ? error.message
        : "AIチャットの取得に失敗しました。"
    );
  } finally {
    setIsSending(false);
  }
};
```

## contentEditable の入力内容を state に入れる

現在の `chat/page.tsx` は `contentEditable` の `div` を入力欄として使っています。

その場合、既存の `handleChange` の中で `chatText` も更新します。

```tsx
const handleChange = (e: React.FormEvent<HTMLDivElement>) => {
  const el = e.currentTarget;
  const text = el.textContent ?? "";

  setChatText(text);
  setIsLongTextArea(el.scrollHeight > 50);
};
```

送信ボタン側では、`onClick={handleSendChat}` を設定します。

もし実装を簡単にしたい場合は、`contentEditable` よりも `<textarea>` に置き換える方が扱いやすいです。
ただし、今の見た目を保ちたい場合は `contentEditable` のままでも大丈夫です。

## 返信を取得する関数

親掲示板や返信の「返信を見る」を押したときに、`/api/posts/{postId}/replies/` を叩きます。

```tsx
const fetchReplies = async (postId: string) => {
  try {
    setIsLoadingReplies(true);
    setReplyListError("");

    const response = await fetch(`${API_BASE_URL}/posts/${postId}/replies/`);

    if (!response.ok) {
      throw new Error("返信の取得に失敗しました。");
    }

    const data = await response.json();

    setRepliesByPostId((current) => ({
      ...current,
      [postId]: data,
    }));
  } catch (error) {
    setReplyListError(
      error instanceof Error ? error.message : "返信の取得に失敗しました。"
    );
  } finally {
    setIsLoadingReplies(false);
  }
};
```

## 返信を見るボタンの開閉関数

`ReplyList` に渡す `toggleReplies` です。

```tsx
const toggleReplies = (postId: string) => {
  setOpenReplyIds((current) => ({
    ...current,
    [postId]: !current[postId],
  }));

  if (!repliesByPostId[postId]) {
    fetchReplies(postId);
  }
};
```

この関数を使うことで、以下の流れになります。

- まだ返信を取得していない場合は API を叩く
- すでに取得済みの場合は、開閉だけ行う
- `ReplyList` 内の返信に対する「返信を見る」でも同じ関数を使える

## AI 回答の表示

まずは見た目を整えずに確認したい場合、回答はそのまま文字列として表示します。

```tsx
{aiResponse?.answer && (
  <div className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
    {aiResponse.answer}
  </div>
)}
```

ただし、現在の `answer` は `<p>` や `<ul>` を含む HTML 文字列です。

HTML として表示したい場合は、以下のようにします。

```tsx
{aiResponse?.answer && (
  <div
    className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700"
    dangerouslySetInnerHTML={{ __html: aiResponse.answer }}
  />
)}
```

注意点として、`dangerouslySetInnerHTML` を使う場合は、バックエンド側で安全な HTML だけを返す設計にしておく必要があります。
最初の確認段階では、文字列表示のままでも問題ありません。

## 参照した掲示板の表示

AI 回答の下に、参照した掲示板を表示します。

```tsx
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
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {boardPost.comment}
              </p>
            </div>

            <span className="shrink-0 text-xs text-slate-500">
              {new Date(boardPost.created_at).toLocaleString("ja-JP")}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>{boardPost.user?.nickname ?? "匿名ユーザー"}</span>

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
```

この表示では、親掲示板を中心に見せます。

`matchedMessage` は「AI が直接参考にしたメッセージ」として、親掲示板カードの中に補足表示します。
そのため、AI が返信を参考にした場合でも、ユーザーはその返信が属している掲示板全体を辿れます。

## どこに配置するか

`chat/page.tsx` のメインエリアの中で、AI の回答を表示する場所のすぐ下に配置するのが自然です。

おすすめの順番は以下です。

1. チャットの質問
2. AI の回答
3. 参考にした掲示板
4. 掲示板カード内の「返信を見る」
5. `ReplyList` による返信ツリー

入力欄は今のまま画面下部に固定、またはメインエリアの下部に置く形で問題ありません。

## バックエンドがまだ古い references 形式の場合

もしバックエンドがまだ以下のような平坦な形を返している場合があります。

```json
{
  "references": [
    {
      "id": "44870241-5f4e-42c3-8c6b-1aa3cec7d724",
      "title": "Re: 年金についての申請方法",
      "comment": "私も年金の申請をしましたが、難しかったです。",
      "parent_post": "58103f25-46b9-4b9c-9c61-35cefd684d9d",
      "type": "reply"
    }
  ]
}
```

この形だと、親掲示板の本文や返信数を表示できません。

そのため、基本的にはバックエンドを修正して、`matched_message` と `board_post` を返す形にするのがおすすめです。

どうしても一時的に両方の形式に対応したい場合は、フロント側で以下のように吸収できます。

```tsx
const boardPost = reference.board_post ?? reference;
const matchedMessage = reference.matched_message ?? reference;
```

ただし、この場合は `boardPost` が本当の親掲示板ではなく、AI が直接参考にした返信そのものになる可能性があります。
本来やりたい表示にはならないため、最終的にはバックエンド側で親掲示板を返すようにする方が良いです。

## 実装時の注意点

- `chat/page.tsx` では `ReplyList` を再利用する
- チャット画面では返信投稿までは不要なら `canReply={false}` にする
- 親掲示板の返信数は `board_post.comment_count` を使う
- `comment_count` が `0` の場合は「返信を見る」を表示しない
- 「返信を見る」を押したときだけ `/posts/{id}/replies/` を叩く
- 返信の中の「返信を見る」は `ReplyList` が再帰的に処理する
- AI が直接参考にしたメッセージは `matched_message` として別枠で表示する

## 全体の処理の流れ

```text
ユーザーがチャットを送信
  ↓
POST /api/rag-answer/
  ↓
AI回答 answer と references を受け取る
  ↓
answer をチャット画面に表示
  ↓
references[].board_post を掲示板カードとして表示
  ↓
references[].matched_message を「AIが直接参考にしたメッセージ」として表示
  ↓
ユーザーが「返信を見る」を押す
  ↓
GET /api/posts/{board_post.id}/replies/
  ↓
repliesByPostId[board_post.id] に保存
  ↓
ReplyList で返信ツリーを表示
  ↓
返信内の「返信を見る」を押した場合も同じ流れでさらに深い返信を取得
```

