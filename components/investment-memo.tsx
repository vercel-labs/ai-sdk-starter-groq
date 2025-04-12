"use client";

import { Markdown } from "./markdown";
import { Button } from "./ui/button";
import { useState } from "react";
import { ArrowDown, Download, FileText } from "lucide-react";

interface InvestmentMemoProps {
  memo: {
    ticker: string;
    title: string;
    generationDate: string;
    content: string;
    sections: { title: string; content: string }[];
    summary: string;
  };
}

export function InvestmentMemo({ memo }: InvestmentMemoProps) {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const downloadMemo = () => {
    const blob = new Blob([memo.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${memo.ticker}_investment_memo.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col border rounded-lg overflow-hidden max-w-4xl mx-auto mt-4">
      <div className="bg-zinc-50 dark:bg-zinc-900 p-4 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <h2 className="font-semibold">{memo.title}</h2>
        </div>
        <Button variant="outline" onClick={downloadMemo} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">Executive Summary</h3>
        <Markdown>{memo.summary}</Markdown>
      </div>

      <div className="border-t">
        {memo.sections.map((section, i) => (
          <div key={i} className="border-b last:border-b-0">
            <button 
              className="flex justify-between items-center w-full p-4 text-left font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900"
              onClick={() => setExpandedSection(expandedSection === i ? null : i)}
            >
              <span>{section.title}</span>
              <ArrowDown className={`w-4 h-4 transition-transform ${expandedSection === i ? 'rotate-180' : ''}`} />
            </button>

            {expandedSection === i && (
              <div className="p-4 pt-0">
                <Markdown>{section.content}</Markdown>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}