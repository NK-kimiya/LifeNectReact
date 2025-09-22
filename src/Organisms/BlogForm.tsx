import React from "react";
import TagSelect from "./TagSelect.tsx";

type BlogFormProps = {
  buttonLabel: string;
};

const BlogForm: React.FC<BlogFormProps> = ({ buttonLabel }) => {
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
          placeholder="タイトルを入力"
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
        ></textarea>

        <TagSelect variant="static" />
      </div>

      <button type="button" className="btn btn-success">
        {buttonLabel}
      </button>
    </>
  );
};

export default BlogForm;
