import { Plus } from "lucide-react";
import { FormEvent, useState } from "react";

const initialNotes = ["Try TanStack Router here", "Check Vercel nested refreshes"];

export function App() {
  const [notes, setNotes] = useState(initialNotes);

  function addNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const note = String(data.get("note") ?? "").trim();

    if (note.length === 0) return;

    setNotes((current) => [note, ...current]);
    event.currentTarget.reset();
  }

  return (
    <main className="desk">
      <a className="back" href="/">
        Gateway
      </a>
      <section className="notes" aria-labelledby="notes-title">
        <div>
          <p className="kicker">Notes Bench</p>
          <h1 id="notes-title">Quick test pad</h1>
        </div>
        <form onSubmit={addNote}>
          <input name="note" placeholder="Add a test note" aria-label="New note" />
          <button type="submit" aria-label="Add note">
            <Plus size={20} />
          </button>
        </form>
        <ul>
          {notes.map((note, index) => (
            <li key={`${note}-${index}`}>{note}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
