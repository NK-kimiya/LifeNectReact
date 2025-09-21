import React from "react";

const Article = () => {
  return (
    <>
      {/* h2タグのタイトルにする */}
      {/* h3タグのIDはheading1,heading2...とする */}
      <h2 className="border-bottom border-success bg-success text-white p-3">
        病気と就職活動について
      </h2>
      <div
        data-bs-spy="scroll"
        data-bs-target="#simple-list-example"
        data-bs-offset="0"
        tabIndex={0}
        className="scrollspy-example  position-relative"
        style={{ minHeight: "90vh", scrollBehavior: "smooth" }} // ← これを追加
      >
        <div className="text-align-left">
          <p className="text-start">
            こんにちは。今回の記事では、病気や障害と共に生きながら就職活動をした私の経験をお話ししたいと思います。
          </p>
          <ul className="text-start">
            <li>「病気の症状がまた出てしまったらどうしよう」</li>
            <li>「通院を理解してもらえるだろうか」</li>
            <li>「周りの人に迷惑をかけてしまうのではないか」</li>
          </ul>
          <p className="text-start">
            私も同じように、不安でいっぱいでした。しかし、今は自分らしく働くことができています。この記事が、同じように悩む誰かの助けになれば嬉しいです。
          </p>
          <h3
            className="text-start bg-light rounded p-3 text-success "
            id="simple-list-item-1"
          >
            自分の「得意」と「苦手」を正直に見つめる
          </h3>
          <div className="scrollspy-section">
            <p className="text-start">
              就職活動を始める前に、まずは自分自身と向き合う時間を設けました。体調や症状、そしてそれに伴う得意なこと、苦手なことをリストアップしたのです。
              例えば、私の場合は「朝に強い」「集中力がある」という得意な点があった一方で、「満員電車が苦手」「突発的な予定変更への対応が難しい」という苦手な点がありました。
              この自己分析をすることで、自分に合った仕事のスタイルや環境が見えてきました。そして、無理をして苦手なことに挑戦するのではなく、得意なことを活かせるような仕事を探そうと決めました。
            </p>
          </div>

          <h3
            className="text-start bg-light rounded p-3 text-success"
            id="simple-list-item-2"
          >
            2. オープンかクローズか、決断のとき
          </h3>
          <div className="scrollspy-section">
            <p className="text-start">
              病気や障害を企業に伝えるかどうかは、就職活動における大きな決断です。
            </p>
            <ul className="text-start">
              <li>
                オープン就労:
                病気や障害を企業に伝えて就職するスタイルです。理解や配慮を得やすくなります。
              </li>
              <li>クローズ就労: 病気や障害を伏せて就職するスタイルです。</li>
            </ul>
            <p className="text-start">
              私は自分の体調を考慮し、オープン就労を選択しました。オープンにすることで、通院の理解や業務内容への配慮をお願いできると考えたからです。
              面接では、正直に自分の病気について話しました。どのように向き合っているか、仕事ではどのような配慮が必要か、そして自分の強みや貢献できることを具体的に説明しました。このとき、ただ「配慮してほしい」と伝えるのではなく、「病気を抱えながらも、どうやって会社に貢献できるか」を明確にすることが重要だと感じました。
            </p>
          </div>

          <h3
            className="text-start bg-light rounded p-3 text-success"
            id="simple-list-item-3"
          >
            就労移行支援事業所の活用
          </h3>
          <div className="scrollspy-section">
            <p className="text-start">
              私は就職活動中に就労移行支援事業所のサポートも受けました。
            </p>
          </div>

          <h3
            className="text-start bg-light rounded p-3 text-success"
            id="simple-list-item-4"
          >
            就労移行支援事業所とは？
          </h3>
          <div className="scrollspy-section">
            <p className="text-start">
              病気や障害のある方が、一般企業への就職を目指すためのサポート施設です。職業訓練や就職活動のサポート、就職後の定着支援など、幅広いサポートを受けることができます。
              ここでは、履歴書の添削や面接練習はもちろん、体調管理の方法やストレスとの向き合い方についても相談できました。専門のスタッフに支えてもらいながら、一つずつ不安を解消していけたことが、私の大きな心の支えとなりました。
            </p>
          </div>
          <h3
            className="text-start bg-light rounded p-3 text-success "
            id="simple-list-item-5"
          >
            同じ境遇の方へ
          </h3>
          <div className="scrollspy-section">
            <p className="text-start">
              最後に、同じように悩んでいる方へ、私から伝えたいアドバイスを3つご紹介します。
            </p>
            <ul className="text-start">
              <li>
                不安を一人で抱え込まないこと:
                家族や友人、支援機関など、頼れる人を見つけましょう。誰かに話すだけでも、気持ちが楽になります。
              </li>
              <li>
                完璧を目指さないこと:
                自分のできる範囲で、少しずつ進めていきましょう。体調を崩してしまっては元も子もありません。
              </li>
              <li>
                あなたの価値は病気や障害で決まらない:
                あなたには、あなただけの強みや魅力が必ずあります。それを信じて、前向きに進んでください。
              </li>
            </ul>
            <p className="text-start">
              就職活動は、山あり谷ありです。うまくいかない日があっても、決して自分を責めないでください。あなたのペースで、あなたの未来を切り開いていってほしいと心から願っています。
              この体験談が、誰かの希望となれば幸いです。
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Article;
