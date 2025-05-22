import React, { useState } from "react"
import { useLocation } from "wouter"
import { useEpubStore } from "@/store/epubStore"
import { Dropzone } from "@/components/ui/dropzone"
import { prefixSearch } from "@/utils/textSearch"

export const EpubLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const { handleFileAccepted, availableBooks, deleteBook } = useEpubStore()
  const [, navigate] = useLocation()

  const handleBookClick = (id: number) => {
    navigate(`/?book=${id}`)
  }

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this book?")) return
    deleteBook(id)
  }

  /**
   * Filter the books by checking whether `prefixSearch` finds all tokens
   * in the book’s title.  For those matched, we keep around `highlightInfo`.
   */
  const filteredBooks =
    searchQuery.trim() === ""
      ? availableBooks.map((book) => ({ ...book, matched: true, highlightInfo: [] }))
      : availableBooks
          .map((book) => {
            const { matched, highlightInfo } = prefixSearch(searchQuery, book.title)
            return { ...book, matched, highlightInfo }
          })
          .filter((item) => item.matched)

  /**
   * Construct a React element that highlights all matched segments
   * according to the highlightInfo array.  Each `HighlightSegment` points
   * to which word and which slice of that word to highlight.
   */
  function highlightTitle(
    title: string,
    highlightInfo: Array<{
      wordIndex: number
      matchStart: number
      matchLength: number
    }>,
  ) {
    if (!title.trim() || highlightInfo.length === 0) {
      return title
    }

    const words = title.split(/\s+/)
    return (
      <>
        {words.map((word, wIdx) => {
          // Find any segment that points to this word index:
          const seg = highlightInfo.find((h) => h.wordIndex === wIdx)
          if (!seg) {
            return <React.Fragment key={wIdx}>{word} </React.Fragment>
          }
          // Segment found: highlight the matched portion in this word
          const { matchStart, matchLength } = seg
          const before = word.slice(0, matchStart)
          const match = word.slice(matchStart, matchStart + matchLength)
          const after = word.slice(matchStart + matchLength)
          return (
            <React.Fragment key={wIdx}>
              {before}
              <span className="bg-yellow-200">{match}</span>
              {after}{" "}
            </React.Fragment>
          )
        })}
      </>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Fixed-height top section */}
      <div className="flex-none p-4">
        <Dropzone onFileAccepted={handleFileAccepted} className="mx-auto mb-4 max-w-xl" />

        {availableBooks.length > 0 && (
          <div className="mx-auto max-w-xl">
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2 w-full rounded-lg border p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Remaining space -> scrollable list */}
      <div className="flex-grow overflow-y-auto p-4">
        {availableBooks.length > 0 && (
          <div className="mx-auto max-w-xl space-y-4">
            {filteredBooks.map(({ id, title, timestamp, highlightInfo }) => (
              <div
                key={id}
                onClick={() => handleBookClick(id)}
                className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-4 hover:bg-gray-100"
              >
                <div>
                  <h3 className="font-medium">{highlightTitle(title, highlightInfo)}</h3>
                  <p className="text-sm text-gray-500">
                    Added {new Date(timestamp).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteClick(e, id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
