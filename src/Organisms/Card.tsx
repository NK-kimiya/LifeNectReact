import { div } from "@tensorflow/tfjs";
import React, { useState } from "react";

type CardData = {
  // ← 1枚のカードデータの型
  imgSrc: string;
  title: string;
  text: string;
  buttonText: string;
  buttonHref: string;
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
      <div className="row">
        {currentItems.map((card, i) => (
          <div className="col-3 mb-3" key={i}>
            <div className="card">
              <img
                src={card.imgSrc}
                className="card-img-top"
                alt={card.title}
              />
              <div className="card-body">
                <h5 className="card-title">{card.title}</h5>
                <p className="card-text">{card.text}</p>
                <a href={card.buttonHref} className="btn btn-primary">
                  {card.buttonText}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      <nav aria-label="..." className="d-flex justify-content-center">
        <ul className="pagination">
          {/* 前へ */}
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} // ← ページ番号を1減らす
            >
              Previous
            </button>
          </li>
          {/* ページ番号 */}

          {[...Array(totalPages)].map((_, i) => (
            <li
              key={i}
              className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            </li>
          ))}
          {/* 次へ */}
          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} // ← ページ番号を1増やす
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default CardMolecule;
