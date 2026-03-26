import { useEffect } from "react";
import ScrollSpy from "bootstrap/js/dist/scrollspy";
import "../App.css";
import styled from "styled-components";
interface ContentsProps {
  headings: { id: string; title: string; level: number }[];
}
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
      </>
    );
  }
  return (
    <div className="contents-wrap">
      <div
  data-bs-target="#simple-list-example"
  data-bs-offset="0"
  tabIndex={0}
>
        {/* hrefにh3タグの番号をIDに指定
                コンテンツをh3のタイトルにする */}
        
        <div className="bg-light p-3">
          <h5 className="border-bottom pb-2 mb-3">目次</h5>
               {headings?.map((heading) => (
          <p><a key={heading.id} href={`#${heading.id}`} className={`heading-link level-${heading.level}`}>
            {heading.title}
          </a>
          </p>
        ))}
        </div>
   
      </div>
    </div>
  );
};

export default Contents;
