import React, { useEffect } from "react";
import NavBar from "../Organisms/NavBar.tsx";
import Contents from "../Organisms/Contents.tsx";
import Article from "../Organisms/Article.tsx";
import Footer from "../Organisms/Footer.tsx";
import TagSelect from "../Organisms/TagSelect.tsx";
import Aleart from "../Organisms/Aleart.tsx";
import { useLocation, useMatch } from "react-router-dom";
import { useTagSelection } from "../Context/TagSelectionContext.tsx";
interface ArticleDetailTemplateProps {
  article: any; // TODO: 記事の型を定義できる場合は修正
}

const ArticleDetailTemplate: React.FC<ArticleDetailTemplateProps> = ({
  article,
}) => {
  const { pathname } = useLocation();
  const { clearSelection } = useTagSelection();
  const isArticleDetail = useMatch("/articles/:id");

  useEffect(() => {
    if (isArticleDetail) {
      clearSelection();
    }
  }, [pathname, clearSelection]);
  return (
    <>
      <NavBar />
      <Aleart />
      <TagSelect variant="scroll" />
      <div className=" ">
      <div className="container pt-5">
        <div className="row">
          <div className="col-12 col-md-12">
            {article?.content_type === "qa" ? 
      (
        <div>
          <h2><span className="text-danger fs-2">Q</span><span className="fs-4">{article?.title}</span></h2>
        </div>
      ) : 
      (
        <div>
            <h2 className="border-bottom border-3 border-info pb-2 mb-4 .fs-1">
        {article?.title}
      </h2>
        </div>
     
      )}
     
     {article?.eyecatch && (
      <img src={article?.eyecatch} className="img-fluid pt-3" alt="..."></img>
     )}
            <Contents headings={article?.headings || []} />
            <Article article={article} />
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
};

export default ArticleDetailTemplate;
