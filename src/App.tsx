import React from "react";
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

const App: React.FC = () => {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/article-detail" element={<ArticleDetailPage />} />
          {/* http://localhost:3000/article-search?showTable=true&search=tag&tagId=1&tagName=文字 */}
          <Route path="/article-search" element={<ArticleSearchPage />} />
          <Route path="/chat" element={<AiChatPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/admin-top" element={<AdminTopPage />} />
          <Route path="/article-create" element={<ArticleCreateTemplate />} />
          <Route path="/article-update" element={<ArticleUpdate />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
