import { useEffect, useMemo, useRef } from "react";
import { ComboBox, Input, Label, ListBox } from "@heroui/react";
import { rankCatalogueMatches } from "../../../../convex/thingsDomain";
import { useThingsData } from "../context/ThingsDataContext";

const keepPreRankedMatch = () => true;

type CatalogueComboBoxProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmitRequest?: () => void;
  label: string;
  placeholder?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  errorId?: string;
  shouldFocus?: boolean;
};

export function CatalogueComboBox({
  value,
  onChange,
  onSubmitRequest,
  label,
  placeholder,
  isDisabled = false,
  isInvalid = false,
  errorId,
  shouldFocus = false,
}: CatalogueComboBoxProps) {
  const { catalogue } = useThingsData();
  const inputRef = useRef<HTMLInputElement>(null);
  const selectionHandledEnterRef = useRef(false);
  const selectedKey = useMemo(
    () => catalogue.find((item) => item.canonicalName === value)?._id ?? null,
    [catalogue, value],
  );
  const matches = useMemo(
    () => (value.trim() ? rankCatalogueMatches(catalogue, value) : []),
    [catalogue, value],
  );

  useEffect(() => {
    if (shouldFocus) inputRef.current?.focus();
  }, [shouldFocus]);

  return (
    <ComboBox
      allowsCustomValue
      allowsEmptyCollection
      className="things-combobox"
      defaultFilter={keepPreRankedMatch}
      inputValue={value}
      isDisabled={isDisabled}
      menuTrigger="input"
      selectedKey={selectedKey}
      onInputChange={onChange}
      onSelectionChange={(key) => {
        const selected = catalogue.find((item) => item._id === key);
        if (selected) {
          selectionHandledEnterRef.current = true;
          onChange(selected.canonicalName);
        }
      }}
    >
      <Label className="sr-only">{label}</Label>
      <ComboBox.InputGroup>
        <Input
          ref={inputRef}
          aria-label={label}
          aria-describedby={errorId}
          aria-invalid={isInvalid || undefined}
          placeholder={placeholder}
          onKeyDown={(event) => {
            if (
              event.key !== "Enter" ||
              event.nativeEvent.isComposing ||
              onSubmitRequest === undefined
            ) {
              return;
            }

            if (event.currentTarget.getAttribute("aria-activedescendant")) return;

            selectionHandledEnterRef.current = false;
            window.setTimeout(() => {
              if (!selectionHandledEnterRef.current) onSubmitRequest();
            }, 0);
          }}
        />
      </ComboBox.InputGroup>
      {value.trim() && (
        <ComboBox.Popover className="things-glass things-glass--popover">
          <ListBox
            items={matches}
            renderEmptyState={() => (
              <p className="things-combobox__empty">Press Enter to add “{value.trim()}”</p>
            )}
          >
            {(item) => (
              <ListBox.Item id={item._id} textValue={item.canonicalName}>
                {item.canonicalName}
              </ListBox.Item>
            )}
          </ListBox>
        </ComboBox.Popover>
      )}
    </ComboBox>
  );
}
