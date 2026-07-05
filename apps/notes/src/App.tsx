import { Plus } from "lucide-react";
import { FormEvent, useState } from "react";
import { createGlobalStyle, styled } from "@alex.radulescu/styled-static";

const initialNotes = ["Try TanStack Router here", "Check Vercel nested refreshes"];

const GlobalStyle = createGlobalStyle`
  :root {
    color: #15201d;
    background: #eef3de;
    font-family: ui-sans-serif, system-ui, sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-width: 320px;
    min-height: 100vh;
    background:
      linear-gradient(120deg, rgba(13, 124, 102, 0.18) 0 25%, transparent 25% 100%),
      #eef3de;
  }
`;

const Desk = styled.main`
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 24px;
`;

const BackLink = styled.a`
  position: fixed;
  top: 18px;
  left: 18px;
  color: inherit;
  font-weight: 800;
  text-decoration: none;
`;

const NotesSection = styled.section`
  width: min(720px, 100%);
`;

const Kicker = styled.p`
  margin: 0 0 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 900;
  text-transform: uppercase;
`;

const Title = styled.h1`
  margin: 0 0 24px;
  font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  font-size: clamp(3.5rem, 12vw, 7.5rem);
  line-height: 0.9;
  letter-spacing: 0;
`;

const NoteForm = styled.form`
  display: grid;
  grid-template-columns: 1fr 56px;
  gap: 10px;
`;

const NoteInput = styled.input`
  min-width: 0;
  height: 56px;
  padding: 0 16px;
  border: 2px solid #15201d;
  background: #fffdf2;
  color: #15201d;
  font: inherit;
`;

const AddButton = styled.button`
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  border: 2px solid #15201d;
  background: #0d7c66;
  color: #fffdf2;
  cursor: pointer;
  font: inherit;
`;

const NoteList = styled.ul`
  display: grid;
  gap: 10px;
  padding: 0;
  margin: 18px 0 0;
  list-style: none;
`;

const NoteItem = styled.li`
  padding: 16px;
  border: 2px solid #15201d;
  background: #fffdf2;
  color: #15201d;
  font: inherit;
  box-shadow: 5px 5px 0 #15201d;
`;

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
    <Desk>
      <GlobalStyle />
      <BackLink href="/">Gateway</BackLink>
      <NotesSection aria-labelledby="notes-title">
        <div>
          <Kicker>Notes Bench</Kicker>
          <Title id="notes-title">Quick test pad</Title>
        </div>
        <NoteForm onSubmit={addNote}>
          <NoteInput name="note" placeholder="Add a test note" aria-label="New note" />
          <AddButton type="submit" aria-label="Add note">
            <Plus size={20} />
          </AddButton>
        </NoteForm>
        <NoteList>
          {notes.map((note, index) => (
            <NoteItem key={`${note}-${index}`}>{note}</NoteItem>
          ))}
        </NoteList>
      </NotesSection>
    </Desk>
  );
}
