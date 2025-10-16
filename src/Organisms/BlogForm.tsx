import React from "react";
import TagSelect from "./TagSelect.tsx";
import { useState, useEffect } from "react";
import { useError } from "../Context/ErrorContext.tsx";
import { createTag } from "../API/Tag.tsx";
import { useTagContext } from "../Context/TagContext.tsx";
import Aleart from "./Aleart.tsx";
import { useTagSelection } from "../Context/TagSelectionContext.tsx";
import { createBlog, BlogArticle, updateBlog } from "../API/Blog.tsx";
import { useSuccess } from "../Context/SuccessContext.tsx";

type BlogFormProps = {
  mode: "create" | "edit";
  initialData?: BlogArticle;
  onUpdate?: (updated: BlogArticle) => void;
};

const BlogForm: React.FC<BlogFormProps> = ({ mode, initialData, onUpdate }) => {
  const [tagName, setTagName] = useState("");
  const { setError } = useError();
  const { setSuccess } = useSuccess();
  const [successMessage, setSuccessMessage] = useState("");
  const { tags, setTags } = useTagContext();

  const { selectedTagIds, setSelectedTagIds } = useTagSelection();
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.body || "");
  const [eyecatch, setEyecatch] = useState(initialData?.eyecatch || "");

  useEffect(() => {
    if (mode === "create") {
      setSelectedTagIds([]);
    }
  }, []);
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setContent(initialData.body || "");
      setEyecatch(initialData.eyecatch || "");
    }
  }, [initialData]);
  //タグ作成の処理
  const handleCreateTag = async () => {
    if (!tagName) return;
    try {
      const newTag = await createTag(tagName, setError);
      if (newTag) {
        setTags([...tags, newTag]);
        setError("");
        setSuccessMessage(`「${newTag.name}」が追加されました。`);
      }

      setTagName("");
    } catch {
      setSuccess("");
    }
  };

  const handleSubmitBlog = async () => {
    if (!title || !content) {
      setError("タイトルと本文を入力してください。");
      return;
    }

    if (mode === "create") {
      // 新規作成
      try {
        const newBlog = await createBlog(
          title,
          content,
          selectedTagIds,
          eyecatch,
          setError
        );
        if (newBlog) {
          setError("");
          setSuccess(`記事「${newBlog.title}」が作成されました。`);
          setTitle("");
          setContent("");
          setEyecatch("");
          setError("");
        }
      } catch (e) {
        setSuccess("");
      }
    } else if (mode === "edit" && initialData) {
      try {
        const updated = await updateBlog(
          initialData.id,
          title,
          content,
          selectedTagIds,
          eyecatch,
          setError
        );
        if (updated) {
          setError("");
          setSuccess(`記事「${updated.title}」が更新されました。`);
          if (onUpdate) onUpdate(updated);
        }
      } catch (e) {
        setSuccess("");
      }
    }
  };
  return (
    <>
      <div className="mb-3">
        <label htmlFor="exampleFormControlInput1" className="form-label">
          タイトル
        </label>
        <input
          type="text"
          className="form-control"
          id="exampleFormControlInput1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="exampleFormControlInput1" className="form-label">
          アイキャッチ画像URL
        </label>
        <input
          type="text"
          className="form-control"
          id="exampleFormControlInput1"
          value={eyecatch}
          onChange={(e) => setEyecatch(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="exampleFormControlTextarea1" className="form-label">
          HTMLコード
        </label>
        <textarea
          className="form-control"
          id="exampleFormControlTextarea1"
          rows={15}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>

        <TagSelect variant="static" />
        <button
          type="button"
          className="btn text-bg-success white rounded-circle d-inline-flex align-items-center justify-content-center"
          style={{ width: "50px", height: "50px" }}
          data-bs-toggle="modal"
          data-bs-target="#exampleModal"
          onClick={() => setSuccessMessage("")}
        >
          ＋
        </button>

        <div
          className="modal fade"
          id="exampleModal"
          tabIndex={-1}
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="exampleModalLabel">
                  タグ名
                </h1>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  // placeholder="新しいタグ名"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                />
              </div>
              {successMessage && <p>{successMessage}</p>}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  閉じる
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleCreateTag}
                >
                  追加する
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="btn btn-success"
        onClick={handleSubmitBlog}
      >
        {mode === "create" ? "記事を作成" : "記事を更新"} {/* ★ 修正 */}
      </button>
    </>
  );
};

export default BlogForm;
