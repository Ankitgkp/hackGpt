"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { Check, Copy } from "lucide-react";
import type { CSSProperties } from "react";

const tealTheme: { [key: string]: CSSProperties } = {
  'code[class*="language-"]': {
    color: "#c9d8d4",
    fontFamily: "var(--font-mono), ui-monospace, monospace",
    fontSize: "0.8125rem",
    lineHeight: "1.7",
    direction: "ltr",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    tabSize: 2,
  },
  'pre[class*="language-"]': {
    color: "#c9d8d4",
    fontFamily: "var(--font-mono), ui-monospace, monospace",
    fontSize: "0.8125rem",
    lineHeight: "1.7",
    direction: "ltr",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    tabSize: 2,
    margin: 0,
    padding: "1rem 1.25rem",
    overflow: "auto",
    background: "transparent",
  },
  comment: { color: "#5c7a72", fontStyle: "italic" },
  prolog: { color: "#5c7a72" },
  doctype: { color: "#5c7a72" },
  cdata: { color: "#5c7a72" },
  punctuation: { color: "#7a9e96" },
  property: { color: "#6ec5b8" },
  tag: { color: "#6ec5b8" },
  boolean: { color: "#ff9e64" },
  number: { color: "#ff9e64" },
  constant: { color: "#ff9e64" },
  symbol: { color: "#6ec5b8" },
  deleted: { color: "#f47067" },
  selector: { color: "#7ee6b0" },
  "attr-name": { color: "#7ee6b0" },
  string: { color: "#7ee6b0" },
  char: { color: "#7ee6b0" },
  builtin: { color: "#7ee6b0" },
  inserted: { color: "#7ee6b0" },
  operator: { color: "#7a9e96" },
  entity: { color: "#6ec5b8", cursor: "help" },
  url: { color: "#6ec5b8" },
  "attr-value": { color: "#7ee6b0" },
  keyword: { color: "#bb9af7" },
  function: { color: "#6ec5b8" },
  "class-name": { color: "#6ec5b8" },
  regex: { color: "#ff9e64" },
  important: { color: "#ff9e64", fontWeight: "bold" },
  variable: { color: "#c9d8d4" },
};

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "text" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper group relative my-3 rounded-xl overflow-hidden border border-[oklch(0.25_0.015_180)] bg-[oklch(0.16_0.01_180)]">

      <div className="flex items-center justify-between px-4 py-2 text-xs bg-[oklch(0.13_0.012_180)] text-[#7a9e96] border-b border-[oklch(0.22_0.012_180)]">
        <span className="font-mono opacity-70">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-[#7a9e96] transition-all duration-200 hover:bg-white/10 hover:text-[#6ec5b8]"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} className="text-[#6ec5b8]" />
              <span className="text-[#6ec5b8]">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={tealTheme}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          padding: "1rem 1.25rem",
          fontSize: "0.8125rem",
          lineHeight: "1.7",
          background: "transparent",
        }}
        wrapLongLines={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
