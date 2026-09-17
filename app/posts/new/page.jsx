"use client";

import { useState,useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export default function NewPostPage() {
  const router = useRouter();
  const { accessToken, isLoggedIn } = useAuth();
  const [form, setForm] = useState({
    title: "",
    comment: "",
    tagIds: [],
  });
  const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

  const [tags, setTags] = useState([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message,setMessage] = useState("");
  const [postCreateError, setPostCreateError] = useState(null);
  const [tagError, setTagError] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  const getTagFetchError = (status) => {
    switch (status) {
      case 400:
        return {
          code: 400,
          title: "リクエストエラー",
          message: "タグ一覧の取得条件に問題があります。",
        };
      case 401:
        return {
          code: 401,
          title: "認証エラー",
          message: "ログイン情報が無効です。再ログインしてください。",
        };
      case 403:
        return {
          code: 403,
          title: "アクセス権限エラー",
          message: "タグ一覧を取得する権限がありません。",
        };
      case 404:
        return {
          code: 404,
          title: "タグ取得APIが見つかりません",
          message: "APIのURLが正しいか確認してください。",
        };
      case 500:
        return {
          code: 500,
          title: "サーバーエラー",
          message: "サーバー側で問題が発生しています。",
        };
      default:
        return {
          code: status,
          title: "タグ一覧の取得に失敗しました",
          message: `予期しないエラーが発生しました。HTTP ${status}`,
        };
    }
  };

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoadingTags(true);
        setTagError("");

        const response = await fetch(`${API_BASE_URL}/tags/`,{
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          }});
        const data = await response.json().catch(() => []);
        if (!response.ok) {
          setTagError(getTagFetchError(response.status));
          return;
        }

        setTags(data);
      } catch (error) {
        setTagError({
          code: "network",
          title: "通信エラー",
          message: "サーバーに接続できませんでした。ネットワーク状況を確認してください。",
        });
      } finally {
        setIsLoadingTags(false);
      }
    };

    fetchTags();
  }, []);

  //ファイル選択時の処理
  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
  
    if (!file) {
      setSelectedImageFile(null);
      return;
    }
  
    if (!allowedImageTypes.includes(file.type)) {
      setMessage("画像はJPEG、PNG、WebPのみアップロードできます。");
      event.target.value = "";
      setSelectedImageFile(null);
      return;
    }
  
    setMessage("");
    setSelectedImageFile(file);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleTagChange = (tagId) => {
    setForm((current) => {
      const exists = current.tagIds.includes(tagId);

      return {
        ...current,
        tagIds: exists
          ? current.tagIds.filter((id) => id !== tagId)
          : [...current.tagIds, tagId],
      };
    });
  };

  const getPostCreateError = (status, data) => {
    switch (status) {
      case 400:
        return {
          code: 400,
          title: "入力エラー",
          message:
            data?.detail ??
            data?.title?.[0] ??
            data?.comment?.[0] ??
            data?.tag_ids?.[0] ??
            data?.image_key?.[0] ??
            "入力内容に問題があります。",
        };
      case 401:
        return {
          code: 401,
          title: "認証エラー",
          message: "ログイン情報が無効です。再ログインしてください。",
        };
      case 403:
        return {
          code: 403,
          title: "アクセス権限エラー",
          message: "投稿を作成する権限がありません。",
        };
      case 404:
        return {
          code: 404,
          title: "投稿作成APIが見つかりません",
          message: "APIのURLが正しいか確認してください。",
        };
      case 413:
        return {
          code: 413,
          title: "ファイルサイズエラー",
          message: "投稿画像のサイズが大きすぎます。",
        };
      case 415:
        return {
          code: 415,
          title: "画像形式エラー",
          message: "対応していない画像形式です。",
        };
      case 429:
        return {
          code: 429,
          title: "リクエスト制限",
          message: "短時間に投稿しすぎています。時間をおいて再度お試しください。",
        };
      case 500:
        return {
          code: 500,
          title: "サーバーエラー",
          message: "サーバー側で問題が発生しています。",
        };
      default:
        return {
          code: status,
          title: "投稿作成に失敗しました",
          message: `予期しないエラーが発生しました。HTTP ${status}`,
        };
    }
  };

  const handleSubmit = async(event) => {
    event.preventDefault();
    setMessage("");
    setPostCreateError(null);
    const title = form.title.trim();
    const comment = form.comment.trim();

    if (!title) {
      setPostCreateError({
        code: 400,
        title: "入力エラー",
        message: "タイトルを入力してください。",
      });
      return;
    }

    if (!comment) {
      setPostCreateError({
        code: 400,
        title: "入力エラー",
        message: "本文を入力してください。",
      });
      return;
    }

    if (!isLoggedIn || !accessToken) {
      setPostCreateError({
        code: 401,
        title: "認証エラー",
        message: "投稿するにはログインが必要です。",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      let uploadedImageKey = null;
      let uploadedImageContentType = null;

      if (selectedImageFile) {
        const uploadUrlResponse = await fetch(`${API_BASE_URL}/posts/upload-url/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content_type: selectedImageFile.type,
          }),
        });

        const uploadUrlData = await uploadUrlResponse.json().catch(() => null);

        if (!uploadUrlResponse.ok) {
          throw new Error(
            uploadUrlData?.detail ?? "アップロードURLの取得に失敗しました。"
          );
        }

        const r2Response = await fetch(uploadUrlData.upload_url, {
          method: "PUT",
          headers: {
            "Content-Type": selectedImageFile.type,
          },
          body: selectedImageFile,
        });
        
        if (!r2Response.ok) {
          throw new Error("画像アップロードに失敗しました。");
        }



        uploadedImageKey = uploadUrlData.image_key;
        uploadedImageContentType = selectedImageFile.type;
      }

      const payload = {
        title,
        comment,
        tag_ids: form.tagIds,
        parent_post: null,
      };
      
      if (uploadedImageKey && uploadedImageContentType) {
        payload.image_key = uploadedImageKey;
        payload.image_content_type = uploadedImageContentType;
      }

      const response = await fetch(`${API_BASE_URL}/posts/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setPostCreateError(getPostCreateError(response.status, data));
        return;
      }

      router.push("/posts");
    } catch (error) {
      setPostCreateError({
        code: "network",
        title: "通信エラー",
        message: "サーバーに接続できませんでした。ネットワーク状況を確認してください。",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link
            href="/posts"
            className="text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            投稿一覧へ戻る
          </Link>
        </div>

        <header className="mb-6">
          <p className="mb-2 text-sm font-bold text-blue-600">
            LifeConnect Forum
          </p>
          <h1 className="text-3xl font-bold tracking-normal text-slate-900">
            新規投稿
          </h1>
          <p className="mt-3 leading-7 text-slate-500">
            悩みや経験、知っている支援情報などを共有できます。
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="grid gap-2">
            <label
              htmlFor="title"
              className="text-sm font-bold text-slate-700"
            >
              タイトル
            </label>
            <input
              id="title"
              name="title"
              type="text"
              maxLength={200}
              placeholder="例：一人暮らしで不安なとき、どうしていますか？"
              value={form.title}
              onChange={handleChange}
              className="h-11 rounded-lg border border-slate-300 px-3 text-[15px] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <span className="justify-self-end text-xs text-slate-500">
              {form.title.length}/200
            </span>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="comment"
              className="text-sm font-bold text-slate-700"
            >
              本文
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={10}
              placeholder="相談したいこと、共有したい経験、知りたい情報などを書いてください。"
              value={form.comment}
              onChange={handleChange}
              className="resize-y rounded-lg border border-slate-300 px-3 py-3 text-[15px] leading-7 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid gap-2">
              <div>
                    <label
                      htmlFor="postImage"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      投稿画像
                    </label>

                    <input
                      id="postImage"
                      name="postImage"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageFileChange}
                      className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-700"
                    />

                    {selectedImageFile && (
                      <p className="mt-2 text-sm text-slate-500">
                        選択中: {selectedImageFile.name}
                      </p>
                    )}
            </div>
           
          </div>

          <fieldset className="grid gap-3">
            <legend className="text-sm font-bold text-slate-700">タグ</legend>
              {isLoadingTags && (
              <p className="text-sm text-slate-500">タグを読み込み中...</p>
            )}

            {tagError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                <p className="text-sm font-bold">エラー番号: {tagError.code}</p>
                <p className="mt-1 text-sm font-bold">{tagError.title}</p>
                <p className="mt-1 text-sm">{tagError.message}</p>

                {(tagError.code === 401 || tagError.code === 403) && (
                  <p className="mt-3 text-sm">
                    <Link
                      href="/auth"
                      className="font-bold text-blue-600 underline underline-offset-2 hover:text-blue-700"
                    >
                      ログインページへ移動する
                    </Link>
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
                  const checked = form.tagIds.includes(tag.id);

                  return (
                    <label
                      key={tag.id}
                      className={[
                        "inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-bold transition",
                        checked
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-300 bg-white text-slate-600 hover:border-blue-300",
                      ].join(" ")}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleTagChange(tag.id)}
                        className="h-4 w-4 accent-blue-600"
                      />
                      <span>{tag.name}</span>
                    </label>
                  );
                })}
            </div>
          </fieldset>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Link
              href="/posts"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 font-bold text-slate-700 hover:bg-slate-50"
            >
              キャンセル
            </Link>

            <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-5 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? "投稿中..." : "投稿する"}
          </button>
          </div>
        </form>

        {postCreateError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="text-sm font-bold">エラー番号: {postCreateError.code}</p>
            <p className="mt-1 text-sm font-bold">{postCreateError.title}</p>
            <p className="mt-1 text-sm">{postCreateError.message}</p>

            {(postCreateError.code === 401 || postCreateError.code === 403) && (
              <p className="mt-3 text-sm">
                <Link
                  href="/auth"
                  className="font-bold text-blue-600 underline underline-offset-2 hover:text-blue-700"
                >
                  ログインページへ移動する
                </Link>
              </p>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
