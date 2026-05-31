import type { LegalDocument, LegalBlock, LegalBullet } from "../content/legal";
import {
  RichBullet,
  RichNote,
  RichParagraph,
  RichText,
} from "./RichText";
import "./LegalContent.css";

type Props = {
  document: LegalDocument;
};

function renderBulletItem(item: LegalBullet) {
  if (item.label) {
    return (
      <>
        <strong>{item.label}</strong>
        <RichText segments={item.segments} />
      </>
    );
  }
  return <RichText segments={item.segments} />;
}

function renderBlock(block: LegalBlock, key: string) {
  switch (block.kind) {
    case "paragraph":
      return (
        <RichParagraph key={key}>
          <RichText segments={block.segments} />
        </RichParagraph>
      );
    case "bullets":
      return block.items.map((item, index) => (
        <RichBullet key={`${key}-b-${index}`}>
          {renderBulletItem(item)}
        </RichBullet>
      ));
    case "note":
      return (
        <RichNote key={key}>
          <strong>{block.label}</strong>
          <RichText segments={block.segments} />
        </RichNote>
      );
  }
}

export default function LegalContent({ document: doc }: Props) {
  return (
    <article className="legal-content">
      <h1 className="legal-content__title">{doc.cardTitle}</h1>
      {doc.updated && (
        <p className="legal-content__meta">
          Posljednja izmjena: {doc.updated}
        </p>
      )}

      {doc.intro && (
        <RichParagraph>
          <RichText segments={doc.intro} />
        </RichParagraph>
      )}

      {doc.introParagraphs?.map((segments, index) => (
        <RichParagraph key={`intro-${index}`}>
          <RichText segments={segments} />
        </RichParagraph>
      ))}

      {doc.sections.map((section) => (
        <section key={section.title} className="legal-content__section">
          <h2 className="legal-content__section-title">{section.title}</h2>
          {section.blocks.map((block, index) =>
            renderBlock(block, `${section.title}-${index}`),
          )}
        </section>
      ))}
    </article>
  );
}
