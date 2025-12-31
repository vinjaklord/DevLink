import type { ReactNode } from 'react';

// Private helper function (not exported)
// Ensure 'text' is explicitly typed as 'string'
const decodeHtml = (text: string): string => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

export const linkifyText = (text: string | undefined): ReactNode[] => {
  if (!text) return [];

  const decoded = decodeHtml(text);
  // Regex to match URLs starting with http/https or www
  const urlRegex = /\b((https?:\/\/|www\.)[^\s]+)/gi;

  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match;

  // The loop logic itself is ok for finding matches and splitting the texxt
  while ((match = urlRegex.exec(decoded)) !== null) {
    const { index } = match;
    const url = match[0];

    // Add the text before the link
    if (index > lastIndex) {
      parts.push(decoded.slice(lastIndex, index));
    }

    const href = url.startsWith('http') ? url : `https://${url}`;

    // Add the link as a React element
    parts.push(
      <a
        key={index}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline break-words"
      >
        {url}
      </a>
    );

    lastIndex = index + url.length;
  }

  // Add any remaining text after the last link - tadaaa
  if (lastIndex < decoded.length) {
    parts.push(decoded.slice(lastIndex));
  }

  return parts;
};

export const formatSidebarMessage = (text: string | undefined, limit: number = 25): string => {
  if (!text) {
    return '...';
  }

  const decodedText = decodeHtml(text);

  // replace URLs with a clean indicator string
  const urlRegex = /\b((https?:\/\/|www\.)[^\s]+)/gi;

  // replace the entire URL with a clean string
  const formattedText = decodedText.replace(urlRegex, '🔗 Shared Link');

  // Truncate the final resulting string based on the new limit
  // we subtract 3 from the limit to account for the '...' ellipsis
  const maxLength = limit;
  const ellipsis = '...';

  if (formattedText.length > maxLength) {
    // Truncate and ensure we leave space for the ellipsis
    return `${formattedText.substring(0, maxLength - ellipsis.length)}${ellipsis}`;
  }

  return formattedText;
};
