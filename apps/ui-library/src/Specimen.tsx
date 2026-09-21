import { ReactNode } from "react";
import { Code2, Plus } from "lucide-react";
export function Specimen({
  number,
  title,
  description,
  children,
  code,
  className = "",
}: {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
  code: string;
  className?: string;
}) {
  return (
    <article className={`specimen ${className}`}>
      <div className="specimen-heading">
        <span>{number}</span>
        <h3>{title}</h3>
      </div>
      <p>{description}</p>
      <div className="specimen-stage">{children}</div>
      <details className="source">
        <summary>
          <Code2 size={14} /> Composition <Plus size={14} />
        </summary>
        <pre>
          <code>{code}</code>
        </pre>
      </details>
    </article>
  );
}
export function SectionTitle({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{index}</span>
        <h2>{title}</h2>
      </div>
      <p>{children}</p>
    </div>
  );
}
