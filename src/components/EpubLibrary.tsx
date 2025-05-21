import React from 'react';
import { useLocation } from "wouter";

interface Book {
  id: number;
  title: string;
}

const booksData: Book[] = [
  { id: 1, title: "Book 1" },
  { id: 2, title: "Book 2" },
  { id: 3, title: "Book 3" },
];

const EpubLibrary: React.FC = () => {
  const [, navigate] = useLocation();

  const handleBookClick = (id: number) => {
    // Simulate navigating to a book page using wouter
    navigate(`/epub?book=${id}`);
    console.log(`Navigating to book with ID: ${id}`);
  };

  return (
    <div>
      <h2>Epub Library</h2>
      <ul>
        {booksData.map((book) => (
          <li key={book.id} onClick={() => handleBookClick(book.id)} style={{ cursor: 'pointer' }}>
            {book.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EpubLibrary;
