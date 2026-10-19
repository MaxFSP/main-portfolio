import { manuals } from '../manual';

export default function ManualPage({ name, run }: { name?: string; run: (command: string) => void }) {
  if (!name) return <div className="manual-index">
    <h2>Manual pages</h2>
    <p className="output-comment">Read a page with man &lt;command&gt;, or select one below.</p>
    <div className="manual-links">{Object.keys(manuals).map(command => <button className="file-link" key={command} onClick={() => run('man ' + command)}>{command}</button>)}</div>
  </div>;

  const page = Object.hasOwn(manuals, name) ? manuals[name] : undefined;
  if (!page) return <p>No manual entry for {name}. Run man to list available pages.</p>;

  return <article className="manual-page">
    <div className="manual-heading"><h2>{name}(1)</h2><span>Portfolio manual</span></div>
    <h3>Usage</h3><p>{page.synopsis}</p>
    <h3>Description</h3><p>{page.description}</p>
    <h3>Examples</h3><div className="manual-examples">{page.examples.map(example => <button className="file-link" key={example} onClick={() => run(example)}>{example}</button>)}</div>
    {page.notes && <><h3>Notes</h3><p className="output-comment">{page.notes}</p></>}
  </article>;
}
