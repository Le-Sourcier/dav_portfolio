import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/data/cvData.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { cvData } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

process.stdout.write(JSON.stringify({
  skills: cvData.skills,
  education: {
    items: cvData.education.map((entry, index) => ({ id: String(index + 1), ...entry })),
  },
}, null, 2));
