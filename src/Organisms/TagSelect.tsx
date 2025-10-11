import React from "react";
import styled from "styled-components";
import { useEffect, useState } from "react";
import { fetchTags } from "../API/Tag.tsx";
import { useTagContext } from "../Context/TagContext.tsx";
import { useError } from "../Context/ErrorContext.tsx";
import { useTagSelection } from "../Context/TagSelectionContext.tsx";
import { useNavigate } from "react-router-dom";
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
  const { selectedTagIds, toggleTag } = useTagSelection();
  const navigate = useNavigate();

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
                  className="badge text-bg-success m-2 py-2 px-5 rounded-pill"
                  onClick={() => handleClick(tag.name)}
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
              onClick={() => toggleTag(tag.id)}
              className={`badge m-2 py-2 px-5 rounded-pill ${
                selectedTagIds.includes(tag.id)
                  ? "bg-secondary text-white" // ★ 選択時の背景色（青）
                  : "bg-success text-white" // ★ 未選択時の背景色（グレー）
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
