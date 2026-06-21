import React from 'react';

/**
 * Renders description text as:
 * - A proper <ul> bullet list if lines start with -, *, or •
 * - A plain <p> paragraph otherwise
 *
 * Uses inline styles to guarantee bullet rendering in print/PDF contexts
 * where Tailwind utility classes may be stripped or overridden.
 */
export default function DescriptionRenderer({ text, className = '' }) {
  if (!text || !text.trim()) return null;

  const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '');
  const bulletRegex = /^[-•*]\s*/;
  const hasBullets = lines.some(line => bulletRegex.test(line));

  if (hasBullets) {
    return (
      <ul
        className={className}
        style={{
          listStyleType: 'disc',
          listStylePosition: 'outside',
          paddingLeft: '1.2em',
          margin: '2px 0',
        }}
      >
        {lines.map((line, idx) => {
          // Strip the bullet character prefix so we don't double-render it
          const cleanLine = line.replace(bulletRegex, '').trim();
          return (
            <li
              key={idx}
              style={{
                display: 'list-item',
                lineHeight: '1.6',
                marginBottom: '2px',
              }}
            >
              {cleanLine || line}
            </li>
          );
        })}
      </ul>
    );
  }

  // Plain paragraph — preserve line breaks for multi-line text
  return (
    <p
      className={className}
      style={{ whiteSpace: 'pre-line', lineHeight: '1.6', margin: '2px 0' }}
    >
      {text}
    </p>
  );
}
