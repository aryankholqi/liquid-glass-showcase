const COLORS = {
  kw: "#b5abfc",
  str: "#8fc7a8",
  num: "#e0b088",
  tag: "#9184d9",
  prop: "#b2b6ca",
  plain: "#75798c",
};

const TOKEN =
  /("[^"]*")|(\{[^}]*\})|(\b(?:import|from|export|default|function|return)\b)|(<\/?[A-Za-z][\w.]*)|(\b[a-zA-Z][\w]*(?==))/g;

function tokenize(line: string) {
  const out: { text: string; color: string }[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((match = TOKEN.exec(line))) {
    if (match.index > last) out.push({ text: line.slice(last, match.index), color: COLORS.plain });
    const [text, str, num, kw, tag] = match;
    out.push({
      text,
      color: str ? COLORS.str : num ? COLORS.num : kw ? COLORS.kw : tag ? COLORS.tag : COLORS.prop,
    });
    last = match.index + text.length;
  }
  if (last < line.length) out.push({ text: line.slice(last), color: COLORS.plain });
  return out.length ? out : [{ text: " ", color: COLORS.plain }];
}

export function CodeBlock({ code, className = "code-block" }: { code: string; className?: string }) {
  return (
    <pre className={className}>
      {code.split("\n").map((line, i) => (
        <div className="code-line" key={i}>
          <span className="code-num">{i + 1}</span>
          <span className="code-text">
            {tokenize(line).map((token, j) => (
              <span key={j} style={{ color: token.color }}>
                {token.text}
              </span>
            ))}
          </span>
        </div>
      ))}
    </pre>
  );
}
