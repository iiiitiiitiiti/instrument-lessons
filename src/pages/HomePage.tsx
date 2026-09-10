import { Link } from "react-router-dom";
import { INSTRUMENTS } from "../instruments/registry";

export function HomePage() {
  return (
    <main className="home">
      <h1>楽器のはじめかた</h1>
      <p>楽器に触れたことのない人が、独習で弾けるようになるための教材です。</p>
      <ul className="home__instruments">
        {INSTRUMENTS.map((instrument) => (
          <li key={instrument.id}>
            <Link to={`/${instrument.slug}`}>
              {instrument.name} — {instrument.tagline}
            </Link>
          </li>
        ))}
      </ul>
      <h2>これから追加する楽器</h2>
      <ul className="home__upcoming">
        <li>オタマトーン（準備中）</li>
      </ul>
      <p className="home__note">
        進捗はこのブラウザにだけ保存されます。別のブラウザや端末では引き継がれません。
      </p>
    </main>
  );
}
