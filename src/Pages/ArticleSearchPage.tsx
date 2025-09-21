import React from "react";
import ArticleSearchTemplate from "../Templates/ArticleSearchTemplate.tsx";
import { useSearchParams } from "react-router-dom";
const ArticleSearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // クエリから値を取得
  const showTable = searchParams.get("showTable") === "true";
  const search = searchParams.get("search") as "tag" | "keyword" | null;
  const tagId = searchParams.get("tagId");
  const tagName = searchParams.get("tagName");
  const keywordId = searchParams.get("keywordId");
  const keywordName = searchParams.get("keywordName");
  return (
    <ArticleSearchTemplate
      showTable={showTable}
      search={search ?? "tag"}
      // tagやkeywordは存在しなければ空オブジェクトにする
      tag={tagId && tagName ? { id: Number(tagId), name: tagName } : null}
      keyword={
        keywordId && keywordName
          ? { id: Number(keywordId), name: keywordName }
          : null
      }
    />
  );
};

export default ArticleSearchPage;
