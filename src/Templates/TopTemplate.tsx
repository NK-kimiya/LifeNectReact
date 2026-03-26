import React, { useEffect, useState } from "react";
import CardMolecule from "../Organisms/Card.tsx";
import TagSelect from "../Organisms/TagSelect.tsx";
import NavBar from "../Organisms/NavBar.tsx";
import Footer from "../Organisms/Footer.tsx";
import { fetchArticles, BlogArticle } from "../API/Blog.tsx";
import { useError } from "../Context/ErrorContext.tsx";
import Aleart from "../Organisms/Aleart.tsx";
import { useLocation } from "react-router-dom";
import { useTagSelection } from "../Context/TagSelectionContext.tsx";
import Consultation from "../Organisms/Consultation.tsx";

const TopTemplate: React.FC = () => {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const { setError } = useError();
  const { pathname } = useLocation();
  const { clearSelection } = useTagSelection();

  const stripHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

const truncateText = (text: string, length: number) => {
  return text.length > length ? text.slice(0, length) + "..." : text;
};

  useEffect(() => {
    fetchArticles(setError).then((data) => setArticles(data));
  }, []);

  useEffect(() => {
    if (pathname === "/") {
      clearSelection();
    }
  }, [pathname, clearSelection]);
  return (
    <div className="d-flex flex-column min-vh-100">
      <NavBar />
      <Aleart />
      <div className="container flex-fill">
        <div className="row">
          <div className="col-md-8">
            <TagSelect variant="scroll" />
            {articles.length > 0 && (
          <CardMolecule
            cards={articles?.map((article) => ({
              image: article.eyecatch,
              title: article.title,
              text:
              article.content_type === "qa"
                ? article.body
                : truncateText(stripHtml(article.body), 100),
              buttonText: "詳細を見る",
              buttonHref: `/articles/${article.id}`,
              date: article.created_at,
              content_type: article.content_type,
            }))}
            itemsPerPage={6}
          />
        )}
          </div>
          <div className="col-md-4">
            <Consultation />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TopTemplate;
