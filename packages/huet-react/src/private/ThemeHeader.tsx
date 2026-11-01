import saveAs from "file-saver";
import {
  IconCheck,
  IconCopyPlus,
  IconDownload,
  IconPencil,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import React, { useRef, useState } from "react";

import { useThemeConfigurator } from "../context";
import { readThemeFile } from "./Button";
import { Badge, Button } from "./ui/button";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "./ui/menu";

/** Renames in place: Enter or leaving the field saves, Escape cancels. */
function RenameField({ name, onDone }: { name: string; onDone: (next?: string) => void }) {
  return (
    <input
      aria-label="Theme name"
      autoFocus
      defaultValue={name}
      onFocus={(event) => event.currentTarget.select()}
      onBlur={(event) => onDone(event.currentTarget.value.trim())}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") onDone();
      }}
      className="huet-border-30 hc:min-w-0 hc:grow hc:text-[1.5em] hc:font-semibold hc:leading-tight hc:border-b-2 hc:cursor-text"
    />
  );
}

/**
 * The theme's name as the tab's title, with a pencil to rename it and a "⋯"
 * menu for import, export and list changes. An edited theme says what it was
 * edited from, with Reset, Save and Save as new.
 */
export default function ThemeHeader() {
  const { theme, setTheme, name, editedFrom, reset, list, themes } = useThemeConfigurator();
  const [isRenaming, setIsRenaming] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const isEdited = name === undefined;
  const title = name ?? editedFrom ?? "Custom";
  const canRename = list && name !== undefined;
  const canRemove = list && name !== undefined && Object.keys(themes).length > 1;

  const exportTheme = () => {
    const blob = new Blob([JSON.stringify(theme, null, 2)], { type: "application/json;charset=utf-8" });
    saveAs(blob, `${title} Huet Theme.json`);
  };
  const importTheme = (file: File) =>
    readThemeFile(file, (imported, fileName) => (list ? list.add(fileName, imported) : setTheme(imported)));

  return (
    <div className="hc:flex hc:flex-col hc:gap-[.625em] hc:px-[1.25em] hc:pt-[1.125em] hc:pb-[.25em]">
      <div className="hc:flex hc:items-center hc:gap-[.25em] hc:min-h-[2.25em]">
        {isRenaming && canRename ? (
          <RenameField
            name={name}
            onDone={(next) => {
              if (next) list.rename(name, next);
              setIsRenaming(false);
            }}
          />
        ) : (
          <h2 className="hc:text-[1.5em] hc:font-semibold hc:leading-tight hc:truncate">{title}</h2>
        )}
        {canRename && !isRenaming && (
          <Button variant="ghost" size="icon-sm" aria-label="Rename theme" title="Rename" onClick={() => setIsRenaming(true)}>
            <IconPencil size="1em" stroke={2} />
          </Button>
        )}
        {isRenaming && (
          // Leaving the field saves; this is there to click
          <Button variant="ghost" size="icon-sm" aria-label="Save name" title="Save name">
            <IconCheck size="1em" stroke={2} />
          </Button>
        )}
        <span className="hc:grow" />
        <DropdownMenu label="Theme actions">
          <DropdownMenuItem icon={<IconUpload size="1em" />} onClick={() => fileInput.current?.click()}>
            Import theme…
          </DropdownMenuItem>
          <DropdownMenuItem icon={<IconDownload size="1em" />} onClick={exportTheme}>
            Export theme
          </DropdownMenuItem>
          {list && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem icon={<IconCopyPlus size="1em" />} onClick={list.saveAsNew}>
                {isEdited ? "Save as new theme" : "Duplicate"}
              </DropdownMenuItem>
            </>
          )}
          {canRemove && (
            <DropdownMenuItem icon={<IconTrash size="1em" />} verify={`Remove ${name}?`} onClick={() => list.remove(name)}>
              Remove
            </DropdownMenuItem>
          )}
        </DropdownMenu>
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) importTheme(file);
          }}
        />
      </div>
      {isEdited && (
        <div className="hc:flex hc:items-center hc:gap-[.375em] hc:flex-wrap">
          <Badge>Edited</Badge>
          {editedFrom !== undefined && <span className="huet-text-60">from {editedFrom}</span>}
          <span className="hc:grow" />
          {editedFrom !== undefined && (
            <Button variant="ghost" size="sm" verify={`Discard your edits and go back to ${editedFrom}?`} onClick={reset}>
              Reset
            </Button>
          )}
          {list && editedFrom !== undefined && (
            <Button
              variant="secondary"
              size="sm"
              verify={`Save your edits over ${editedFrom}?`}
              onClick={() => list.update(editedFrom, theme)}
            >
              Save
            </Button>
          )}
          {list && (
            <Button variant="primary" size="sm" onClick={list.saveAsNew}>
              Save as new
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
