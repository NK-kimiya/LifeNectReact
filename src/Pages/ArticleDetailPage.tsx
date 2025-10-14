import React, { useEffect, useState } from "react";
import "../App.css";
import ArticleDetailTemplate from "../Templates/ArticleDetailTemplate.tsx";
import { useParams } from "react-router-dom";
import axios from "axios";
import { fetchArticleById, BlogArticle } from "../API/Blog.tsx";
import { useError } from "../Context/ErrorContext.tsx";
const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // 記事データ用のstate
  const [article, setArticle] = useState<any>(null);
  const { setError } = useError();
  useEffect(() => {
    if (id) {
      fetchArticleById(id, setError)
        .then((data) => {
          // HTMLをパース
          const parser = new DOMParser();
          const doc = parser.parseFromString(data.body, "text/html");

          // h3タグに順番でidを付与
          const headings: { id: string; title: string }[] = [];
          doc.querySelectorAll("h3").forEach((el, index) => {
            const headingId = `heading${index + 1}`;
            el.setAttribute("id", headingId);
            headings.push({ id: headingId, title: el.textContent || "" });
          });

          data.body = doc.body.innerHTML;
          setArticle({ ...data, headings });
        })
        .catch((err) => {
          console.error("記事取得に失敗しました:", err);
        });
    }
  }, [id]);
  return (
    <>
      <ArticleDetailTemplate article={article} />
    </>
  );
};

export default ArticleDetailPage;
