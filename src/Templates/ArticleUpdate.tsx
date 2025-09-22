import React from "react";
import NavBar from "../Organisms/NavBar.tsx";
import BlogForm from "../Organisms/BlogForm.tsx";
import UploadImgDisplay from "../Organisms/UploadImgDisplay.tsx";
import Footer from "../Organisms/Footer.tsx";

const ArticleUpdate: React.FC = () => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light ">
      <NavBar />
      <div className="container">
        <h2 className="text-start">編集ページ</h2>
        <main className="flex-grow-1 pt-4">
          <div className="row">
            {/* メインカラム */}
            <div className="col-8">
              <BlogForm buttonLabel="更新" />
            </div>

            {/* サイドバー */}
            <div className="col-4">
              <div className="row">
                {/* サイドバー内部2カラム */}
                <UploadImgDisplay />
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ArticleUpdate;
