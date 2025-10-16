import React from "react";
import BlogForm from "../Organisms/BlogForm.tsx";
import UploadImgDisplay from "../Organisms/UploadImgDisplay.tsx";
import NavBar from "../Organisms/NavBar.tsx";
import Footer from "../Organisms/Footer.tsx";
import Aleart from "../Organisms/Aleart.tsx";
import AleartSuccess from "../Organisms/AleartSuccess.tsx";
import { useAuth } from "../Context/AuthContext.tsx";
import { Link } from "react-router-dom";

const ArticleCreateTemplate: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <NavBar />
      <Aleart />
      <AleartSuccess />
      <div className="container">
        {isAuthenticated ? (
          <>
            <h2 className="text-start">新規投稿</h2>
            <main className="flex-grow-1 pt-4">
              <div className="row">
                {/* メインカラム */}
                <div className="col-12 col-md-8">
                  <BlogForm mode="create" />
                </div>

                {/* サイドバー */}
                <div className="col-12 col-md-4">
                  <div>
                    {/* サイドバー内部2カラム */}
                    <UploadImgDisplay />
                  </div>
                </div>
              </div>
            </main>
          </>
        ) : (
          <div className="d-flex min-vh-100 d-flex align-items-center justify-content-center">
            <Link to="/admin-login" className="btn btn-outline-success ms-2 ">
              このページは、管理者専用のページです。ログインしてください。
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ArticleCreateTemplate;
