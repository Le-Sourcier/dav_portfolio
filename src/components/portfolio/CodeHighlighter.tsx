import { useState, useCallback } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

interface CodeHighlighterProps {
  code: string;
  language?: string;
  filename?: string;
}

const THEME = {
  bg: '#282c34',
  gutterBg: '#282c34',
  gutterText: '#495162',
  headerBg: '#21252b',
  headerBorder: '#181a1f',
  text: '#abb2bf',
  keyword: '#c678dd',
  string: '#98c379',
  number: '#d19a66',
  comment: '#5c6370',
  function: '#61afef',
  variable: '#e06c75',
  type: '#e5c07b',
  operator: '#56b6c2',
  property: '#e06c75',
  tag: '#e06c75',
  attribute: '#d19a66',
  attrValue: '#98c379',
  punctuation: '#abb2bf',
  regex: '#d19a66',
  decorator: '#e5c07b',
  builtin: '#e5c07b',
};

const LANG_LABELS: Record<string, string> = {
  javascript: 'JavaScript', js: 'JavaScript',
  typescript: 'TypeScript', ts: 'TypeScript',
  tsx: 'TSX', jsx: 'JSX',
  python: 'Python', py: 'Python',
  css: 'CSS', scss: 'SCSS',
  html: 'HTML', json: 'JSON',
  bash: 'Bash', sh: 'Shell',
  sql: 'SQL', rust: 'Rust',
  go: 'Go', java: 'Java',
  cpp: 'C++', c: 'C',
  yaml: 'YAML', yml: 'YAML',
  markdown: 'Markdown', md: 'Markdown',
  text: 'Plain Text', '': 'Code',
};

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function highlightCode(code: string, language: string): string {
  let src = escapeHtml(code);
  const lang = language.toLowerCase();

  src = src.replace(/(\/\*[\s\S]*?\*\/)/g, `<span style="color:${THEME.comment};font-style:italic">$1</span>`);
  if (['python', 'py', 'bash', 'sh', 'yaml', 'yml'].includes(lang)) {
    src = src.replace(/(#[^\n]*)/g, `<span style="color:${THEME.comment};font-style:italic">$1</span>`);
  }
  src = src.replace(/(\/\/[^\n]*)/g, `<span style="color:${THEME.comment};font-style:italic">$1</span>`);

  src = src.replace(/(`[^`]*`)/g, `<span style="color:${THEME.string}">$1</span>`);
  src = src.replace(/("(?:[^"\\]|\\.)*")/g, `<span style="color:${THEME.string}">$1</span>`);
  src = src.replace(/('(?:[^'\\]|\\.)*')/g, `<span style="color:${THEME.string}">$1</span>`);

  src = src.replace(/@(\w+)/g, `<span style="color:${THEME.decorator}">@$1</span>`);
  src = src.replace(/\b(\d+\.?\d*(?:e[+-]?\d+)?)\b/g, `<span style="color:${THEME.number}">$1</span>`);

  const jsKeywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'new', 'delete', 'typeof', 'instanceof', 'in', 'of', 'throw', 'try', 'catch', 'finally', 'import', 'export', 'default', 'from', 'as', 'class', 'extends', 'super', 'this', 'yield', 'async', 'await', 'static', 'get', 'set'];
  const tsKeywords = [...jsKeywords, 'interface', 'type', 'enum', 'namespace', 'declare', 'implements', 'abstract', 'readonly', 'keyof', 'infer', 'is', 'asserts'];
  const pyKeywords = ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'return', 'import', 'from', 'as', 'try', 'except', 'finally', 'with', 'yield', 'lambda', 'pass', 'break', 'continue', 'raise', 'and', 'or', 'not', 'in', 'is', 'True', 'False', 'None', 'self', 'async', 'await'];
  const cssKeywords = ['@media', '@keyframes', '@import', '@font-face', '@charset', '@supports', 'important'];
  const sqlKeywords = ['SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'AND', 'OR', 'NOT', 'NULL', 'AS', 'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN'];
  const bashKeywords = ['echo', 'if', 'then', 'else', 'fi', 'for', 'do', 'done', 'while', 'case', 'esac', 'function', 'return', 'exit', 'export', 'source', 'cd', 'ls', 'mkdir', 'rm', 'cp', 'mv', 'grep', 'awk', 'sed', 'cat', 'chmod', 'sudo', 'apt', 'npm', 'yarn', 'git', 'docker', 'curl', 'wget'];

  let keywords: string[] = [];
  if (['javascript', 'js', 'jsx'].includes(lang)) keywords = jsKeywords;
  else if (['typescript', 'ts', 'tsx'].includes(lang)) keywords = tsKeywords;
  else if (['python', 'py'].includes(lang)) keywords = pyKeywords;
  else if (['css', 'scss'].includes(lang)) keywords = cssKeywords;
  else if (['sql'].includes(lang)) keywords = sqlKeywords;
  else if (['bash', 'sh'].includes(lang)) keywords = bashKeywords;
  else keywords = tsKeywords;

  if (keywords.length > 0) {
    const kwRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    src = src.replace(kwRegex, `<span style="color:${THEME.keyword}">$1</span>`);
  }

  if (['javascript', 'js', 'typescript', 'ts', 'tsx', 'jsx'].includes(lang)) {
    const types = ['string', 'number', 'boolean', 'any', 'void', 'never', 'unknown', 'null', 'undefined', 'object', 'Array', 'Promise', 'Record', 'Partial', 'Required', 'Readonly', 'Pick', 'Omit', 'Map', 'Set'];
    const typeRegex = new RegExp(`\\b(${types.join('|')})\\b`, 'g');
    src = src.replace(typeRegex, `<span style="color:${THEME.type}">$1</span>`);
  }

  src = src.replace(/\b(true|false|null|undefined|NaN|Infinity|console|document|window|process|module|require)\b/g, `<span style="color:${THEME.variable}">$1</span>`);
  src = src.replace(/\b([a-zA-Z_$][\w$]*)\s*(?=\()/g, `<span style="color:${THEME.function}">$1</span>`);
  src = src.replace(/\.([a-zA-Z_$][\w$]*)/g, `.<span style="color:${THEME.property}">$1</span>`);
  src = src.replace(/(=&gt;|===|!==|==|!=|&lt;=|&gt;=|&amp;&amp;|\|\||\.\.\.|\?\?|\?\.)/g, `<span style="color:${THEME.operator}">$1</span>`);

  if (['html', 'jsx', 'tsx'].includes(lang)) {
    src = src.replace(/(&lt;\/?)([\w-]+)/g, `$1<span style="color:${THEME.tag}">$2</span>`);
    src = src.replace(/\b([\w-]+)(=)/g, `<span style="color:${THEME.attribute}">$1</span>$2`);
  }

  if (['css', 'scss'].includes(lang)) {
    src = src.replace(/^(\s*)([\w-]+)(\s*:\s*)/gm, `$1<span style="color:${THEME.operator}">$2</span>$3`);
    src = src.replace(/(#[0-9a-fA-F]{3,8})\b/g, `<span style="color:${THEME.number}">$1</span>`);
  }

  if (lang === 'json') {
    src = src.replace(/(<span style="color:#98c379">"\w+"<\/span>)\s*:/g, `<span style="color:${THEME.property}">$1</span>:`);
  }

  return src;
}

export function CodeHighlighter({ code, language = 'javascript', filename }: CodeHighlighterProps) {
  const [copied, setCopied] = useState(false);
  const highlighted = highlightCode(code.trim(), language.toLowerCase());
  const highlightedLines = highlighted.split('\n');
  const displayLang = LANG_LABELS[language.toLowerCase()] || language || 'Code';

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code.trim()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className="my-8 rounded-lg overflow-hidden" style={{ backgroundColor: THEME.bg }}>
      <div className="flex items-center justify-between px-4 h-10" style={{ backgroundColor: THEME.headerBg, borderBottom: `1px solid ${THEME.headerBorder}` }}>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ec6a5e] hover:brightness-110 transition-all" />
            <div className="w-3 h-3 rounded-full bg-[#f4bf4f] hover:brightness-110 transition-all" />
            <div className="w-3 h-3 rounded-full bg-[#61c554] hover:brightness-110 transition-all" />
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            {filename ? (
              <span className="text-[12px] text-[#9da5b4]">{filename}</span>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded" style={{ backgroundColor: THEME.bg }}>
                <Terminal className="w-3 h-3" style={{ color: THEME.gutterText }} />
                <span className="text-[11px] font-medium" style={{ color: '#9da5b4' }}>{displayLang}</span>
              </div>
            )}
          </div>
        </div>
        <button onClick={handleCopy} className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] transition-all hover:bg-white/5" style={{ color: copied ? '#98c379' : '#636d83' }}>
          {copied ? <><Check className="w-3.5 h-3.5" /><span>Copie !</span></> : <><Copy className="w-3.5 h-3.5" /><span>Copier</span></>}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <tbody>
            {highlightedLines.map((line, i) => (
              <tr key={i} className="group hover:bg-white/[0.03] transition-colors">
                <td className="select-none text-right align-top px-4 py-0" style={{ color: THEME.gutterText, fontSize: '13px', lineHeight: '1.7', width: '1%', whiteSpace: 'nowrap', borderRight: `1px solid ${THEME.headerBorder}`, userSelect: 'none' }}>
                  {i + 1}
                </td>
                <td className="pl-4 pr-6 py-0" style={{ color: THEME.text, fontSize: '13px', lineHeight: '1.7', whiteSpace: 'pre' }} dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="h-3" style={{ backgroundColor: THEME.bg }} />
    </div>
  );
}