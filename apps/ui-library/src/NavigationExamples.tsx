import { useState } from "react";
import { ArrowLeft, BookOpen, Grid2X2, List, Plus, Search, Settings } from "lucide-react";
import {
  Button,
  FilterChip,
  IconButton,
  SegmentedControl,
  Stack,
  TabBar,
  TabBarItem,
  TopBar,
} from "@gateway/ui";

import { Specimen, SectionTitle } from "./Specimen";

const books = ["The Creative Act", "A Book of Days", "The Design of Everyday Things"];
export function NavigationExamples({ setStatus }: { setStatus: (message: string) => void }) {
  const [view, setView] = useState("shelf");
  const [filter, setFilter] = useState("All books");
  const [tab, setTab] = useState("library");
  return (
    <section id="navigation">
      <SectionTitle index="01 / STRUCTURE" title="A sense of place">
        Clear hierarchy. Familiar ways to move.
      </SectionTitle>
      <div className="specimen-grid">
        <Specimen
          number="01"
          title="Top bar"
          description="Large titles, quiet chrome, and room for actions."
          code={
            '<TopBar\n  title="Library" large\n  leading={<IconButton aria-label="Back" />}\n  trailing={<IconButton aria-label="Add" />}\n/>'
          }
          className="wide"
        >
          <TopBar
            title="Library"
            large
            subtitle="Your next chapter starts here."
            leading={
              <Button
                variant="plain"
                onClick={() => setStatus("Back action pressed. The consumer owns navigation.")}
              >
                <ArrowLeft size={17} /> Collections
              </Button>
            }
            trailing={
              <IconButton
                aria-label="Add a book"
                onClick={() => setStatus("Add action pressed. Attach your own form or sheet.")}
              >
                <Plus size={22} />
              </IconButton>
            }
          />
          <div className="compact-bar">
            <TopBar
              title="Book details"
              leading={
                <IconButton
                  aria-label="Back to library"
                  variant="plain"
                  onClick={() => setStatus("Back to library pressed.")}
                >
                  <ArrowLeft size={20} />
                </IconButton>
              }
              trailing={
                <Button variant="plain" onClick={() => setStatus("Done pressed.")}>
                  Done
                </Button>
              }
            />
          </div>
        </Specimen>
        <Specimen
          number="02"
          title="Tab navigation"
          description="A floating capsule with a distinct selected state."
          code={
            '<TabBar>\n  <TabBarItem href="/library" icon={<BookOpen />} active>\n    Library\n  </TabBarItem>\n</TabBar>'
          }
          className="wide"
        >
          <TabBar aria-label="Example app navigation">
            {[
              { id: "library", label: "Library", icon: <BookOpen size={22} /> },
              { id: "browse", label: "Browse", icon: <Grid2X2 size={22} /> },
              { id: "search", label: "Search", icon: <Search size={22} /> },
              { id: "settings", label: "Settings", icon: <Settings size={22} /> },
            ].map((item) => (
              <TabBarItem
                key={item.id}
                href={`#demo-${item.id}`}
                icon={item.icon}
                active={tab === item.id}
                onClick={(event) => {
                  event.preventDefault();
                  setTab(item.id);
                }}
              >
                {item.label}
              </TabBarItem>
            ))}
          </TabBar>
          <div className="selection-preview">
            <strong>
              {tab === "library"
                ? "Your library"
                : tab === "browse"
                  ? "Browse collections"
                  : tab === "search"
                    ? "Find your next read"
                    : "Library preferences"}
            </strong>
            <span>
              {tab === "library"
                ? "3 books · 2 collections"
                : tab === "browse"
                  ? "Fiction, design, and the everyday."
                  : tab === "search"
                    ? "Search by title or author."
                    : "Make this space your own."}
            </span>
          </div>
        </Specimen>
        <Specimen
          number="03"
          title="Segmented control"
          description="One choice, a shared context."
          code={
            '<SegmentedControl label="View" value={view}\n  onValueChange={setView} options={options} />'
          }
        >
          <SegmentedControl
            label="Library view"
            value={view}
            onValueChange={setView}
            options={[
              { value: "shelf", label: "Shelf" },
              { value: "list", label: "List" },
            ]}
          />
          <div className={`mini-books ${view}`}>
            {books.map((book, index) => (
              <div key={book}>
                <span>{view === "list" ? <List size={16} /> : <BookOpen size={21} />}</span>
                <span>{view === "list" ? book : `0${index + 1}`}</span>
              </div>
            ))}
          </div>
        </Specimen>
        <Specimen
          number="04"
          title="Filter chips"
          description="Lightweight, directly selectable filters."
          code={"<FilterChip selected={selected}\n  onClick={toggle}>Fiction</FilterChip>"}
        >
          <Stack direction="horizontal" gap={8} wrap>
            {["All books", "Fiction", "Design"].map((item) => (
              <FilterChip key={item} selected={filter === item} onClick={() => setFilter(item)}>
                {item}
              </FilterChip>
            ))}
          </Stack>
          <p className="demo-caption">
            {filter === "All books"
              ? "Showing all 3 books"
              : `Showing ${filter.toLowerCase()} books`}
          </p>
        </Specimen>
      </div>
    </section>
  );
}
