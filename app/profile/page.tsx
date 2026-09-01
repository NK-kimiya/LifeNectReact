"use client";
//APIから返ってくるデータ型
type Me = {
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
//許可する画像形式ブロック
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

import { useState,useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import UserAvatar from "../components/UserAvatar";
const API_BASE_URL =process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";
export default function ProfilePage() {
    
    const { accessToken, isLoggedIn } = useAuth();
    const router = useRouter();

    /* State定義*/
    const [me, setMe] = useState<Me | null>(null);//現在ログイン中のユーザー情報
    const [selectedFile, setSelectedFile] = useState<File | null>(null);//ユーザーが選択した画像ファイル
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);//選択画像を保存前に画面表示するための一時URL
    const [message, setMessage] = useState("");//エラーや成功メッセージ
    const [isLoading, setIsLoading] = useState(false);//ユーザー情報取得中かどうか
    const [isSaving, setIsSaving] = useState(false);//画像保存・削除中かどうか
    

    //プロフィール取得
    const fetchMe = useCallback(async () => {
        if (!accessToken) {
          return;
        }
      
        const response = await fetch(`${API_BASE_URL}/me/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      
        const data = await response.json().catch(() => null);

        console.log("me response", data);
        console.log("avatar_url", data?.avatar_url);
      
        if (!response.ok) {
          throw new Error(data?.detail ?? "プロフィール情報の取得に失敗しました。");
        }
      
        setMe(data);
  
      }, [accessToken]);

    //初回表示時のログイン確認・me取得
    useEffect(() => {
        if (!isLoggedIn || !accessToken) {
          router.replace("/");
          return;
        }
        fetchMe();
    }, [isLoggedIn, accessToken, router, fetchMe]);


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

      
          setSelectedFile(null);
          setPreviewUrl(null);
          setMessage("プロフィール画像を更新しました。");
      
          await fetchMe();
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
      
          await fetchMe();
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
              </div>
            )}
          </section>
        </main>
      );
  }