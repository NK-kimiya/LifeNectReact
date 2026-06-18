"use client";
import { useState } from "react";

export default function Home() {
  const [isLongTextArea, setIsLongTextArea] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const handleChange = (e: React.FormEvent<HTMLDivElement>) => {
    const el = e.currentTarget;

    setIsLongTextArea(el.scrollHeight > 50);
  };
  return (
    <div className="md:flex flex-col min-h-screen">
      <div className="md:grid grid-cols-1 md:grid-cols-10">
        {/* ナビゲーション */}
        <div className={`${isNavOpen ? "hidden" : "p-3"} md:hidden`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-[40px]"
            onClick={() => setIsNavOpen(true)}
          >
            <path
              fillRule="evenodd"
              d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div
          className={`
    w-[230px] md:w-full
    z-10 fixed left-0 top-0
    h-[100vh] overflow-y-auto bg-[#f5f5f5]
    md:col-span-2 xl:col-span-1
    border-r border-gray-300 px-3
    ${isNavOpen ? "block" : "hidden"}
    md:block
    md:sticky md:top-0 md:left-auto

  `}
        >
          <h1 className="text-center text-2xl pt-[25px]">LifeNect</h1>
          <div className="">
            <button className="flex justify-center m-auto pt-[50px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
                />
              </svg>
              ログアウト
            </button>
          </div>
          <div className="my-[50px]">
            <div>
              <p className="flex items-center gap-2 p-4 cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                新しいチャット
              </p>
            </div>
            <div>
              <p className="flex items-center gap-2 p-4 cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
                履歴の管理
              </p>
            </div>
            <div>
              <p className="flex items-center gap-2 p-4 cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                  />
                </svg>
                共有
              </p>
            </div>
          </div>

          <div className="">
            <div className="p-2 cursor-pointer hover:bg-gray-200 bg-[#ff4500] rounded-lg text-white">
              うつ病についての就職の.....
            </div>
            <div className="p-2 cursor-pointer hover:bg-gray-200">
              うつ病についての就職の.....
            </div>
            <div className="p-2 cursor-pointer hover:bg-gray-200">
              うつ病についての就職の.....
            </div>
            <div className="p-2 cursor-pointer hover:bg-gray-200">
              うつ病についての就職の.....
            </div>
            <div className="p-2 cursor-pointer hover:bg-gray-200">
              うつ病についての就職の.....
            </div>
            <div className="p-2 cursor-pointer hover:bg-gray-200">
              うつ病についての就職の.....
            </div>
            <div className="p-2 cursor-pointer hover:bg-gray-200">
              うつ病についての就職の.....
            </div>
            <div className="p-2 cursor-pointer hover:bg-gray-200">
              うつ病についての就職の.....
            </div>
          </div>
        </div>
        <div
          className="min-h-screen md:col-span-8 xl:col-span-9"
          onClick={() => setIsNavOpen(false)}
        >
          <div className="w-[100%] relative">
            <div className="w-8/10 mx-auto grid grid-cols-1 justify-items-center postion-relative">
              {/* チャットの内容 */}
              <div className="py-[40px] z-0">
                {/* チャットの一つのセクション */}
                <div className=" grid grid-cols-1 justify-items-end">
                  <div className="bg-[#e9967a] rounded-lg p-2 max-w-[80%] text-white">
                    <p>
                      うつ病の就職の仕方について教えて下さい。
                      まずは、就労移行に通所した方が良いのか、一般枠で就職した方が良いのか分かりません。
                    </p>
                  </div>
                </div>

                <div className="pt-[10px] max-w-[80%] mx-auto mb-[80px]">
                  <p>
                    うつ病の就職では、まずは体調を整え.........
                    ...............................................
                    ...........................................
                    .................................................
                  </p>
                </div>
              </div>
            </div>
            <div className="w-[100%] sticky bottom-0 ">
              <div
                className={`bg-white border w-[300px] md:w-[500px] z-20 mx-auto border-gray-300  w-fit p-2  ${isLongTextArea ? "rounded-md" : "flex justify-center rounded-full"}`}
              >
                {/* チャットの入力フォーム */}
                <div className="w-[280px] md:w-[480px]  min-h-[30px] pl-4 ">
                  <div
                    contentEditable
                    role="textbox"
                    onInput={handleChange}
                    aria-multiline="true"
                    data-placeholder="質問を入力してください..."
                    className="min-h-[30px] outline-none"
                  ></div>
                </div>
                <div
                  className={`cursor-pointer ${isLongTextArea ? "grid w-[100%] justify-items-end" : "w-[30px]"}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-[30px] text-white bg-[#ff4500] rounded-full flex items-center justify-center p-1"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.47 2.47a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06l-6.22-6.22V21a.75.75 0 0 1-1.5 0V4.81l-6.22 6.22a.75.75 0 1 1-1.06-1.06l7.5-7.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
