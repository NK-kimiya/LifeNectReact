import React, { useEffect, useState } from "react"; // ★ 追加
import ArticleSearchTemplate from "../Templates/ArticleSearchTemplate.tsx";
import { useSearchParams } from "react-router-dom";

const ArticleSearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  console.log("ALL PARAMS:", searchParams.toString());
  console.log("tag:", searchParams.get("tag"));

  // クエリから値を取得
  const showTable = searchParams.get("showTable") === "true";
  const search = searchParams.get("search") as "tag" | "keyword" | null;
  const tagId = searchParams.get("tagId");
  const tagName = searchParams.get("tag");
  const keywordId = searchParams.get("keywordId");
  const keywordName = searchParams.get("keywordName");

  // ★ 追加: 記事データの状態管理

  return (
    <ArticleSearchTemplate
      showTable={showTable}
      search={search ?? "tag"}
      // tagやkeywordは存在しなければ空オブジェクトにする
      tag={tagName ? { id: Number(tagId), name: tagName } : null}
      keyword={
        keywordName ? { id: Number(keywordId), name: keywordName } : null
      }
    />
  );
};

export default ArticleSearchPage;
