import { useState } from "react";
import { BookOpen } from "lucide-react";
import { Button, SearchField, SelectField, Stack, TextField } from "@gateway/ui";

import { Specimen, SectionTitle } from "./Specimen";

const books = ["The Creative Act", "A Book of Days", "The Design of Everyday Things"];
export function InputExamples({ setStatus }: { setStatus: (message: string) => void }) {
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  return (
    <section id="inputs">
      <SectionTitle index="02 / INPUT" title="Easy to express">
        Labels, feedback, and a comfortable touch target.
      </SectionTitle>
      <div className="specimen-grid">
        <Specimen
          number="05"
          title="Text & validation"
          description="Native fields with connected hints and errors."
          code={
            '<TextField label="Collection name" required\n  value={name} onChange={handleChange}\n  error={error} hint="Keep it short." />'
          }
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
              if (name.trim()) setStatus(`Collection “${name.trim()}” created in this demo.`);
            }}
            noValidate
          >
            <Stack gap={16}>
              <TextField
                label="Collection name"
                placeholder="e.g. Weekend reads"
                required
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setSubmitted(false);
                }}
                error={submitted && !name.trim() ? "Enter a collection name." : undefined}
                hint="A little home for books that belong together."
              />
              <Button type="submit" variant="secondary">
                Create collection
              </Button>
              <TextField label="Read-only example" value="Personal library" readOnly />
              <TextField
                label="Disabled example"
                defaultValue="Managed by your organization"
                disabled
              />
            </Stack>
          </form>
        </Specimen>
        <Specimen
          number="06"
          title="Search & select"
          description="Platform-native editing and picker behavior."
          code={
            '<SearchField label="Search books" value={query}\n  onChange={handleSearch} />\n<SelectField label="Sort by">\n  <option value="title">Title</option>\n</SelectField>'
          }
        >
          <Stack gap={16}>
            <SearchField
              label="Search books"
              placeholder="Title or author"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="search-results" aria-live="polite">
              {books
                .filter((book) => book.toLowerCase().includes(query.toLowerCase()))
                .map((book) => (
                  <span key={book}>
                    <BookOpen size={15} />
                    {book}
                  </span>
                ))}
              {!books.some((book) => book.toLowerCase().includes(query.toLowerCase())) && (
                <span>No matching books.</span>
              )}
            </div>
            <SelectField
              label="Reading pace"
              defaultValue="weekly"
              hint="Pick the rhythm that works for you."
            >
              <option value="daily">Every day</option>
              <option value="weekly">Every week</option>
              <option value="monthly">Every month</option>
            </SelectField>
          </Stack>
        </Specimen>
      </div>
    </section>
  );
}
