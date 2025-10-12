import { useEffect, useLayoutEffect, useRef } from "react";
import { useError } from "./Context/ErrorContext.tsx";
import "./App.css";
import TopPage from "./Pages/TopPage.tsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AiChatPage from "./Pages/AiChatPage.tsx";
import AdminLoginPage from "./Pages/AdminLoginPage.tsx";
import ArticleCreateTemplate from "./Templates/ArticleCreateTemplate.tsx";
import ArticleDetailPage from "./Pages/ArticleDetailPage.tsx";
import ArticleUpdate from "./Templates/ArticleUpdate.tsx";
import AdminTopPage from "./Pages/AdminTopPage.tsx";
import ArticleSearchPage from "./Pages/ArticleSearchPage.tsx";
import { useLocation } from "react-router-dom";
import { useSuccess } from "./Context/SuccessContext.tsx";
const App: React.FC = () => {
  const location = useLocation();
  const { setError } = useError();
  const { setSuccess } = useSuccess();

  const prevPathRef = useRef(location.pathname); // ★追加

  // ★重要: 「前のURL」を保存 → その後に現在URLを前URLとして更新
  useLayoutEffect(() => {
    // 例）/article-update/10 → /article-search の遷移時は
    // このタイミングで '/article-update/10' が保存される
    sessionStorage.setItem("prevPath", prevPathRef.current); // ★追加（前のURLを保存）
    prevPathRef.current = location.pathname; // ★追加（次回のため更新）
  }, [location.pathname]);

  useEffect(() => {
    // ✅ ページ遷移のたびにリセット
    setError("");
    setError("");
  }, [location.pathname]);
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/articles/:id" element={<ArticleDetailPage />} />
        {/* http://localhost:3000/arti<Route path="/articles/:id" element={<ArticleDetailPage />} />cle-search?showTable=true&search=tag&tagId=1&tagName=文字 */}
        <Route path="/article-search" element={<ArticleSearchPage />} />
        <Route path="/chat" element={<AiChatPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/admin-top" element={<AdminTopPage />} />
        <Route path="/article-create" element={<ArticleCreateTemplate />} />
        <Route path="/article-update/:id" element={<ArticleUpdate />} />
      </Routes>
    </div>
  );
};

export default App;
