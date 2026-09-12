import { FieldError, Input, Label, ListBox, Select, Switch, TextField } from "@heroui/react";
import type { BooksterBook, BooksterCategory, BooksterLocation } from "../types";

export type BookFormValue = Pick<
  BooksterBook,
  "title" | "author" | "categoryIds" | "locationIds" | "isSample"
>;

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
  showSampleDescription = true,
}: Pick<BookFieldProps, "value" | "onChange" | "categories" | "locations"> & {
  showSampleDescription?: boolean;
}) {
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
          <span>Sample edition</span>
          {showSampleDescription ? <small>Mark this book as a sample or preview.</small> : null}
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

function BookMultiSelect<Id extends string>({
  label,
  placeholder,
  value,
  items,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: Id[];
  items: Array<{ _id: Id; label: string }>;
  onChange: (value: Id[]) => void;
}) {
  return (
    <Select
      fullWidth
      placeholder={placeholder}
      selectionMode="multiple"
      value={value}
      onChange={(keys) => onChange(keys as Id[])}
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
