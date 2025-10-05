import React from "react";
import TagSelect from "./TagSelect.tsx";
import { useState } from "react";
import { useError } from "../Context/ErrorContext.tsx";
import { createTag } from "../API/Tag.tsx";
import { useTagContext } from "../Context/TagContext.tsx";
import Aleart from "./Aleart.tsx";
import { useTagSelection } from "../Context/TagSelectionContext.tsx";
import { createBlog } from "../API/Blog.tsx";

type BlogFormProps = {
  buttonLabel: string;
};

const BlogForm: React.FC<BlogFormProps> = ({ buttonLabel }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagName, setTagName] = useState("");
  const { setError } = useError();
  const [successMessage, setSuccessMessage] = useState("");
  const { tags, setTags } = useTagContext();
  const { selectedTagIds } = useTagSelection();
  const [eyecatch, setEyecatch] = useState("");
  //タグ作成の処理
  const handleCreateTag = async () => {
    if (!tagName) return;
    try {
      const newTag = await createTag(tagName, setError);
      if (newTag) {
        setTags([...tags, newTag]);
        setSuccessMessage(`「${newTag.name}」が追加されました。`);
        setError("");
      }

      setTagName("");
    } catch {
      // エラー時は setError が呼ばれて UI に反映される
    }
  };

  const handleCreateBlog = async () => {
    if (!title || !content) {
      setError("タイトルと本文を入力してください。");
      return;
    }

    const newBlog = await createBlog(
      title,
      content,
      selectedTagIds,
      eyecatch,
      setError
    ); // ★ ここで送信
    if (newBlog) {
      setSuccessMessage(`記事「${newBlog.title}」が作成されました。`);
      setTitle("");
      setContent("");
      setEyecatch("");
      setError("");
    }
  };
  return (
    <>
      <Aleart />
      <div className="mb-3">
        <label htmlFor="exampleFormControlInput1" className="form-label">
          タイトル
        </label>
        <input
          type="text"
          className="form-control"
          id="exampleFormControlInput1"
          placeholder="タイトルを入力"
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
          placeholder="アイキャッチ画像のURLを入力"
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
                  placeholder="新しいタグ名"
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
                  className="btn btn-primary"
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
        onClick={handleCreateBlog}
      >
        {buttonLabel}
      </button>
      <Aleart />
    </>
  );
};

export default BlogForm;
