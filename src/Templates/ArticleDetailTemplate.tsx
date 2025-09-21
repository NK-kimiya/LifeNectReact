import React from "react";
import NavBar from "../Organisms/NavBar.tsx";
import Contents from "../Organisms/Contents.tsx";
import Article from "../Organisms/Article.tsx";
import Footer from "../Organisms/Footer.tsx";

const ArticleDetailTemplate = () => {
  return (
    <>
      <NavBar />
      <div className="container pt-5">
        <div className="row">
          <div className="col-4">
            <Contents />
          </div>
          <div className="col-8">
            <Article />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ArticleDetailTemplate;
