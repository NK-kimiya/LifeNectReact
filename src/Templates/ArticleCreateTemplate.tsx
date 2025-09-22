import React from "react";
import BlogForm from "../Organisms/BlogForm.tsx";
import UploadImgDisplay from "../Organisms/UploadImgDisplay.tsx";
import NavBar from "../Organisms/NavBar.tsx";
import Footer from "../Organisms/Footer.tsx";

const ArticleCreateTemplate: React.FC = () => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <NavBar />
      <div className="container">
        <h2 className="text-start">新規投稿</h2>
        <main className="flex-grow-1 pt-4">
          <div className="row">
            {/* メインカラム */}
            <div className="col-8">
              <BlogForm buttonLabel="新規投稿" />
            </div>

            {/* サイドバー */}
            <div className="col-4">
              <div>
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

export default ArticleCreateTemplate;
