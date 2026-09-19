"use client";
//APIから返ってくるデータ型
type Me = {
    profile_text?: string;
    id: number;
    email: string;
    nickname: string;
    role: string;
    provider: string;
    avatar_url?: string | null;
};

type AvatarUploadUrlResponse = {
    avatar_key: string;
    upload_url: string;
    content_type: string;
  };

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
    is_visible?: boolean;
    title?: string;
    comment?: string;
    parent_post?: string | null;
    comment_count?: number;
    like_count?: number;
    is_liked?: boolean;
    created_at?: string;
    user?: User | null;
    tags?: Tag[];
    image_url?: string | null;
  };

//許可する画像形式ブロック
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

import { useState,useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import UserAvatar from "../components/UserAvatar";
import Link from "next/link";
const API_BASE_URL =process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";
export default function ProfilePage() {
    
    const { accessToken, isLoggedIn,logout } = useAuth();
    const router = useRouter();

    /* State定義*/
    const [me, setMe] = useState<Me | null>(null);//現在ログイン中のユーザー情報
    const [selectedFile, setSelectedFile] = useState<File | null>(null);//ユーザーが選択した画像ファイル
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);//選択画像を保存前に画面表示するための一時URL
    const [message, setMessage] = useState("");//エラーや成功メッセージ
    const [isLoading, setIsLoading] = useState(false);//ユーザー情報取得中かどうか
    const [isSaving, setIsSaving] = useState(false);//画像保存・削除中かどうか
    const [profileText, setProfileText] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [myPosts, setMyPosts] = useState<Post[]>([]);
    const [likedPosts, setLikedPosts] = useState<Post[]>([]);
    const [postListError, setPostListError] = useState("");
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const canDeleteAccount = Boolean(me?.email) && deleteConfirmText === me?.email;
    
    useEffect(() => {
      if (!isLoggedIn || !accessToken) {
        router.replace("/");
        return;
      }
    
      let isCancelled = false;
    
      const loadMe = async () => {
        setIsLoading(true);
      
        try {
          const [meResponse, myPostsResponse, likedPostsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/me/`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }),
            fetch(`${API_BASE_URL}/posts/my-posts/`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }),
            fetch(`${API_BASE_URL}/posts/liked/`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }),
          ]);
      
          const meData = await meResponse.json().catch(() => null);
          const myPostsData = await myPostsResponse.json().catch(() => []);
          const likedPostsData = await likedPostsResponse.json().catch(() => []);
      
          if (!meResponse.ok) {
            throw new Error(meData?.detail ?? "プロフィール情報の取得に失敗しました。");
          }
      
          if (!myPostsResponse.ok || !likedPostsResponse.ok) {
            setPostListError("投稿一覧の取得に失敗しました。");
          }
      
          if (!isCancelled) {
            setMe(meData);
            setProfileText(meData?.profile_text ?? "");
            setMyPosts(Array.isArray(myPostsData) ? myPostsData : []);
            setLikedPosts(Array.isArray(likedPostsData) ? likedPostsData : []);
          }
        } catch (error) {
          if (!isCancelled) {
            setMessage(
              error instanceof Error
                ? error.message
                : "プロフィール情報の取得に失敗しました。",
            );
          }
        } finally {
          if (!isCancelled) {
            setIsLoading(false);
          }
        }
      };
    
      void loadMe();
    
      return () => {
        isCancelled = true;
      };
    }, [isLoggedIn, accessToken, router]);
    


    //ファイル選択処理
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
      
        if (!file) {
          return;
        }
      
        if (!allowedTypes.includes(file.type)) {
          setMessage("JPEG、PNG、WebP の画像を選択してください。");
          return;
        }
      
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setMessage("");
      };


      //avatar 保存処理
      const handleSaveAvatar = async () => {
        if (!selectedFile || !accessToken) {
          return;
        }
      
        try {
          setIsSaving(true);
          setMessage("");
      
          const uploadUrlResponse = await fetch(`${API_BASE_URL}/me/avatar/upload-url/`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content_type: selectedFile.type,
            }),
          });
      
          const uploadUrlData: AvatarUploadUrlResponse =
            await uploadUrlResponse.json();
      
          if (!uploadUrlResponse.ok) {
            throw new Error("アップロードURLの取得に失敗しました。");
          }

          
          console.log(selectedFile.type)
          console.log("アップロードのURL："+uploadUrlData.upload_url)
      
          const r2Response = await fetch(uploadUrlData.upload_url, {
            method: "PUT",
            headers: {
              "Content-Type": selectedFile.type,
            },
            body: selectedFile,
          });
      
          if (!r2Response.ok) {
            throw new Error("画像アップロードに失敗しました。");
          }
      
          const saveResponse = await fetch(`${API_BASE_URL}/me/avatar/`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              avatar_key: uploadUrlData.avatar_key,
              avatar_content_type: selectedFile.type,
            }),

          });
      
          const saveData = await saveResponse.json().catch(() => null);
      
          if (!saveResponse.ok) {
            throw new Error(saveData?.detail ?? "プロフィール画像の保存に失敗しました。");
          }
          const newAvatarUrl = previewUrl;
      
          setSelectedFile(null);
          setPreviewUrl(null);
          setMessage("プロフィール画像を更新しました。");

          
          setMe((current) =>
            current
              ? { ...current, avatar_url: newAvatarUrl }
              : current,
          );
      
        } catch (error) {
          setMessage(
            error instanceof Error
              ? error.message
              : "プロフィール画像の更新に失敗しました。",
          );
        } finally {
          setIsSaving(false);
        }
      };

      //avatar 削除処理ブロック
      const handleDeleteAvatar = async () => {
        if (!accessToken) {
          return;
        }
      
        try {
          setIsSaving(true);
          setMessage("");
      
          const response = await fetch(`${API_BASE_URL}/me/avatar/`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
      
          if (!response.ok) {
            const data = await response.json().catch(() => null);
            throw new Error(data?.detail ?? "プロフィール画像の削除に失敗しました。");
          }
      
          setSelectedFile(null);
          setPreviewUrl(null);
          setMessage("プロフィール画像を削除しました。");

          setMe((current) =>
            current
              ? { ...current, avatar_url: null }
              : current,
          );
      

        } catch (error) {
          setMessage(
            error instanceof Error
              ? error.message
              : "プロフィール画像の削除に失敗しました。",
          );
        } finally {
          setIsSaving(false);
        }
      };

      const handleSaveProfile = async () => {
        if (!accessToken) {
          return;
        }
      
        try {
          setIsSavingProfile(true);
          setMessage("");
      
          const response = await fetch(`${API_BASE_URL}/me/`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              profile_text: profileText,
            }),
          });
      
          const data = await response.json().catch(() => null);
      
          if (!response.ok) {
            throw new Error(data?.detail ?? "プロフィール文の保存に失敗しました。");
          }
      
          setMe(data);
          setProfileText(data?.profile_text ?? "");
          setMessage("プロフィール文を保存しました。");
        } catch (error) {
          setMessage(
            error instanceof Error
              ? error.message
              : "プロフィール文の保存に失敗しました。",
          );
        } finally {
          setIsSavingProfile(false);
        }
      };

      const handleDeleteAccount = async () => {
        if (!accessToken || !canDeleteAccount) {
          return;
        }
      
        try {
          setIsDeletingAccount(true);
          setMessage("");
      
          const response = await fetch(`${API_BASE_URL}/me/`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
      
          const data = await response.json().catch(() => null);
      
          if (!response.ok) {
            throw new Error(data?.detail ?? "アカウント削除に失敗しました。");
          }
      
          logout();
          router.replace("/");
        } catch (error) {
          setMessage(
            error instanceof Error
              ? error.message
              : "アカウント削除に失敗しました。",
          );
        } finally {
          setIsDeletingAccount(false);
        }
      };

      const renderPostList = (title: string, posts: Post[]) => (
        <section className="grid gap-4">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      
          {posts.length === 0 ? (
            <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500">
              投稿はありません。
            </p>
          ) : (
            posts.map((post) => {
              if (post.is_visible === false) {
                return (
                  <article
                    key={post.id}
                    className="rounded-lg border border-slate-200 bg-white p-5"
                  >
                    <p className="text-sm font-bold text-slate-500">
                      この投稿は非表示です。
                    </p>
                  </article>
                );
              }
      
              return (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block rounded-lg border border-slate-200 bg-white p-5 hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {post.title}
                      </h3>
      
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
                      {post.created_at
                        ? new Date(post.created_at).toLocaleDateString("ja-JP")
                        : ""}
                    </span>
                  </div>
      
                  <p className="mt-3 line-clamp-3 leading-7 text-slate-600">
                    {post.comment}
                  </p>
      
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {(post.tags ?? []).map((tagItem) => (
                        <span
                          key={tagItem.id}
                          className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700"
                        >
                          {tagItem.name}
                        </span>
                      ))}
                    </div>
      
                    <div className="flex gap-4 text-sm text-slate-500">
                      <span>いいね {post.like_count ?? 0}件</span>
                      <span>コメント {post.comment_count ?? 0}件</span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </section>
      );
    
      return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800">
          <section className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-6">
            <h1 className="text-2xl font-bold text-slate-900">
              プロフィール
            </h1>
      
            {message && (
              <p className="mt-4 rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700">
                {message}
              </p>
            )}
      
            {isLoading ? (
              <p className="mt-6 text-sm text-slate-500">
                読み込み中...
              </p>
            ) : (
              <div className="mt-6 grid gap-6">
              {postListError && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {postListError}
                </p>
              )}

              {renderPostList("作成した投稿", myPosts)}

              {renderPostList("いいねした投稿", likedPosts)}
                <div className="flex items-center gap-4">
                  <UserAvatar
                    avatarUrl={previewUrl ?? me?.avatar_url}
                    name={me?.nickname}
                    size="lg"
                  />
      
                  <div>
                    <p className="font-bold text-slate-900">
                      {me?.nickname ?? "ユーザー"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {me?.email}
                    </p>
                  </div>
                </div>
      
                <div className="grid gap-2">
                  <label
                    htmlFor="avatar"
                    className="text-sm font-bold text-slate-700"
                  >
                    プロフィール画像
                  </label>
      
                  <input
                    id="avatar"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
      
                  <p className="text-xs text-slate-500">
                    JPEG、PNG、WebP の画像を選択できます。
                  </p>
                </div>
      
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleSaveAvatar}
                    disabled={!selectedFile || isSaving}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-5 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {isSaving ? "保存中..." : "保存する"}
                  </button>
      
                  <button
                    type="button"
                    onClick={handleDeleteAvatar}
                    disabled={isSaving || !me?.avatar_url}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    削除する
                  </button>
                </div>

                <div className="grid gap-2">
                    <label
                      htmlFor="profileText"
                      className="text-sm font-bold text-slate-700"
                    >
                      プロフィール文
                    </label>

                    <textarea
                      id="profileText"
                      rows={5}
                      value={profileText}
                      onChange={(e) => setProfileText(e.target.value)}
                      maxLength={1000}
                      className="w-full resize-y rounded-lg border border-slate-300 px-3 py-3 text-sm"
                    />

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500">
                        自己紹介や相談したいことを書けます。
                      </p>
                      <span className="text-xs text-slate-400">
                        {profileText.length}/1000
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile}
                      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-5 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {isSavingProfile ? "保存中..." : "プロフィール文を保存"}
                    </button>
                  </div>
                                </div>
            )}
          </section>

          <section className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5">
            <h2 className="text-lg font-bold text-red-700">アカウント削除</h2>

            <p className="mt-2 text-sm text-red-700">
              アカウントを削除すると、投稿やプロフィール情報も削除されます。
              この操作は取り消せません。
            </p>

            <p className="mt-4 text-sm text-red-700">
              削除するには、登録メールアドレスを入力してください。
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(event) => setDeleteConfirmText(event.target.value)}
              className="mt-2 w-full rounded-lg border border-red-300 px-4 py-3 text-sm outline-none focus:border-red-500"
              placeholder={me?.email ?? "登録メールアドレス"}
            />

            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={!canDeleteAccount || isDeletingAccount}
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-red-600 px-5 font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isDeletingAccount ? "削除中..." : "アカウントを削除"}
            </button>
          </section>
        </main>
      );
  }