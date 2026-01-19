"use client";

import { useState } from "react";

export default function Counter1() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex items-center gap-4">
      <span className="text-lg">Count: {count}</span>
      <button
        className="px-3 py-1 border rounded"
        onClick={() => setCount(count + 1)}
      >
        Increment
      </button>
    </div>
  );
}
