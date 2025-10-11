import React, { useEffect, useState } from "react";
import NavBar from "../Organisms/NavBar.tsx";
import BlogForm from "../Organisms/BlogForm.tsx";
import UploadImgDisplay from "../Organisms/UploadImgDisplay.tsx";
import Footer from "../Organisms/Footer.tsx";
import { useParams } from "react-router-dom";
import { fetchArticleById, BlogArticle } from "../API/Blog.tsx";
import { useTagSelection } from "../Context/TagSelectionContext.tsx";
import { useError } from "../Context/ErrorContext.tsx";
import Aleart from "../Organisms/Aleart.tsx";
import AleartSuccess from "../Organisms/AleartSuccess.tsx";

const ArticleUpdate: React.FC = () => {
  const { setSelectedTagIds } = useTagSelection();
  const { id } = useParams<{ id: string }>();

  // 記事データ用のstate
  const [article, setArticle] = useState<any>(null);
  const { setError } = useError();
  useEffect(() => {
    if (id) {
      fetchArticleById(id, setError)
        .then((data) => {
          setArticle(data);
          if (data?.tags) {
            const tagIds = data.tags?.map(
              (tag: { id: number; name: string }) => tag.id
            );
            setSelectedTagIds(tagIds);
          }
        })
        .catch((err) => {
          console.error("記事取得に失敗しました:", err);
        });
    }
  }, [id]);
  return (
    <div className="d-flex flex-column min-vh-100 bg-light ">
      <NavBar />
      <Aleart />
      <AleartSuccess />
      <div className="container">
        <h2 className="text-start">編集ページ</h2>
        <main className="flex-grow-1 pt-4">
          <div className="row">
            {/* メインカラム */}
            <div className="col-8">
              <BlogForm
                mode="edit"
                initialData={article}
                onUpdate={(updated) => setArticle(updated)}
              />
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
