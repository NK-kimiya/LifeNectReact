import React from "react";
import styled from "styled-components";
const ScrollBox = styled.div`
  min-height: 100vh;
  overflow-y: scroll;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari */
  }
`;

// サイドバーに表示する要素の型
type SidebarItem = {
  id: number;
  imageUrl: string;
  urlText: string;
};

// サイドバーのデータ（仮）
const sidebarItems: SidebarItem[] = [
  {
    id: 1,
    imageUrl:
      "https://qureo.jp/class/wp/content/uploads/NO25_%E7%94%BB%E5%83%8F%E2%91%A0-1.jpeg",
    urlText: "https://test1.com",
  },
  {
    id: 2,
    imageUrl:
      "https://qureo.jp/class/wp/content/uploads/NO25_%E7%94%BB%E5%83%8F%E2%91%A0-1.jpeg",
    urlText: "https://test2.com",
  },
  {
    id: 3,
    imageUrl:
      "https://qureo.jp/class/wp/content/uploads/NO25_%E7%94%BB%E5%83%8F%E2%91%A0-1.jpeg",
    urlText: "https://test3.com",
  },
  {
    id: 4,
    imageUrl:
      "https://qureo.jp/class/wp/content/uploads/NO25_%E7%94%BB%E5%83%8F%E2%91%A0-1.jpeg",
    urlText: "https://test3.com",
  },
];
const UploadImgDisplay = () => {
  return (
    <>
      <ScrollBox>
        {sidebarItems.map((item) => (
          <div className="" key={item.id}>
            <div className="card mb-3">
              <img src={item.imageUrl} className="card-img-top" alt="" />
              <div className="card-body">
                <input
                  type="text"
                  className="form-control"
                  value={item.urlText}
                  readOnly
                />
              </div>
            </div>
          </div>
        ))}
      </ScrollBox>
    </>
  );
};

export default UploadImgDisplay;
