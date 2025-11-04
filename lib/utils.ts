import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateRandomColor = () => {
  return (
    '#' +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
  );
};

export const formatDate = (date: string) => {
  // If the string has a time (Apple), use normal parsing
  if (date.includes('T')) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // If it's a plain date (Spotify), parse manually to avoid timezone shifts
  const [year, month, day] = date.split('-').map(Number);
  const localDate = new Date(year, month - 1, day); // treated as local time
  return localDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const decodeHtmlEntities = (text: string) => {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
  // Client-side: use browser's built-in HTML decoding
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};
