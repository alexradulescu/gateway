import { Minus, Plus, RotateCcw } from "lucide-react";
import { useState } from "react";

export function App() {
  const [count, setCount] = useState(0);

  return (
    <main className="lab">
      <a className="back" href="/">
        Gateway
      </a>
      <section className="counter-panel" aria-labelledby="counter-title">
        <p className="kicker">Counter Lab</p>
        <h1 id="counter-title">{count}</h1>
        <div className="controls" aria-label="Counter controls">
          <button type="button" onClick={() => setCount((value) => value - 1)} aria-label="Decrease">
            <Minus size={22} />
          </button>
          <button type="button" onClick={() => setCount(0)} aria-label="Reset">
            <RotateCcw size={22} />
          </button>
          <button type="button" onClick={() => setCount((value) => value + 1)} aria-label="Increase">
            <Plus size={22} />
          </button>
        </div>
      </section>
    </main>
  );
}
