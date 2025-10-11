import React, { useEffect, useState } from "react";
import NavBar from "../Organisms/NavBar.tsx";
import TagSelect from "../Organisms/TagSelect.tsx";
import CardMolecule from "../Organisms/Card.tsx";
import Footer from "../Organisms/Footer.tsx";
import Table, { RowData } from "../Organisms/Table.tsx";
import { useSearchParams } from "react-router-dom";
import { fetchFilteredArticles, BlogArticle } from "../API/Blog.tsx";
import { CardData } from "../Organisms/Card.tsx"; // ← 必ず1つに統一
import { deleteBlog } from "../API/Blog.tsx";
import { useError } from "../Context/ErrorContext.tsx";
import Aleart from "../Organisms/Aleart.tsx";
interface Props {
  showTable: boolean;
  search: "tag" | "keyword";
  tag: { id: number; name: string } | null;
  keyword: { id: number; name: string } | null;
}

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
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const { setError } = useError();
  useEffect(() => {
    console.log("タグは" + tag?.name);
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // 🔽 searchの値によって tag か keyword を使い分け
        let keywordQuery = "";
        let tagQuery = "";

        if (search === "keyword" && keyword) {
          keywordQuery = keyword.name;
        }
        if (search === "tag" && tag) {
          tagQuery = tag.name;
        }

        const res = await fetchFilteredArticles(
          keywordQuery,
          tagQuery,
          setError
        );
        setArticles(res);
      } catch (e) {
        setError("記事の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [search, tag, keyword]);

  // BlogArticle → Table用 RowData に変換
  const tableRows: RowData[] = articles.map((a) => ({
    id: a.id,
    title: a.title,
    author: a.author ?? "不明", // BlogArticleに無ければ仮の値
    date: a.created_at ?? "不明", // BlogArticleに無ければcreated_atを利用
  }));

  // BlogArticle → Card用 CardData に変換
  const cards: CardData[] = articles?.map((a) => ({
    image: a.eyecatch ?? "/default.png", // BlogArticleにimageが無ければデフォルト
    title: a.title,
    text: a.body.substring(0, 100),
    buttonText: "続きを読む",
    buttonHref: `/articles/${a.id}`,
  }));
  // --- 見出しを切り替え ---
  const renderHeading = (): React.ReactElement => {
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
      <Aleart />
      <div className="container flex-fill min-vh-100">
        <TagSelect variant="scroll" />

        {/* 見出しを表示 */}
        {renderHeading()}

        {/* --- 表示切り替え（Table or Card） --- */}
        {showTable ? (
          <Table
            rows={tableRows}
            itemsPerPage={5}
            onDelete={async (id: number) => {
              try {
                await deleteBlog(id, setError);
                alert("記事を削除しました");
              } catch (e) {}
            }}
          />
        ) : (
          <CardMolecule cards={cards} itemsPerPage={6} />
        )}
      </div>
      <Footer />
    </>
  );
};

export default ArticleSearchTemplate;
