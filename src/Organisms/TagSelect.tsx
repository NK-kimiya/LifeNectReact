import React from "react";
import styled from "styled-components";
import { useEffect, useState, useMemo, useCallback } from "react";
import { fetchTags } from "../API/Tag.tsx";
import { useTagContext } from "../Context/TagContext.tsx";
import { useError } from "../Context/ErrorContext.tsx";
import { useTagSelection } from "../Context/TagSelectionContext.tsx";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../Context/SearchContext.tsx";
const ScrollBoxContent = styled.div`
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  scroll-behavior: smooth;

  /* Firefox */
  scrollbar-width: none;

  /* IE, Edge (旧) */
  -ms-overflow-style: none;

  /* Chrome, Safari (Webkit系) */
  &::-webkit-scrollbar {
    display: none;
  }
`;

type TagSelectProps = {
  variant?: "scroll" | "static"; // ← 追加: 表示方法を切り替える
};

type Tag = {
  id: number;
  name: string;
};

const TagSelect: React.FC<TagSelectProps> = ({ variant = "scroll" }) => {
  const { tags, setTags } = useTagContext();
  const [loading, setLoading] = useState(true);
  const [showButtons, setShowButtons] = useState(false);
  const { setError } = useError();
  const { selectedTagIds, toggleTag, selectOnlyTag } = useTagSelection();
  const selectedSet = useMemo(() => new Set(selectedTagIds), [selectedTagIds]); //selectedTagIds が変わらない限り 同じ Set 参照を再利用
  const navigate = useNavigate();
  const { setKeyword } = useSearch();

  const handleSingleAndGo = useCallback(
    (id: number, name: string) => {
      setKeyword("");
      selectOnlyTag(id); // ★単一選択に置換
      navigate(`/article-search?tag=${encodeURIComponent(name)}`);
    },
    [selectOnlyTag, navigate]
  );

  // ★ static: 複数選択トグル（遷移不要ならそのまま）
  const handleToggle = useCallback(
    (id: number) => {
      toggleTag(id);
    },
    [toggleTag]
  );

  const handleClick = (tag: string) => {
    navigate(`/article-search?tag=${encodeURIComponent(tag)}`);
  };

  useEffect(() => {
    const loadTags = async () => {
      try {
        const data = await fetchTags(setError);
        setTags(data);
      } catch (err) {
        console.error("タグの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    loadTags();
  }, []);

  useEffect(() => {
    const el = document.getElementById("scroll-box-content");
    if (!el) return;

    const checkOverflow = () => {
      setShowButtons(el.scrollWidth > el.clientWidth);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [tags]); // ← tags が変わったら再チェック

  if (loading) return <p>読み込み中...</p>;

  return (
    <div className="container text-start p-4 ">
      {variant === "scroll" ? (
        // ===== スクロール表示 =====
        <div className="row justify-content-md-center">
          <div className="col-2 text-end">
            {showButtons && (
              <button
                className="btn btn-light w-5 text-end"
                onClick={() =>
                  document
                    .getElementById("scroll-box-content")
                    ?.scrollBy({ left: -150, behavior: "smooth" })
                }
              >
                ◀
              </button>
            )}
          </div>
          <div className="col-8">
            <ScrollBoxContent id="scroll-box-content" style={{ flex: 1 }}>
              {tags?.map((tag) => (
                <span
                  key={tag.id}
                  onClick={() => handleSingleAndGo(tag.id, tag.name)} // ★修正: ここで使う
                  className={`badge me-2 p-2 ${
                    selectedSet.has(tag.id)
                      ? "bg-secondary text-white"
                      : "bg-success text-white"
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  {tag.name}
                </span>
              ))}
            </ScrollBoxContent>
          </div>
          <div className="col-2">
            {showButtons && (
              <button
                className="btn btn-light w-5 text-start"
                onClick={() =>
                  document
                    .getElementById("scroll-box-content")
                    ?.scrollBy({ left: 150, behavior: "smooth" })
                }
              >
                ▶
              </button>
            )}
          </div>
        </div>
      ) : (
        // ===== 固定表示 =====
        <div className="container">
          {tags?.map((tag) => (
            <span
              key={tag.id}
              onClick={() => handleToggle(tag.id)} // ★修正: ここで使う
              className={`badge me-2 p-2 ${
                selectedSet.has(tag.id)
                  ? "bg-secondary text-white"
                  : "bg-success text-white"
              }`}
              style={{ cursor: "pointer" }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagSelect;
