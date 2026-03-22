import React, { memo,} from "react";

import { IdTitle } from "../API/RagChat.tsx";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import Accordion from 'react-bootstrap/Accordion';

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  id_title_list: IdTitle[];

  mode?: "normal" | "safety_only";
  primary_support?: {
    title: string;
    name: string;
    url: string;
  } | null;
  other_supports?: {
    name: string;
    url: string;
  }[];
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  id_title_list,
  mode,
  primary_support,
  other_supports,
}) => {
  let parsed;

try {
  parsed =
    typeof content === "string"
      ? JSON.parse(content)
      : content;
} catch {
  parsed = {
    answer: content // ← ここが重要
  };
}

  const isUser = role === "user";
  return (
    <div
      className="d-flex flex-column container"
      style={{
        justifyContent: isUser ? "flex-end" : "",
      }}
    >
      <div
        className={
          isUser
            ? "d-flex bg-light justify-content-center justify-content-md-start  mb-2 mt-2 p-4 col-10 col-md-7 col-lg-6"
            : "d-flex justify-content-center mb-2 mt-2"
        }
      >
        <div>
          <ReactMarkdown
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
          >
            {parsed.answer}
          </ReactMarkdown>
          {id_title_list && id_title_list.length > 0 && (
            // style={{
            //   display: isUser ? "none" : "block",
            // }}
            <div className="pb-5">
              <h6>もっとも関連度の高い記事</h6>
              {id_title_list?.map((item) => (
                <div >
                  
                  {/* TODO:記事をリンクで遷移ではなく、クリック遷移でモーダル表示にする */}
                  {item.content_type === "qa" ? (
                    <div>
                    <Accordion>
                      <Accordion.Item eventKey="0">
                        <Accordion.Header>Q＆A{item.title}</Accordion.Header>
                        <Accordion.Body>
                          {item.text}
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
</div>
                  ) : (
                    <Link key={item.id} className="" to={`/articles/${item.id}`} >
                    {item.title}
                  </Link>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-3">
            <a href={primary_support?.url} target="__blank">
              {primary_support?.name}
            </a>
          </div>

          <div className="mt-2">
            {other_supports?.map((item, i) => (
              <div key={i}>
                <a href={item.url} target="__blank">
                  {item.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ChatMessage);
