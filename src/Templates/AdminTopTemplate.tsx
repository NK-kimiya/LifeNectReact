import React, { useEffect, useState } from "react";
import Table, { RowData } from "../Organisms/Table.tsx"; // ← 型も一緒にインポート
import NavBar from "../Organisms/NavBar.tsx";
import Footer from "../Organisms/Footer.tsx";
import { Link } from "react-router-dom";
import { deleteBlog } from "../API/Blog.tsx";
import { useError } from "../Context/ErrorContext.tsx";
import { fetchArticles, BlogArticle } from "../API/Blog.tsx";
import Aleart from "../Organisms/Aleart.tsx";
import { useSuccess } from "../Context/SuccessContext.tsx";
import AleartSuccess from "../Organisms/AleartSuccess.tsx";
const AdminTopTemplate: React.FC = () => {
  const [rows, setRows] = useState<RowData[]>([]);
  const { setError } = useError();
  const { setSuccess } = useSuccess();
  useEffect(() => {
    fetchArticles(setError)
      .then((data: BlogArticle[]) => {
        // BlogArticle → RowData に変換
        const mapped: RowData[] = data?.map((article) => ({
          id: article.id,
          title: article.title,
          author: "管理者", // ★ APIにauthorがある場合は article.author に修正
          date: new Date(article.updated_at).toLocaleDateString(), // ★ APIにdateがある場合は article.date に修正
        }));
        setRows(mapped);
      })
      .catch((err) => {
        console.error("記事一覧の取得に失敗しました:", err);
      });
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("本当に削除しますか？")) return;
    try {
      setError("");
      const ok = await deleteBlog(id, setError);
      if (ok) {
        setSuccess("削除に成功しました。");
        // ★ 成功したら rows から削除
        setRows((prev) => prev.filter((row) => row.id !== id));
      }
    } catch (e) {
      setSuccess("");
    }
  };
  return (
    <div className="d-flex flex-column min-vh-100">
      <NavBar />
      <AleartSuccess />
      <Aleart />
      <div className="container text-start ">
        <button
          type="button"
          className="btn btn-success rounded-circle d-flex align-items-center justify-content-center mt-5"
          style={{ width: "60px", height: "60px" }} // 正方形にする
        >
          <Link
            to="/article-create"
            className="text-white text-decoration-none"
          >
            <i className="bi bi-file-earmark-plus fs-2"></i>{" "}
            {/* アイコンを大きく */}
          </Link>
        </button>
      </div>
      <div className="container flex-fill">
        <h2 className="my-3">管理者ページ - 投稿一覧</h2>
        {/* --- Tableを呼び出し、ページネーションを有効化 --- */}
        <Table rows={rows} itemsPerPage={5} onDelete={handleDelete} />
      </div>
      <Footer />
    </div>
  );
};

export default AdminTopTemplate;
