// src/components/SearchResultsDropdown.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Highlight = ({ text, matches, matchKey }) => {
  const titleMatch = matches.find((m) => m.key === matchKey);
  const indices = titleMatch?.indices;
  if (!indices || indices.length === 0) return <span>{text}</span>;

  const highlighted = [];
  let lastIndex = 0;
  indices.forEach(([start, end], i) => {
    if (start > lastIndex)
      highlighted.push(
        <span key={`u-${i}`}>{text.substring(lastIndex, start)}</span>,
      );
    highlighted.push(
      <strong
        key={`m-${i}`}
        // --- CORREZIONE: Rimosso text-antracite da qui ---
        className="font-semibold group-hover:text-blue"
      >
        {text.substring(start, end + 1)}
      </strong>,
    );
    lastIndex = end + 1;
  });
  if (lastIndex < text.length)
    highlighted.push(<span key="u-end">{text.substring(lastIndex)}</span>);
  return <>{highlighted}</>;
};

const SearchResultsDropdown = ({
  results,
  onResultClick,
  isExpandedView = false,
}) => {
  if (!results || results.length === 0) {
    return null;
  }

  if (isExpandedView) {
    return (
      <div>
        <h3 className="text-xs font-regular text-antracite mb-[0.75rem]">
          Suggerimenti
        </h3>
        <ul className="space-y-1">
          {results.map(({ item, matches }, index) => (
            <li key={item.slug + index}>
              <Link
                to={item.slug}
                onClick={onResultClick}
                // Questo Link ora controlla il colore di tutti i suoi figli
                className="group flex items-center gap-[0.75rem] text-sm text-antracite hover:text-blue w-full text-left py-[0.5rem]"
              >
                {/* --- CORREZIONE: Rimosso text-antracite da qui --- */}
                <ArrowRight className="w-[1rem] h-[1rem] transition-transform group-hover:translate-x-1 flex-shrink-0" />
                <span className="truncate">
                  <Highlight
                    text={item.title}
                    matches={matches}
                    matchKey="title"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
};

export default SearchResultsDropdown;