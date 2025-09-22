import { useEffect } from "react";
import ScrollSpy from "bootstrap/js/dist/scrollspy";
import "../App.css";
import styled from "styled-components";

const ScrollSpyLink = styled.a`
  padding: 0.25rem;
  border-radius: 0.375rem;
  display: block;
  text-decoration: none;
  color: inherit;

  &.active {
    background-color: #198754; /* Bootstrapのbg-primary相当 */
    color: white;
  }
`;
const Contents: React.FC = () => {
  useEffect(() => {
    const spyEl = document.querySelector(
      '[data-bs-spy="scroll"]'
    ) as HTMLElement | null;
    if (spyEl) {
      const scrollSpy = (ScrollSpy as any).getOrCreateInstance(spyEl);
      scrollSpy.refresh();
    }
  }, []);
  return (
    <div className="contents-wrap">
      <div
        id="simple-list-example"
        className="d-flex flex-column gap-2 simple-list-example-scrollspy text-start"
      >
        {/* hrefにh3タグの番号をIDに指定
                コンテンツをh3のタイトルにする */}
        <ScrollSpyLink href="#simple-list-item-1">
          自分の「得意」と「苦手」を正直に見つめる
        </ScrollSpyLink>
        <ScrollSpyLink href="#simple-list-item-2">
          2. オープンかクローズか、決断のとき
        </ScrollSpyLink>
        <ScrollSpyLink href="#simple-list-item-3">
          就労移行支援事業所の活用
        </ScrollSpyLink>
        <ScrollSpyLink href="#simple-list-item-4">
          就労移行支援事業所とは？
        </ScrollSpyLink>
        <ScrollSpyLink href="#simple-list-item-5">同じ境遇の方へ</ScrollSpyLink>
      </div>
    </div>
  );
};

export default Contents;
