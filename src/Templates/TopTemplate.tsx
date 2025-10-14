import React, { useEffect, useState } from "react";
import CardMolecule from "../Organisms/Card.tsx";
import TagSelect from "../Organisms/TagSelect.tsx";
import NavBar from "../Organisms/NavBar.tsx";
import Footer from "../Organisms/Footer.tsx";
import { fetchArticles, BlogArticle } from "../API/Blog.tsx";
import { useError } from "../Context/ErrorContext.tsx";
import Aleart from "../Organisms/Aleart.tsx";
import { useSuccess } from "../Context/SuccessContext.tsx";
import { useLocation } from "react-router-dom";
import { useTagSelection } from "../Context/TagSelectionContext.tsx";

const TopTemplate: React.FC = () => {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const { setError } = useError();
  const { pathname } = useLocation();
  const { clearSelection } = useTagSelection();

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
        <TagSelect variant="scroll" />
        {articles.length > 0 && (
          <CardMolecule
            cards={articles?.map((article) => ({
              image: article.eyecatch || "https://via.placeholder.com/150",
              title: article.title,
              text: article.body.slice(0, 100) + "...",
              buttonText: "詳細を見る",
              buttonHref: `/articles/${article.id}`,
              date: article.created_at,
            }))}
            itemsPerPage={6}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default TopTemplate;
