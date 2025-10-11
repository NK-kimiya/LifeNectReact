import React from "react";
import NavBar from "../Organisms/NavBar.tsx";
import Contents from "../Organisms/Contents.tsx";
import Article from "../Organisms/Article.tsx";
import Footer from "../Organisms/Footer.tsx";
import TagSelect from "../Organisms/TagSelect.tsx";
import Aleart from "../Organisms/Aleart.tsx";
interface ArticleDetailTemplateProps {
  article: any; // TODO: 記事の型を定義できる場合は修正
}

const ArticleDetailTemplate: React.FC<ArticleDetailTemplateProps> = ({
  article,
}) => {
  return (
    <>
      <NavBar />
      <Aleart />
      <TagSelect variant="scroll" />
      <div className="container pt-5">
        <div className="row">
          <div className="col-12 col-md-4">
            <Contents headings={article?.headings || []} />
          </div>
          <div className="col-12 col-md-8">
            <Article article={article} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ArticleDetailTemplate;
