// app/components/Clarification.tsx
import Tooltip from "./tool-tip";

interface ClarificationProps {
  term: string;
  description: string;
}

export function Clarification({ term, description }: ClarificationProps) {
  return (
    <span className="inline-flex items-center gap-1">
      {/* The text term */}
      <span>{term}</span>

      {/* The Tooltip wrapping the icon */}
      <Tooltip content={description} placement="top">
        <button
          type="button"
          className="text-gray-400 hover:text-blue-500 transition-colors focus:outline-none cursor-help"
          aria-label={`More info about ${term}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
      </Tooltip>
    </span>
  );
}
