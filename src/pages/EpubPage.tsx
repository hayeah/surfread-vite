import { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import AppFrame from "../components/Frame/AppFrame";
import { useEpubStore } from '@/store/epubStore';

import { EpubLibrary } from '@/components/reader/EpubLibrary';
import { EpubReader } from '@/components/reader/EpubReader';
import { CmdK } from '@/components/reader/CmdK';

export default function EpubPage() {
  const { reader: book, loadBook, refreshAvailableBooks, closeBook } = useEpubStore();
  const [location] = useLocation();

  useEffect(() => {
    document.title = "EPUB Reader";
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const bookId = params.get('book');
    if (bookId) {
      const id = parseInt(bookId);
      if (!isNaN(id)) {
        loadBook(id);
      }
    }
  }, [location.search, loadBook]);

  useEffect(() => {
    refreshAvailableBooks();
  }, [refreshAvailableBooks]);

  const tabs = [
    {
      id: "reader",
      label: "Reader",
      content: book ? <EpubReader /> : <EpubLibrary />,
    },
  ];

  return (
    <>
      <CmdK />

      <AppFrame
        leftDrawerContent={tabs[0].content}
        tabs={tabs}
        rightDrawerContent={
          // close button for right drawer
          <button
            onClick={() => closeBook()}
            className="fixed right-4 top-4 z-50 p-2 bg-white rounded-md shadow-md hover:bg-gray-100 outline-toggle"
            title="Close Book"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        }
      />

    </>
  );
}
