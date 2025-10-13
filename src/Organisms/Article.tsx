import React, { memo } from "react";
interface ArticleProps {
  article: any; // TODO: 記事の型を定義できる場合は修正
}
const Article: React.FC<ArticleProps> = ({ article }) => {
  return (
    <>
      {/* h2タグのタイトルにする */}
      {/* h3タグのIDはheading1,heading2...とする */}

      <h2 className="border-bottom border-success bg-success text-white p-3">
        {article?.title}
      </h2>

      <img src={article?.eyecatch} className="img-fluid pt-3" alt="..."></img>

      <div
        data-bs-spy="scroll"
        data-bs-target="#simple-list-example"
        data-bs-offset="0"
        tabIndex={0}
        className="scrollspy-example position-relative"
        style={{ minHeight: "90vh", scrollBehavior: "smooth" }}
      >
        <div className="text-start">
          {/* 記事本文 */}
          <div
            className="text-start"
            dangerouslySetInnerHTML={{ __html: article?.body }}
          />
        </div>
      </div>
    </>
  );
};

export default memo(Article);
