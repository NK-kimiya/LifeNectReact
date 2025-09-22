import React from "react";
import styled from "styled-components";
import { useEffect, useState } from "react";

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

const TagSelect: React.FC<TagSelectProps> = ({ variant = "scroll" }) => {
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const el = document.getElementById("scroll-box-content");
    if (!el) return;

    const checkOverflow = () => {
      setShowButtons(el.scrollWidth > el.clientWidth);
    };

    // 初期判定
    checkOverflow();

    // リサイズ時にも再判定
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

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
            <ScrollBoxContent id="scroll-box-content">
              <span className="badge text-bg-success m-2 py-2 px-5 rounded-pill">
                うつ病
              </span>
              <span className="badge text-bg-light m-2 py-2 px-5 rounded-pill">
                小児がん
              </span>
              <span className="badge text-bg-light m-2 py-2 px-5 rounded-pill">
                就職
              </span>
              <span className="badge text-bg-light m-2 py-2 px-5 rounded-pill">
                就職
              </span>
              <span className="badge text-bg-light m-2 py-2 px-5 rounded-pill">
                就職
              </span>
              <span className="badge text-bg-light m-2 py-2 px-5 rounded-pill">
                就職
              </span>
              <span className="badge text-bg-light m-2 py-2 px-5 rounded-pill">
                就職
              </span>
              <span className="badge text-bg-light m-2 py-2 px-5 rounded-pill">
                就職
              </span>
              {/* ...他のタグ */}
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
          <span className="badge text-bg-success m-2 py-2 px-5 rounded-pill">
            うつ病
          </span>
          <span className="badge text-bg-success m-2 py-2 px-5 rounded-pill">
            小児がん
          </span>
          <span className="badge text-bg-success m-2 py-2 px-5 rounded-pill">
            就職
          </span>
          {/* ...他のタグ */}
        </div>
      )}
    </div>
  );
};

export default TagSelect;
