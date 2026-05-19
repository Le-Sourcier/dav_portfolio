type PullQuoteProps = {
  text: string;
  attribution?: string;
};

export function PullQuote({ text, attribution }: PullQuoteProps) {
  return (
    <figure className="article-pullquote">
      <blockquote>
        <p>{text}</p>
      </blockquote>
      {attribution ? <figcaption>— {attribution}</figcaption> : null}
    </figure>
  );
}
