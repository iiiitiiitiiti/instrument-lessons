import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="not-found">
      <h1>ページが見つかりません</h1>
      <p>
        <Link to="/">トップへ戻る</Link>
      </p>
    </main>
  );
}
