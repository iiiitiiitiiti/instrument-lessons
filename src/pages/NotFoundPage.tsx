import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="not-found">
      <p className="eyebrow">404</p>
      <h1 className="hero__title">ページが見つかりません</h1>
      <p className="hero__lede">
        アドレスが変わったか、まだ用意できていないページです。
      </p>
      <Link className="btn" to="/">
        トップへ戻る
      </Link>
    </main>
  );
}
