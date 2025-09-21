import React from "react";
import Table, { RowData } from "../Organisms/Table.tsx"; // ← 型も一緒にインポート

const AdminTopTemplate: React.FC = () => {
  // --- 表示するデータを準備 ---
  const rows: RowData[] = [
    { id: 1, title: "就職と小児がん", author: "田中", date: "2025/9/20" },
    { id: 2, title: "就職活動と小児がん", author: "田中", date: "2025/9/21" },
    {
      id: 3,
      title: "小児がん経験者の就労支援",
      author: "佐藤",
      date: "2025/9/22",
    },
    { id: 4, title: "医療と就職の両立", author: "鈴木", date: "2025/9/23" },
    { id: 5, title: "支援制度の活用法", author: "高橋", date: "2025/9/24" },
    { id: 6, title: "仲間との交流", author: "田中", date: "2025/9/25" },
    // ...さらに複数のデータ
  ];

  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="container flex-fill">
        <h2 className="my-3">管理者ページ - 投稿一覧</h2>
        {/* --- Tableを呼び出し、ページネーションを有効化 --- */}
        <Table rows={rows} itemsPerPage={5} />
      </div>
    </div>
  );
};

export default AdminTopTemplate;
