import React from 'react';
import ReactMarkdown from 'react-markdown';

// Renders Markdown with the advisor console typography instead of showing raw
// "#" / "-" syntax in an unstyled block.
export default function Markdown({ children, className }) {
  return (
    <div className={`t4-md${className ? ` ${className}` : ''}`}>
      <ReactMarkdown>{children || ''}</ReactMarkdown>
    </div>
  );
}
