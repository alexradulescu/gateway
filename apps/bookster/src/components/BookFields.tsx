import {
  FieldError,
  Input,
  Label,
  ListBox,
  Select,
  Switch,
  TextField,
  type Key,
} from "@heroui/react";
import type { BooksterCategory, BooksterLocation } from "../types";

export type BookFormValue = {
  title: string;
  author: string;
  categoryIds: string[];
  locationIds: string[];
  isSample: boolean;
};

type BookFieldProps = {
  value: BookFormValue;
  onChange: (value: BookFormValue) => void;
  categories: BooksterCategory[];
  locations: BooksterLocation[];
  errors: Partial<Record<"title" | "author", string>>;
  titleInputRef?: React.RefObject<HTMLInputElement | null>;
};

export function BookIdentityFields({
  value,
  onChange,
  errors,
  titleInputRef,
}: Pick<BookFieldProps, "value" | "onChange" | "errors" | "titleInputRef">) {
  return (
    <div className="bookster-form-grid">
      <TextField
        isInvalid={Boolean(errors.title)}
        isRequired
        name="title"
        value={value.title}
        onChange={(title) => onChange({ ...value, title })}
      >
        <Label>Title</Label>
        <Input ref={titleInputRef} placeholder="Enter book title" variant="secondary" />
        {errors.title ? <FieldError>{errors.title}</FieldError> : null}
      </TextField>
      <TextField
        isInvalid={Boolean(errors.author)}
        isRequired
        name="author"
        value={value.author}
        onChange={(author) => onChange({ ...value, author })}
      >
        <Label>Author</Label>
        <Input placeholder="Enter author name" variant="secondary" />
        {errors.author ? <FieldError>{errors.author}</FieldError> : null}
      </TextField>
    </div>
  );
}

export function BookMetadataFields({
  value,
  onChange,
  categories,
  locations,
}: Pick<BookFieldProps, "value" | "onChange" | "categories" | "locations">) {
  return (
    <div className="bookster-form-grid">
      <BookMultiSelect
        label="Categories"
        placeholder="Select categories"
        value={value.categoryIds}
        items={categories}
        onChange={(categoryIds) => onChange({ ...value, categoryIds })}
      />
      <BookMultiSelect
        label="Locations"
        placeholder="Select locations"
        value={value.locationIds}
        items={locations}
        onChange={(locationIds) => onChange({ ...value, locationIds })}
      />
      <Switch
        className="bookster-sample-switch"
        isSelected={value.isSample}
        onChange={(isSample) => onChange({ ...value, isSample })}
      >
        <Switch.Content>
          <span>Is Sample</span>
          <small>Mark this book as a sample or preview.</small>
        </Switch.Content>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch>
    </div>
  );
}

export function BookFields(props: BookFieldProps) {
  return (
    <div className="bookster-form-grid">
      <BookIdentityFields {...props} />
      <BookMetadataFields {...props} />
    </div>
  );
}

function BookMultiSelect({
  label,
  placeholder,
  value,
  items,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string[];
  items: Array<{ _id: string; label: string }>;
  onChange: (value: string[]) => void;
}) {
  return (
    <Select
      fullWidth
      placeholder={placeholder}
      selectionMode="multiple"
      value={value}
      onChange={(keys) => onChange((keys as Key[]).map(String))}
    >
      <Label>{label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox selectionMode="multiple">
          {items.map((item) => (
            <ListBox.Item key={item._id} id={item._id} textValue={item.label}>
              {item.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
