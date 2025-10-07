import React, { useEffect, useState } from "react";
import CardMolecule from "../Organisms/Card.tsx";
import TagSelect from "../Organisms/TagSelect.tsx";
import NavBar from "../Organisms/NavBar.tsx";
import Footer from "../Organisms/Footer.tsx";
import { fetchArticles, BlogArticle } from "../API/Blog.tsx";

const TopTemplate: React.FC = () => {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchArticles().then((data) => setArticles(data));
  }, []);
  return (
    <div className="d-flex flex-column min-vh-100">
      <NavBar />
      <div className="container flex-fill">
        <TagSelect variant="scroll" />
        {articles.length > 0 && (
          <CardMolecule
            cards={articles.map((article) => ({
              image: article.eyecatch || "https://via.placeholder.com/150",
              title: article.title,
              text: article.body.slice(0, 100) + "...",
              buttonText: "詳細を見る",
              buttonHref: `/articles/${article.id}`,
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
