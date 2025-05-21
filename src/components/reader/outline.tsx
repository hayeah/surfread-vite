import React from "react"
import { type FlatTOC } from "../../store/epubStore"

interface OutlineProps {
  toc: FlatTOC
  onChapterSelect: (href: string) => void
}

export function Outline({ toc, onChapterSelect }: OutlineProps) {
  return (
    <div className="h-full">
      <nav>
        {toc.map((item, index) => (
          <button
            key={index}
            onClick={() => onChapterSelect(item.href)}
            className={`block w-full rounded py-2 text-left hover:bg-gray-100 ${
              item.level === 0 ? "font-bold" : ""
            }`}
            style={{ paddingLeft: `${item.level * 1}rem` }}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
