import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { INSTRUMENTS } from "../instruments/registry";

/** これから追加する楽器。カードの寸法を揃えるため、公開済みと同じ形で並べる。 */
const UPCOMING = [{ name: "オタマトーン", note: "フレットのない楽器。音程を耳と指で探す" }];

export function HomePage() {
  return (
    <main className="home">
      <header className="hero">
        <p className="eyebrow">Self-study</p>
        <h1 className="hero__title">楽器のはじめかた</h1>
        <p className="hero__lede">
          楽器に触れたことのない人が、独習で弾けるようになるための教材です。1日15分、読んで、その場で音を出しながら進みます。
        </p>
      </header>

      <section className="section">
        <h2 className="section__title">はじめられる楽器</h2>
        <ul className="cardlist">
          {INSTRUMENTS.map((instrument) => (
            <li key={instrument.id}>
              <Link
                className="instrument-card"
                to={`/${instrument.slug}`}
                style={{ "--instrument-accent": instrument.accent } as CSSProperties}
              >
                <span className="instrument-card__bar" aria-hidden="true" />
                <span className="instrument-card__body">
                  <span className="instrument-card__name">{instrument.name}</span>
                  <span className="instrument-card__tagline">{instrument.tagline}</span>
                  <span className="instrument-card__meta">
                    全{instrument.curriculum.lessons.length}レッスン
                  </span>
                </span>
                <span className="instrument-card__go" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
          {UPCOMING.map((item) => (
            <li key={item.name}>
              <div className="instrument-card instrument-card--upcoming">
                <span className="instrument-card__bar" aria-hidden="true" />
                <span className="instrument-card__body">
                  <span className="instrument-card__name">
                    {item.name}
                    <span className="badge">準備中</span>
                  </span>
                  <span className="instrument-card__tagline">{item.note}</span>
                  <span className="instrument-card__meta">カリキュラムを準備しています</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <p className="note">
        進捗はこのブラウザにだけ保存されます。別のブラウザや端末では引き継がれません。
      </p>
    </main>
  );
}
