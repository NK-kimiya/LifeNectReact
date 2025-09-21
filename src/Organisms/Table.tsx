import React, { useState } from "react";
import { Link } from "react-router-dom";

// --- 行データの型定義 ---
export type RowData = {
  id: number;
  title: string;
  author: string;
  date: string;
};

type TableProps = {
  rows: RowData[]; // ← 呼び出し側からデータを受け取る
  itemsPerPage?: number; // ← 1ページあたりの件数（デフォルト5）
};

const Table: React.FC<TableProps> = ({ rows, itemsPerPage = 5 }) => {
  // --- ページ番号を管理 ---
  const [currentPage, setCurrentPage] = useState(1);

  // --- ページネーション計算 ---
  const totalPages = Math.ceil(rows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRows = rows.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="container">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">タイトル</th>
            <th scope="col">投稿者</th>
            <th scope="col">日付</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((row) => (
            <tr key={row.id}>
              <th scope="row">{row.id}</th>
              <td>
                <div>
                  <p>{row.title}</p>
                  <Link to="/article-update" className="link-success">
                    編集
                  </Link>
                  <a className="link-danger px-2" href="#">
                    削除
                  </a>
                </div>
              </td>
              <td>{row.author}</td>
              <td>{row.date}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* --- ページネーション --- */}
      <nav
        aria-label="Page navigation"
        className="d-flex justify-content-center"
      >
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </button>
          </li>

          {[...Array(totalPages)].map((_, i) => (
            <li
              key={i}
              className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            </li>
          ))}

          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Table;
