
/**
 * Coloration syntaxique style VSCode Dark+
 */
export const highlightCode = (code: string) => {
  if (!code) return '';
  let highlighted = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const rules = [
    // Commentaires
    { regex: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, color: 'text-[#6A9955] italic' },
    // Strings
    { regex: /(&quot;.*?&quot;|&#039;.*?&#039;|`.*?`)/g, color: 'text-[#CE9178]' },
    // Keywords
    { regex: /\b(async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|function|if|import|in|instanceof|new|return|super|switch|this|throw|try|typeof|var|void|while|with|yield|interface|type|enum|as|any|number|string|boolean|unknown|never|readonly)\b/g, color: 'text-[#569CD6]' },
    // Control Flow
    { regex: /\b(if|else|switch|case|default|for|while|do|try|catch|finally|return|break|continue|throw)\b/g, color: 'text-[#C586C0]' },
    // Booleans/Null
    { regex: /\b(true|false|null|undefined)\b/g, color: 'text-[#569CD6]' },
    // Functions
    { regex: /\b(\w+)(?=\s*\()/g, color: 'text-[#DCDCAA]' },
    // Numbers
    { regex: /\b(\d+)\b/g, color: 'text-[#B5CEA8]' },
    // Class names/Types
    { regex: /\b([A-Z]\w*)\b/g, color: 'text-[#4EC9B0]' },
  ];

  rules.forEach(({ regex, color }) => {
    highlighted = highlighted.replace(regex, `<span class="${color}">$1</span>`);
  });

  return highlighted;
};
