import { useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  Grid2X2,
  Layers,
  List,
  Moon,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Sun,
  Tags,
} from "lucide-react";
import {
  Button,
  FilterChip,
  IconButton,
  SearchField,
  SegmentedControl,
  SelectField,
  SettingsGroup,
  SettingsLink,
  SettingsRow,
  Stack,
  Surface,
  Switch,
  TabBar,
  TabBarItem,
  TextField,
  TopBar,
} from "@gateway/ui";
import { componentDocs } from "./componentDocs";

type Section = "overview" | "navigation" | "inputs" | "buttons" | "settings" | "composition";
const sections: { id: Section; label: string; icon: ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <Grid2X2 size={18} /> },
  { id: "navigation", label: "Navigation", icon: <Layers size={18} /> },
  { id: "inputs", label: "Inputs & selection", icon: <SlidersHorizontal size={18} /> },
  { id: "buttons", label: "Buttons & actions", icon: <Plus size={18} /> },
  { id: "settings", label: "Settings patterns", icon: <Settings size={18} /> },
  { id: "composition", label: "Composition & API", icon: <Code2 size={18} /> },
];
function Specimen({
  number,
  title,
  description,
  children,
  code,
  className = "",
}: {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
  code: string;
  className?: string;
}) {
  return (
    <article className={`specimen ${className}`}>
      <div className="specimen-heading">
        <span>{number}</span>
        <h3>{title}</h3>
      </div>
      <p>{description}</p>
      <div className="specimen-stage">{children}</div>
      <details className="source">
        <summary>
          <Code2 size={14} /> Composition <Plus size={14} />
        </summary>
        <pre>
          <code>{code}</code>
        </pre>
      </details>
    </article>
  );
}
function SectionTitle({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{index}</span>
        <h2>{title}</h2>
      </div>
      <p>{children}</p>
    </div>
  );
}
function SettingsPreview() {
  const [page, setPage] = useState("settings");
  const [notifications, setNotifications] = useState(true);
  const [sort, setSort] = useState("recent");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState(["Fiction", "Design", "Biography"]);
  return (
    <div className="settings-preview">
      <TopBar
        title={page === "settings" ? "Settings" : "Categories"}
        large
        leading={
          page === "categories" ? (
            <IconButton aria-label="Back to settings" onClick={() => setPage("settings")}>
              <ArrowLeft size={20} />
            </IconButton>
          ) : (
            <span className="preview-app-name">
              <BookOpen size={17} /> Bookster
            </span>
          )
        }
        trailing={
          <span className="avatar" aria-label="Alex's profile">
            AR
          </span>
        }
      />
      <div className="settings-preview__body">
        <Stack gap={24}>
          {page === "settings" ? (
            <>
              <SettingsGroup title="Library">
                <div className="field-inset">
                  <SelectField
                    label="Default sort order"
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                    hint="How books are ordered when you open your library."
                  >
                    <option value="recent">Date added</option>
                    <option value="title">Title</option>
                    <option value="author">Author</option>
                  </SelectField>
                </div>
              </SettingsGroup>
              <SettingsGroup title="Organization">
                <SettingsLink
                  label="Categories"
                  description={`${categories.length} categories`}
                  icon={<Tags size={18} />}
                  href="#preview-categories"
                  onClick={(event) => {
                    event.preventDefault();
                    setPage("categories");
                  }}
                />
                <SettingsRow
                  label="Reading reminders"
                  description="A little time for a good book"
                  icon={<Bell size={18} />}
                  trailing={
                    <Switch
                      label="Reading reminders"
                      checked={notifications}
                      onChange={(event) => setNotifications(event.target.checked)}
                    />
                  }
                />
              </SettingsGroup>
              <SettingsGroup
                title="About"
                footer="A complete screen, composed from the same pieces on the left."
              >
                <SettingsRow label="Collection" trailing={<span>Personal library</span>} />
                <SettingsRow label="Version" trailing={<span>1.0</span>} />
              </SettingsGroup>
            </>
          ) : (
            <>
              <SettingsGroup title="Your categories">
                {categories.map((name) => (
                  <SettingsRow key={name} label={name} icon={<Tags size={18} />} />
                ))}
              </SettingsGroup>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (category.trim() && !categories.includes(category.trim())) {
                    setCategories([...categories, category.trim()]);
                    setCategory("");
                  }
                }}
              >
                <Stack gap={12}>
                  <TextField
                    label="New category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    placeholder="e.g. Architecture"
                  />
                  <Button
                    type="submit"
                    disabled={!category.trim() || categories.includes(category.trim())}
                  >
                    <Plus size={18} /> Add category
                  </Button>
                </Stack>
              </form>
            </>
          )}
        </Stack>
      </div>
      <div className="preview-footnote">
        <span className="live-dot" /> Interactive composition · local demo state
      </div>
    </div>
  );
}
export function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [palette, setPalette] = useState<"ios" | "bookster">("ios");
  const [section, setSection] = useState<Section>("overview");
  const [view, setView] = useState("shelf");
  const [filter, setFilter] = useState("All books");
  const [tab, setTab] = useState("library");
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [status, setStatus] = useState("Ready to explore.");
  const show = (id: Section) => section === "overview" || section === id;
  const books = ["The Creative Act", "A Book of Days", "The Design of Everyday Things"];
  return (
    <Surface theme={theme} palette={palette} className="library-app">
      <a className="skip-link" href="#main-content">
        Skip to components
      </a>
      <aside className="sidebar">
        <a className="brand" href="#overview" onClick={() => setSection("overview")}>
          <span className="brand-symbol">
            <Layers size={22} />
          </span>
          <span>
            UI Library<small>GATEWAY / DESIGN SYSTEM</small>
          </span>
        </a>
        <div className="sidebar-label">EXPLORE THE LIBRARY</div>
        <nav aria-label="Component categories">
          {sections.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={section === item.id ? "page" : undefined}
              onClick={() => setSection(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.id === "composition" ? <ArrowUpRight size={14} /> : null}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="release">
            v0.1 <span>React components</span>
          </span>
          <p>
            Born in Bookster.
            <br />
            Ready for your next project.
          </p>
          <a href="/">
            Back to Gateway <ArrowUpRight size={14} />
          </a>
        </div>
      </aside>
      <div className="workspace">
        <header className="workspace-bar">
          <span>
            Library <ChevronRight size={14} />{" "}
            <strong>{sections.find((item) => item.id === section)?.label}</strong>
          </span>
          <div className="workspace-tools">
            <span className="version-tag">iOS 27 inspired</span>
            <IconButton
              aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </IconButton>
          </div>
        </header>
        <main id="main-content" className="main-content">
          <div className="intro" id="overview">
            <div>
              <span className="eyebrow">THE FAMILIAR, MADE REUSABLE</span>
              <h1>
                Small pieces.
                <br />
                <span>Thoughtful interfaces.</span>
              </h1>
              <p>
                Everyday iOS patterns, distilled from Bookster into composable React. Explore the
                details. Make them your own.
              </p>
            </div>
            <div className="intro-note">
              <span className="live-dot" /> 16 components<span>Native semantics</span>
              <span>Just React + CSS</span>
            </div>
          </div>
          <div className="gallery-toolbar">
            <span>
              <span className="live-dot" /> Live components <small>Try every control</small>
            </span>
            <SegmentedControl
              label="Color palette"
              value={palette}
              onValueChange={(value) => setPalette(value as "ios" | "bookster")}
              options={[
                { value: "ios", label: "iOS" },
                { value: "bookster", label: "Bookster" },
              ]}
            />
          </div>
          <div className="workbench">
            <div className="catalog">
              {show("navigation") && (
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
                            onClick={() =>
                              setStatus("Back action pressed. The consumer owns navigation.")
                            }
                          >
                            <ArrowLeft size={17} /> Collections
                          </Button>
                        }
                        trailing={
                          <IconButton
                            aria-label="Add a book"
                            onClick={() =>
                              setStatus("Add action pressed. Attach your own form or sheet.")
                            }
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
                            <span>
                              {view === "list" ? <List size={16} /> : <BookOpen size={21} />}
                            </span>
                            <span>{view === "list" ? book : `0${index + 1}`}</span>
                          </div>
                        ))}
                      </div>
                    </Specimen>
                    <Specimen
                      number="04"
                      title="Filter chips"
                      description="Lightweight, directly selectable filters."
                      code={
                        "<FilterChip selected={selected}\n  onClick={toggle}>Fiction</FilterChip>"
                      }
                    >
                      <Stack direction="horizontal" gap={8} wrap>
                        {["All books", "Fiction", "Design"].map((item) => (
                          <FilterChip
                            key={item}
                            selected={filter === item}
                            onClick={() => setFilter(item)}
                          >
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
              )}
              {show("inputs") && (
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
                          if (name.trim())
                            setStatus(`Collection “${name.trim()}” created in this demo.`);
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
                            error={
                              submitted && !name.trim() ? "Enter a collection name." : undefined
                            }
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
                          {!books.some((book) =>
                            book.toLowerCase().includes(query.toLowerCase()),
                          ) && <span>No matching books.</span>}
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
              )}
              {show("buttons") && (
                <section id="buttons">
                  <SectionTitle index="03 / ACTION" title="An obvious next step">
                    A small set of actions with a clear hierarchy.
                  </SectionTitle>
                  <Specimen
                    number="07"
                    title="Buttons & icon buttons"
                    description="44px targets. Subtle press feedback. Native disabled state."
                    code={
                      '<Button onClick={save}>Save changes</Button>\n<Button variant="secondary">Cancel</Button>\n<Button variant="plain">Learn more</Button>\n<Button variant="danger">Delete</Button>\n<IconButton aria-label="Add"><Plus /></IconButton>'
                    }
                  >
                    <Stack gap={16}>
                      <Stack direction="horizontal" wrap gap={12}>
                        <Button
                          onClick={() => {
                            setSaved(!saved);
                            setStatus(saved ? "Save state reset." : "Changes saved in this demo.");
                          }}
                        >
                          {saved ? <Check size={17} /> : <Plus size={17} />}
                          {saved ? "Saved" : "Save changes"}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setSaved(false);
                            setStatus("Changes canceled.");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="plain"
                          onClick={() => {
                            setSection("composition");
                            setStatus("Component API is now displayed.");
                          }}
                        >
                          View API <ArrowUpRight size={16} />
                        </Button>
                      </Stack>
                      <Stack direction="horizontal" wrap gap={12}>
                        <Button
                          variant="danger"
                          onClick={() =>
                            setStatus("Delete action previewed. No records were changed.")
                          }
                        >
                          Delete
                        </Button>
                        <Button disabled>Unavailable</Button>
                        <IconButton
                          aria-label="Add item"
                          onClick={() => setStatus("Add item pressed.")}
                        >
                          <Plus size={21} />
                        </IconButton>
                        <IconButton aria-label="Disabled add item" disabled>
                          <Plus size={21} />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Specimen>
                </section>
              )}
              {show("settings") && (
                <section id="settings">
                  <SectionTitle index="04 / GROUPING" title="Everything in its place">
                    Bookster’s settings, broken into reusable pieces.
                  </SectionTitle>
                  <Specimen
                    number="08"
                    title="Grouped settings"
                    description="Compose rows, links, controls, and supporting copy."
                    code={
                      '<SettingsGroup title="Preferences" footer="Saved on this device.">\n  <SettingsLink label="Appearance" href="/appearance" />\n  <SettingsRow label="Reminders" trailing={\n    <Switch label="Reminders" checked={on} onChange={toggle} />\n  } />\n</SettingsGroup>'
                    }
                  >
                    <SettingsGroup
                      title="Preferences"
                      footer="A row owns layout. Its trailing slot owns the control."
                    >
                      <SettingsLink
                        label="Appearance"
                        description="Explore the theme controls"
                        icon={<Sun size={18} />}
                        href="#overview"
                        onClick={() => {
                          setSection("overview");
                          setStatus(
                            "Use the moon button or palette selector to change appearance.",
                          );
                        }}
                        value={theme === "light" ? "Light" : "Dark"}
                      />
                      <SettingsRow
                        label="Notifications"
                        icon={<Bell size={18} />}
                        trailing={
                          <Switch
                            label="Notifications"
                            checked={enabled}
                            onChange={(event) => setEnabled(event.target.checked)}
                          />
                        }
                      />
                      <SettingsRow
                        label="Managed setting"
                        description="Disabled by the account owner"
                        trailing={<Switch label="Managed setting" checked disabled />}
                      />
                    </SettingsGroup>
                  </Specimen>
                </section>
              )}
              {(section === "composition" || section === "overview") && (
                <section id="composition">
                  <SectionTitle index="05 / COMPOSITION" title="Build with what you need">
                    No provider. No router. Your state, your content.
                  </SectionTitle>
                  <div className="composition-card">
                    <pre>
                      <code>
                        {
                          'import { Surface, Stack, TopBar, SettingsGroup,\n  SettingsRow, Switch } from "@gateway/ui";\nimport "@gateway/ui/styles.css";\n\n<Surface theme="light" palette="bookster">\n  <TopBar title="Settings" large />\n  <Stack gap={24}>\n    <SettingsGroup title="Preferences">\n      <SettingsRow label="Reminders" trailing={\n        <Switch label="Reminders" checked={enabled}\n          onChange={e => setEnabled(e.target.checked)} />\n      } />\n    </SettingsGroup>\n  </Stack>\n</Surface>'
                        }
                      </code>
                    </pre>
                    <div className="composition-boundaries">
                      <span>
                        <strong>App</strong>State & navigation
                      </span>
                      <ChevronRight size={17} />
                      <span>
                        <strong>Components</strong>Semantics & layout
                      </span>
                      <ChevronRight size={17} />
                      <span>
                        <strong>CSS tokens</strong>Theme & motion
                      </span>
                    </div>
                  </div>
                  <div className="api-table-wrap">
                    <table className="api-table">
                      <caption>
                        All 16 components · native element props are forwarded where applicable
                      </caption>
                      <thead>
                        <tr>
                          <th>Component</th>
                          <th>Main props</th>
                          <th>Composition</th>
                        </tr>
                      </thead>
                      <tbody>
                        {componentDocs.map((doc) => (
                          <tr key={doc.name}>
                            <td>
                              <code>{doc.name}</code>
                            </td>
                            <td>{doc.props}</td>
                            <td>{doc.composition}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </div>
            <aside className="preview-column">
              <div className="preview-label">
                <span>PUTTING IT TOGETHER</span>
                <span className="live-dot" />
              </div>
              <SettingsPreview />
              <div className="preview-note">
                <Layers size={17} />
                <p>
                  One screen. Seven primitives.
                  <br />
                  <strong>Same components. Different context.</strong>
                </p>
              </div>
              <a
                href="#composition"
                className="composition-link"
                onClick={() => setSection("composition")}
              >
                See how it’s composed <ArrowUpRight size={15} />
              </a>
            </aside>
          </div>
          <footer className="page-footer">
            <span>UI Library / Gateway</span>
            <span>Built from Bookster · React + CSS</span>
          </footer>
        </main>
        <output className="demo-status">
          <span className="live-dot" />
          {status}
        </output>
      </div>
    </Surface>
  );
}
