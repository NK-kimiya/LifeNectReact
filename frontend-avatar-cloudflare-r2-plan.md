### 6. Add A Normal User Profile Page Or Panel

通常ユーザーが自分のプロフィール画像を変更する画面を用意します。

追加候補:

```text
app/profile/page.tsx
```

または、`app/posts/page.tsx` のヘッダー付近にプロフィール編集パネルを置く方法もあります。

おすすめは、責務を分けるために `app/profile/page.tsx` を追加することです。

この画面で行うこと:

- `GET /me/` で現在のユーザー情報を取得する。
- 現在の avatar を表示する。
- 画像ファイルを選択できるようにする。
- 選択した画像を preview 表示する。
- 保存ボタンで署名 URL 取得、R2 アップロード、DB 更新を順番に実行する。
- 削除ボタンで `DELETE /me/avatar/` を呼ぶ。

### 7. Add Admin Avatar Edit UI

管理者もプロフィール画像を変更できるようにします。

候補:

- `app/admin/page.tsx` のヘッダーに小さなプロフィール画像変更 UI を追加する。
- または `app/admin/profile/page.tsx` を追加する。

最初は `app/admin/page.tsx` 内に簡単な管理者プロフィールセクションを追加するのが早いです。

管理者は通常ユーザーとは別 token を持っています。

```text
通常ユーザー token: accessToken
管理者 token: adminAccessToken
```

そのため、同じ avatar API を呼ぶ場合でも、Authorization header に使う token を切り替える必要があります。

### 8. Create Shared Upload Helper

通常ユーザーと管理者で同じアップロード処理を使うため、共通関数に分けるとよいです。

追加候補:

```text
app/lib/avatarApi.ts
```

ただし、現在 `app/lib` は存在しないため、最初は必要になったタイミングで追加します。

共通化したい処理:

- ファイルの MIME type を確認する。
- `POST /me/avatar/upload-url/` を呼ぶ。
- 返ってきた `upload_url` に `PUT` する。
- `PATCH /me/avatar/` を呼ぶ。
- エラー時の message を作る。

### 9. Refresh Current User After Update

画像更新後は、署名付き URL が新しくなるため、`GET /me/` を再取得します。

通常ユーザー:

- `accessToken` を使って `GET /me/`
- プロフィール画面の state を更新

管理者:

- `adminAccessToken` を使って `GET /me/`
- 管理画面ヘッダーやプロフィールセクションの state を更新

### 10. Handle Presigned URL Expiration

`avatar_url` は署名付き URL なので、有効期限があります。

フロント側では以下の方針にします。

- ページ表示時に API から最新の `avatar_url` を受け取る。
- 画像 URL が期限切れになったら、投稿一覧や `me` を再取得する。
- DB に `avatar_url` は保存しない。
- localStorage に `avatar_url` を長期保存しない。

## Files Likely To Change

通常ユーザー関連:

- `app/context/AuthContext.tsx`
- `app/profile/page.tsx`
- `app/posts/page.tsx`
- `app/components/UserAvatar.tsx`

管理者関連:

- `app/context/AdminAuthContext.tsx`
- `app/admin/page.tsx`
- `app/admin/profile/page.tsx`

投稿・返信表示:

- `app/posts/page.tsx`
- `app/components/ReplyList.tsx`
- `app/admin/page.tsx`

共通 API 処理:

- `app/lib/avatarApi.ts`

## Recommended Implementation Path

1. バックエンドで `Post.user.avatar_url` と `GET /me/` の `avatar_url` が返ることを確認する。
2. フロントの `User` 型に `avatar_url` を追加する。
3. `UserAvatar` 表示コンポーネントを作る。
4. 投稿一覧に avatar を表示する。
5. 返信一覧に avatar を表示する。
6. 管理画面の投稿一覧に avatar を表示する。
7. 通常ユーザー用プロフィール画面を追加する。
8. プロフィール画像アップロード処理を実装する。
9. 管理者用プロフィール画像変更 UI を追加する。
10. 通常ユーザーと管理者で同じアップロード処理を共通化する。

## Important Notes

通常ユーザーと管理者は別々の context と token を使っています。

```text
useAuth()
= accessToken

useAdminAuth()
= adminAccessToken
```

同じ backend API を呼ぶ場合でも、どちらの画面から呼ぶかによって `Authorization` header に入れる token を変える必要があります。

また、投稿表示では `avatar_url` が `null` の可能性があります。必ず fallback 表示を用意します。
