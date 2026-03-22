
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
export type CardData = {
  // ← 1枚のカードデータの型
  image: string;
  title: string;
  text: string;
  buttonText: string;
  buttonHref: string;
  date: string;

  content_type: string;
};

type CardMoleculeProps = {
  cards: CardData[];
  itemsPerPage?: number;
};

// const cardCount: number = 9;
// const cards: undefined[] = Array.from<undefined>({ length: cardCount });

const CardMolecule: React.FC<CardMoleculeProps> = ({
  cards,
  itemsPerPage = 6,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(cards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = cards.slice(startIndex, startIndex + itemsPerPage);
  return (
    <div className="container">
      <div className="">
        {currentItems?.map((card, i) => {
  return (
    <div className="" key={i}>
      <div className="">
        {card.image && (
          <img src={card.image} className="card-img-top" alt={card.title} />
        )}

        {card.content_type === "qa" ? (
          <div className="p-3">
                <Accordion>
  <Accordion.Item eventKey="0">
    <Accordion.Header>Q＆A{card.title}</Accordion.Header>
    <Accordion.Body>
      {card.text}
    </Accordion.Body>
  </Accordion.Item>
</Accordion>
          </div>
        ) : (
          <div className="p-3 ">
                          <Link className="fs-6" to={card.buttonHref}>
                  {card.title}
                </Link>
                <p>{card.text}</p>
             {card.image && (
          <img src={card.image} className="card-img-top" alt={card.title} />
        )}
        </div>

        )}
      </div>
    </div>
  );
})}
      </div>

      <nav aria-label="..." className="d-flex justify-content-center">
        <div className="">
          <ul className="pagination container">
            {/* 前へ */}
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link "
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} // ← ページ番号を1減らす
              >
                Previous
              </button>
            </li>
            {/* ページ番号 */}

            {(() => {
              const pages = []; // ← 表示するページ番号を一時的に格納する配列

              for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages) {
                  // ← 1ページ目と最終ページは常に表示
                  pages.push(i);
                } else if (i >= currentPage - 1 && i <= currentPage + 1) {
                  // ← 現在ページの前後1ページを表示
                  pages.push(i);
                } else if (i === currentPage - 2 || i === currentPage + 2) {
                  // ← 省略記号「…」を入れる位置
                  pages.push("...");
                }
                // ← それ以外のページ番号は表示しない
              }

              // ★ 「…」が連続する場合は1つにまとめる
              const filtered = pages.filter((item, idx, arr) => {
                return !(item === "..." && arr[idx - 1] === "...");
              });

              // ★ 実際にページ番号（または「…」）を描画する
              return filtered?.map((p, i) =>
                p === "..." ? (
                  // 「…」はクリックできない → disabled
                  <li key={i} className="page-item disabled bg-light">
                    <span className="page-link">…</span>
                  </li>
                ) : (
                  // ページ番号はボタンとして表示
                  <li
                    key={i}
                    className={`page-item  ${
                      currentPage === p ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link bg-light text-dark"
                      onClick={() => setCurrentPage(p as number)}
                    >
                      {p}
                    </button>
                  </li>
                )
              );
            })()}
            {/* 次へ */}
            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link bg-light"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                } // ← ページ番号を1増やす
              >
                Next
              </button>
            </li>
          </ul>
        </div>
      </nav>



    </div>
  );
};

export default CardMolecule;
