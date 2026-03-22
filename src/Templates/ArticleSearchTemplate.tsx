import React, { useEffect, useState, useRef } from "react";
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
import { useLocation, useMatch, matchPath } from "react-router-dom";
import { useTagSelection } from "../Context/TagSelectionContext.tsx";
import { safeSession } from "../utils/safeStorage.tsx";
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
  const { pathname } = useLocation();
  const { clearSelection } = useTagSelection();
  const isArticleSearch = useMatch({ path: "/article-search", end: true });

  const [sp] = useSearchParams();
  const tag_url: string = sp.get("tag") ?? "";
  const search_url = sp.get("search") ?? "";
  const keywordName = sp.get("keywordName") ?? "";

  const prevRef = useRef<{ tag: string; search: string; keywordName: string }>({
    tag: "",
    search: "",
    keywordName: "",
  });

  useEffect(() => {
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

  useEffect(() => {
    if (!isArticleSearch) return;

    const prev = prevRef.current;
    const prevPath = (() => {
      const r = safeSession.get("prevPath"); // 例外を投げない
      return r.ok ? r.value ?? "" : "";
    })();

    // ★条件:
    //  前回: tag があり（例: ?tag=Python）
    //  今回: search または keywordName があり（例: ?search=keyword&keywordName=うつ病）
    const changedFromTagToKeyword =
      prev.tag !== "" && (search_url !== "" || keywordName !== "");

    const prevWasArticleUpdate = /^\/article-update\/\d+$/.test(prevPath);
    if (changedFromTagToKeyword || prevWasArticleUpdate) {
      clearSelection();
    }

    // ★最後に今回値を保存（次回比較用）
    prevRef.current = { tag: tag_url, search: search_url, keywordName };
  }, [isArticleSearch, tag_url, search_url, keywordName, clearSelection]);

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
    content_type: a.content_type,
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
