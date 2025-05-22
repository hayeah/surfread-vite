import { useEffect } from "react"
import AppFrame from "../components/Frame/AppFrame"
import { useEpubStore } from "@/store/epubStore"
import { useSearchParams } from "wouter"

import { EpubLibrary } from "@/components/reader/EpubLibrary"
import { EpubReader } from "@/components/reader/EpubReader"
import { CmdK } from "@/components/reader/CmdK"

export default function EpubPage() {
  const { reader: book, loadBook, refreshAvailableBooks, closeBook } = useEpubStore()
  const [params] = useSearchParams()

  useEffect(() => {
    document.title = "EPUB Reader"
  }, [])

  useEffect(() => {
    const id = parseInt(params.get("book") ?? "")
    if (!isNaN(id)) {
      loadBook(id)
    } else {
      closeBook()
    }
  }, [params, loadBook])

  useEffect(() => {
    refreshAvailableBooks()
  }, [refreshAvailableBooks])

  const tabs = [
    {
      id: "reader",
      label: "Reader",
      content: "hoho",
    },
  ]

  const mainContent = (
    <div className="h-full w-full bg-white">{!book ? <EpubLibrary /> : <EpubReader />}</div>
  )

  return (
    <>
      <CmdK />

      <AppFrame
        leftDrawerContent={mainContent}
        tabs={tabs}
        rightDrawerContent={
          // close button for right drawer
          <button
            onClick={() => closeBook()}
            className="outline-toggle fixed top-4 right-4 z-50 rounded-md bg-white p-2 shadow-md hover:bg-gray-100"
            title="Close Book"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        }
      />
    </>
  )
}
