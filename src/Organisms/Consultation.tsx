const Consultation: React.FC = () => {

  return (
    <div style={{background:"#f0f8ff"}} className="p-3 rounded-4">
    <h3>相談できる場所</h3>
    <p>
        もしつらい気持ちを抱えているときは、
専門の相談員に話を聞いてもらうこともできます。

厚生労働省の相談窓口では、
匿名での相談も可能です。
    </p>
    <p>こころの健康相談統一ダイヤル</p>
              <p>時間: 都道府県によって異なります</p>
              <div className="row d-flex">
                <div className="col-6 d-flex">
                    <a href="tel:09012345678" className="btn w-100 rounded  bg-primary p-3 text-white">📞0570-064-556</a>
                </div>
                <div className="col-6 d-flex">
                     <a href="https://www.mhlw.go.jp/mamorouyokokoro/" target="_blank" className="btn w-100 rounded bg-secondary  p-3 text-white">🌐公式サイト</a>
                </div>
                <p>「まもろうよこころ」の電話番号と公式サイトです。</p>
              </div>
            <h4>媒体別相談窓口</h4>
            <p><a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/jisatsu/soudan_tel.html" target="_blank" >電話相談(引用：厚生労働省)</a></p>
            <p><a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/jisatsu/soudan_sns.html" target="_blank" >SNS相談(引用：厚生労働省)</a></p>
            <p><a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/jisatsu/soudan_sonota.html" target="_blank" >その他の相談(引用：厚生労働省)</a></p>
    </div>
  );
};

export default Consultation;
