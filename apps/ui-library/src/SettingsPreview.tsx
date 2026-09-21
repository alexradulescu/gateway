import { useState } from "react";
import { ArrowLeft, Bell, BookOpen, Plus, Tags } from "lucide-react";
import {
  Button,
  IconButton,
  SelectField,
  SettingsGroup,
  SettingsLink,
  SettingsRow,
  Stack,
  Switch,
  TextField,
  TopBar,
} from "@gateway/ui";

export function SettingsPreview() {
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
