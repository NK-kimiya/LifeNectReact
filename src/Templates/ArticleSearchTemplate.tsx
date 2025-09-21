import React from "react";
import NavBar from "../Organisms/NavBar.tsx";
import TagSelect from "../Organisms/TagSelect.tsx";
import CardMolecule from "../Organisms/Card.tsx";
import Footer from "../Organisms/Footer.tsx";
import Table, { RowData } from "../Organisms/Table.tsx";

// --- 型定義 ---
type TagInfo = {
  id: number;
  name: string;
};

type KeywordInfo = {
  id: number;
  name: string;
};
// --- propsの型定義 ---
type ArticleSearchTemplateProps = {
  showTable: boolean;
  search: "tag" | "keyword";
  tag?: TagInfo | null;
  keyword?: KeywordInfo | null;
};

const ArticleSearchTemplate: React.FC<ArticleSearchTemplateProps> = ({
  showTable,
  search,
  tag,
  keyword,
}) => {
  type CardData = {
    imgSrc: string;
    title: string;
    text: string;
    buttonText: string;
    buttonHref: string;
  };

  const cards: CardData[] = [
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル1",
      text: "これはカード1の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/1",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル2",
      text: "これはカード2の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/2",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル1",
      text: "これはカード1の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/1",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル2",
      text: "これはカード2の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/2",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル1",
      text: "これはカード1の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/1",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル2",
      text: "これはカード2の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/2",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル1",
      text: "これはカード1の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/1",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル2",
      text: "これはカード2の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/2",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル1",
      text: "これはカード1の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/1",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル2",
      text: "これはカード2の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/2",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル1",
      text: "これはカード1の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/1",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル2",
      text: "これはカード2の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/2",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル1",
      text: "これはカード1の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/1",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル2",
      text: "これはカード2の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/2",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル1",
      text: "これはカード1の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/1",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル2",
      text: "これはカード2の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/2",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル1",
      text: "これはカード1の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/1",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル2",
      text: "これはカード2の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/2",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル1",
      text: "これはカード1の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/1",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル2",
      text: "これはカード2の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/2",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル1",
      text: "これはカード1の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/1",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル2",
      text: "これはカード2の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/2",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル1",
      text: "これはカード1の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/1",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル2",
      text: "これはカード2の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/2",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル1",
      text: "これはカード1の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/1",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル2",
      text: "これはカード2の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/2",
    },
  ];

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

  // --- 見出しを切り替え ---
  const renderHeading = () => {
    if (search === "tag" && tag) {
      return <h2>「タグ検索：{tag.name}」の結果</h2>;
    }
    if (search === "keyword" && keyword) {
      return <h2>「キーワード検索：{keyword.name}」の結果</h2>;
    }
    return <h2>検索結果</h2>;
  };

  return (
    <>
      <NavBar />
      <div className="container flex-fill min-vh-100">
        <TagSelect />

        {/* 見出しを表示 */}
        {renderHeading()}

        {/* --- 表示切り替え（Table or Card） --- */}
        {showTable ? (
          <Table rows={rows} itemsPerPage={5} />
        ) : (
          <CardMolecule cards={cards} itemsPerPage={6} />
        )}
      </div>
      <Footer />
    </>
  );
};

export default ArticleSearchTemplate;
