import React from "react";
import CardMolecule from "../Organisms/Card.tsx";
import TagSelect from "../Organisms/TagSelect.tsx";
import NavBar from "../Organisms/NavBar.tsx";
import Footer from "../Organisms/Footer.tsx";

const TopTemplate: React.FC = () => {
  type CardData = {
    imgSrc: string;
    title: string;
    text: string;
    buttonText: string;
    buttonHref: string;
  };

  const cards: CardData[] = [
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル1",
      text: "これはカード1の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/1",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル2",
      text: "これはカード2の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/2",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル1",
      text: "これはカード1の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/1",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル2",
      text: "これはカード2の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/2",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル1",
      text: "これはカード1の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/1",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル2",
      text: "これはカード2の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/2",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル1",
      text: "これはカード1の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/1",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル2",
      text: "これはカード2の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/2",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル1",
      text: "これはカード1の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/1",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル2",
      text: "これはカード2の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/2",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル1",
      text: "これはカード1の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/1",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル2",
      text: "これはカード2の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/2",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル1",
      text: "これはカード1の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/1",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル2",
      text: "これはカード2の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/2",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル1",
      text: "これはカード1の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/1",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル2",
      text: "これはカード2の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/2",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル1",
      text: "これはカード1の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/1",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル2",
      text: "これはカード2の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/2",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル1",
      text: "これはカード1の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/1",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル2",
      text: "これはカード2の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/2",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル1",
      text: "これはカード1の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/1",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル2",
      text: "これはカード2の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/2",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル1",
      text: "これはカード1の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/1",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル2",
      text: "これはカード2の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/2",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル1",
      text: "これはカード1の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/1",
    },
    {
      imgSrc: "https://via.placeholder.com/150",
      title: "サンプルタイトル2",
      text: "これはカード2の説明文です。",
      buttonText: "詳細を見る",
      buttonHref: "https://example.com/2",
    },
  ];

  return (
    <div className="d-flex flex-column min-vh-100">
      <NavBar />
      <div className="container flex-fill">
        <TagSelect variant="scroll" />
        <CardMolecule cards={cards} itemsPerPage={6} />
      </div>
      <Footer />
    </div>
  );
};

export default TopTemplate;
