import { useEffect } from "react";
import ScrollSpy from "bootstrap/js/dist/scrollspy";
import "../App.css";
import styled from "styled-components";
interface ContentsProps {
  headings: { id: string; title: string }[];
}
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
const Contents: React.FC<ContentsProps> = ({ headings }) => {
  useEffect(() => {
    const spyEl = document.querySelector(
      '[data-bs-spy="scroll"]'
    ) as HTMLElement | null;
    if (spyEl) {
      const scrollSpy = (ScrollSpy as any).getOrCreateInstance(spyEl);
      scrollSpy.refresh();
    }
  }, [[headings]]);

  if (!headings || headings.length === 0) {
    return (
      <>
        <p>目次はありません。</p>
      </>
    );
  }
  return (
    <div className="contents-wrap">
      <div
        id="simple-list-example"
        className="d-flex flex-column gap-2 simple-list-example-scrollspy text-start"
      >
        {/* hrefにh3タグの番号をIDに指定
                コンテンツをh3のタイトルにする */}
        {headings?.map((heading) => (
          <ScrollSpyLink key={heading.id} href={`#${heading.id}`}>
            {heading.title}
          </ScrollSpyLink>
        ))}
      </div>
    </div>
  );
};

export default Contents;
