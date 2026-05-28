import type { LegalDocument } from "../content/legal";
import "./LegalContent.css";

type Props = {
  document: LegalDocument;
};

export default function LegalContent({ document: doc }: Props) {
  return (
    <article className="legal-content">
      <header className="legal-content__header">
        <h1 className="legal-content__title">{doc.title}</h1>
        <p className="legal-content__updated">
          Posljednja izmjena: {doc.updated}
        </p>
      </header>

      <p className="legal-content__intro">{doc.intro}</p>

      {doc.sections.map((section) => (
        <section key={section.title} className="legal-content__section">
          <h2>{section.title}</h2>
          {section.paragraphs?.map((p, i) => (
            <p key={`${section.title}-p-${i}`}>{p}</p>
          ))}
          {section.list && (
            <ul>
              {section.list.map((item, i) => (
                <li key={`${section.title}-li-${i}`}>{item}</li>
              ))}
            </ul>
          )}
          {section.note && <p className="legal-content__note">{section.note}</p>}
        </section>
      ))}
    </article>
  );
}
