"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { Check, Copy } from "lucide-react";
import type { CSSProperties } from "react";

/* Catppuccin Mocha-inspired warm syntax theme */
const warmTheme: { [key: string]: CSSProperties } = {
  'code[class*="language-"]': {
    color: "#cdd6f4",
    fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
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
    color: "#cdd6f4",
    fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
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
  comment: { color: "#6c7086", fontStyle: "italic" },
  prolog: { color: "#6c7086" },
  doctype: { color: "#6c7086" },
  cdata: { color: "#6c7086" },
  punctuation: { color: "#9399b2" },
  property: { color: "#89dceb" },
  tag: { color: "#89dceb" },
  boolean: { color: "#fab387" },
  number: { color: "#fab387" },
  constant: { color: "#fab387" },
  symbol: { color: "#f2cdcd" },
  deleted: { color: "#f38ba8" },
  selector: { color: "#a6e3a1" },
  "attr-name": { color: "#f9e2af" },
  string: { color: "#a6e3a1" },
  char: { color: "#a6e3a1" },
  builtin: { color: "#f5c2e7" },
  inserted: { color: "#a6e3a1" },
  operator: { color: "#9399b2" },
  entity: { color: "#89dceb", cursor: "help" },
  url: { color: "#89dceb" },
  "attr-value": { color: "#a6e3a1" },
  keyword: { color: "#cba6f7" },
  function: { color: "#89b4fa" },
  "class-name": { color: "#f9e2af" },
  regex: { color: "#fab387" },
  important: { color: "#fab387", fontWeight: "bold" },
  variable: { color: "#cdd6f4" },
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
    <div className="group relative my-3 rounded-xl overflow-hidden border border-border/60 bg-[#1e1e2e]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 text-xs bg-[#181825] text-[#9399b2] border-b border-white/5">
        <span className="font-mono opacity-70">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-[#9399b2] transition-all duration-200 hover:bg-white/5 hover:text-[#f9e2af]"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} className="text-[#a6e3a1]" />
              <span className="text-[#a6e3a1]">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code */}
      <SyntaxHighlighter
        language={language}
        style={warmTheme}
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
