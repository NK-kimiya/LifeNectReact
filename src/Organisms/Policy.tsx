import React from "react";

const Policy = () => {
  return (
    <div className="text-start">
      <h3 className="border-bottom p-3">1. 取得する情報について</h3>
      <p>本サービスでは、以下の情報を取得することがあります。</p>
      <ul>
        <li>Cookie（クッキー）による利用状況の情報</li>
        <li>利用者が任意で入力し、保存を許可した内容</li>
        <p>※氏名やメールアドレスなどの個人情報は取得していません。</p>
      </ul>
      <h3 className="border-bottom p-3">2. 情報の利用目的</h3>
      <p>取得した情報は、以下の目的で使用します</p>
      <ul>
        <li>サービスの改善・品質向上</li>
        <li>モーダル表示など、サービスの動作制御</li>
        <li>利用体験の向上</li>
      </ul>
      <h3 className="border-bottom p-3">3. 情報の保存について</h3>
      <p>
      利用者が明示的に許可した場合に限り、入力内容をデータベースに保存することがあります。

      入力内容は、サービス改善の目的で保存される場合がありますが、個人情報が含まれていた場合でも、それを特定・利用することはありません。
      </p>
      <h3 className="border-bottom p-3">4. 第三者提供について</h3>
      <p>取得した情報を第三者に提供することはありません。

ただし、法令に基づく場合を除きます。</p>
<h3 className="border-bottom p-3">5. Cookieについて</h3>
<p>本サービスでは、利用状況の把握や表示制御のためにCookieを使用しています。</p>

<p>Cookieは、ブラウザの設定により無効にすることも可能です。</p>
    
    <h3 className="border-bottom p-3">6. 安全管理について</h3>
    <p>取得した情報は、適切な方法で管理し、不正アクセスや漏えいの防止に努めます。</p>
    <h3 className="border-bottom p-3">7. ポリシーの変更について</h3>
    <p>本ポリシーは、必要に応じて変更されることがあります。</p>
    </div>
  );
};

export default Policy;
