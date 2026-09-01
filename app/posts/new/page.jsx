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
  const [message, setMessage] = useState("");
  const [tagError, setTagError] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);

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

  const handleSubmit = async(event) => {
    event.preventDefault();
    setMessage("");

    const title = form.title.trim();
    const comment = form.comment.trim();

    if (!title) {
      setMessage("タイトルを入力してください。");
      return;
    }

    if (!comment) {
      setMessage("本文を入力してください。");
      return;
    }

    if (!isLoggedIn || !accessToken) {
      setMessage("投稿するにはログインが必要です。");
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

      if (response.status === 401) {
        setMessage("ログインの有効期限が切れています。再ログインしてください。");
        return;
      }

      if (!response.ok) {
        const errorMessage =
          data?.detail ??
          data?.title?.[0] ??
          data?.comment?.[0] ??
          data?.parent_post?.[0] ??
          "投稿の作成に失敗しました。";

        throw new Error(errorMessage);
      }

      router.push("/posts");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "投稿の作成に失敗しました。",
      );
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

        {message && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {message}
          </p>
        )}

      </div>
    </main>
  );
}
