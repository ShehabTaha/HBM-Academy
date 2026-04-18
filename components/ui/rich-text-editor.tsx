"use client";

import React, { useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Type,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Indent,
  Outdent,
  Link,
  Minus,
  Quote,
  Undo2,
  Redo2,
  Code,
  Highlighter,
  Superscript,
  Subscript,
  X,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
  disabled?: boolean;
}

const EDITOR_STYLES = `
  .rte-content:empty:before {
    content: attr(data-placeholder);
    color: #9ca3af;
    pointer-events: none;
    display: block;
  }
  .rte-content h1 { font-size: 2rem; font-weight: bold; margin: 0.5rem 0; }
  .rte-content h2 { font-size: 1.5rem; font-weight: bold; margin: 0.5rem 0; }
  .rte-content h3 { font-size: 1.25rem; font-weight: bold; margin: 0.5rem 0; }
  .rte-content h4 { font-size: 1.125rem; font-weight: bold; margin: 0.5rem 0; }
  .rte-content blockquote { border-left: 4px solid #d1d5db; padding-left: 1rem; font-style: italic; color: #6b7280; margin: 1rem 0; }
  .rte-content pre { background: #f3f4f6; border-radius: 4px; padding: 0.5rem; font-family: monospace; font-size: 0.875rem; overflow-x: auto; }
  .rte-content ul { list-style-type: disc; padding-left: 1.5rem; margin: 1rem 0; }
  .rte-content ol { list-style-type: decimal; padding-left: 1.5rem; margin: 1rem 0; }
  .rte-content a { color: #2563eb; text-decoration: underline; }
  .rte-content hr { border: 0; border-top: 1px solid #d1d5db; margin: 1rem 0; }
  .rte-content p { margin: 0.5rem 0; }
`;

function ToolBtn({
  onClick,
  title,
  children,
  active,
  disabled,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault(); // keep focus in editor
        onClick();
      }}
      className={`h-7 w-7 flex items-center justify-center rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed
        ${
          active
            ? "bg-blue-100 text-blue-700"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
    >
      {children}
    </button>
  );
}

const Sep = () => <div className="w-px h-5 bg-gray-300 mx-0.5 shrink-0" />;

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter content here...",
  minHeight = 150,
  className = "",
  disabled = false,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  // Sync incoming value into the contentEditable (only when not focused or on first load)
  useEffect(() => {
    if (!editorRef.current) return;
    const current = editorRef.current.innerHTML;
    if (
      current !== value &&
      (document.activeElement !== editorRef.current || isInitialLoad.current)
    ) {
      editorRef.current.innerHTML = value;
      isInitialLoad.current = false;
    }
  }, [value]);

  const handleInput = () => {
    const html = editorRef.current?.innerHTML ?? "";
    onChange(html);
  };

  const exec = (command: string, val?: string) => {
    if (disabled) return;
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    handleInput();
  };

  const insertLink = () => {
    if (disabled) return;
    const url = prompt("Enter URL:");
    if (url) exec("createLink", url);
  };

  return (
    <div className={`border rounded-md shadow-sm overflow-hidden ${className}`}>
      <style>{EDITOR_STYLES}</style>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-0.5 p-2 border-b bg-gray-50 flex-wrap">

        {/* Undo / Redo */}
        <ToolBtn onClick={() => exec("undo")} title="Undo" disabled={disabled}>
          <Undo2 size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("redo")} title="Redo" disabled={disabled}>
          <Redo2 size={14} />
        </ToolBtn>

        <Sep />

        {/* Block format */}
        <select
          title="Text style"
          disabled={disabled}
          className="h-7 text-xs border rounded px-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:opacity-40 disabled:cursor-not-allowed"
          defaultValue=""
          onChange={(e) => {
            exec("formatBlock", e.target.value);
            e.target.value = "";
          }}
        >
          <option value="" disabled>Style</option>
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="blockquote">Blockquote</option>
          <option value="pre">Code block</option>
        </select>

        {/* Font size */}
        <select
          title="Font size"
          disabled={disabled}
          className="h-7 text-xs border rounded px-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:opacity-40 disabled:cursor-not-allowed"
          defaultValue=""
          onChange={(e) => {
            exec("fontSize", e.target.value);
            e.target.value = "";
          }}
        >
          <option value="" disabled>Size</option>
          <option value="1">Tiny</option>
          <option value="2">Small</option>
          <option value="3">Normal</option>
          <option value="4">Medium</option>
          <option value="5">Large</option>
          <option value="6">X-Large</option>
          <option value="7">Huge</option>
        </select>

        <Sep />

        {/* Inline formatting */}
        <ToolBtn onClick={() => exec("bold")} title="Bold" disabled={disabled}>
          <Bold size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("italic")} title="Italic" disabled={disabled}>
          <Italic size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("underline")} title="Underline" disabled={disabled}>
          <Underline size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("strikeThrough")} title="Strikethrough" disabled={disabled}>
          <Strikethrough size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("superscript")} title="Superscript" disabled={disabled}>
          <Superscript size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("subscript")} title="Subscript" disabled={disabled}>
          <Subscript size={14} />
        </ToolBtn>

        <Sep />

        {/* Text & highlight color */}
        <label
          title="Text color"
          className={`relative h-7 w-7 flex items-center justify-center rounded hover:bg-gray-100 ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <Type size={14} className="text-gray-600" />
          <input
            type="color"
            disabled={disabled}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
            onChange={(e) => exec("foreColor", e.target.value)}
            title="Text color"
          />
        </label>
        <label
          title="Highlight color"
          className={`relative h-7 w-7 flex items-center justify-center rounded hover:bg-gray-100 ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <Highlighter size={14} className="text-gray-600" />
          <input
            type="color"
            disabled={disabled}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
            onChange={(e) => exec("hiliteColor", e.target.value)}
            title="Highlight color"
          />
        </label>

        <Sep />

        {/* Alignment */}
        <ToolBtn onClick={() => exec("justifyLeft")} title="Align left" disabled={disabled}>
          <AlignLeft size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("justifyCenter")} title="Align center" disabled={disabled}>
          <AlignCenter size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("justifyRight")} title="Align right" disabled={disabled}>
          <AlignRight size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("justifyFull")} title="Justify" disabled={disabled}>
          <AlignJustify size={14} />
        </ToolBtn>

        <Sep />

        {/* Lists */}
        <ToolBtn onClick={() => exec("insertUnorderedList")} title="Bullet list" disabled={disabled}>
          <List size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("insertOrderedList")} title="Numbered list" disabled={disabled}>
          <ListOrdered size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("outdent")} title="Decrease indent" disabled={disabled}>
          <Outdent size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("indent")} title="Increase indent" disabled={disabled}>
          <Indent size={14} />
        </ToolBtn>

        <Sep />

        {/* Extras */}
        <ToolBtn onClick={insertLink} title="Insert link" disabled={disabled}>
          <Link size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("insertHorizontalRule")} title="Horizontal rule" disabled={disabled}>
          <Minus size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("formatBlock", "blockquote")} title="Blockquote" disabled={disabled}>
          <Quote size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("formatBlock", "pre")} title="Code block" disabled={disabled}>
          <Code size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("removeFormat")} title="Clear formatting" disabled={disabled}>
          <X size={14} />
        </ToolBtn>
      </div>

      {/* ── Editable area ── */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={handleInput}
        className={`rte-content w-full p-4 outline-none resize-y text-sm ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`}
        data-placeholder={placeholder}
        style={{ minHeight }}
      />
    </div>
  );
}
