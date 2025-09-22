import React from "react";
import NavBar from "../Organisms/NavBar.tsx";
import Contents from "../Organisms/Contents.tsx";
import Article from "../Organisms/Article.tsx";
import Footer from "../Organisms/Footer.tsx";
import TagSelect from "../Organisms/TagSelect.tsx";

const ArticleDetailTemplate: React.FC = () => {
  return (
    <>
      <NavBar />
      <TagSelect variant="scroll" />
      <div className="container pt-5">
        <div className="row">
          <div className="col-12 col-md-4">
            <Contents />
          </div>
          <div className="col-12 col-md-8">
            <Article />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ArticleDetailTemplate;
