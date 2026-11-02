import CodeMirror from "@uiw/react-codemirror";
import { Decoration, EditorView, MatchDecorator, ViewPlugin, type DecorationSet, type ViewUpdate } from "@codemirror/view";
import { useMemo } from "react";

const varMark = Decoration.mark({ class: "tok-var" });
const tagMark = Decoration.mark({ class: "tok-tag" });

const matcher = new MatchDecorator({
  regexp: /\{[A-Za-z_][A-Za-z0-9_]*\}|<\/?[A-Za-z_][\w-]*>/g,
  decoration: (m) => (m[0].startsWith("{") ? varMark : tagMark),
});

/** Highlights {VARIABLES} and <xml_tags> as you type. */
const promptHighlighter = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = matcher.createDeco(view);
    }
    update(u: ViewUpdate) {
      this.decorations = matcher.updateDeco(u, this.decorations);
    }
  },
  { decorations: (v) => v.decorations },
);

interface Props {
  value: string;
  onChange?: (v: string) => void;
  label: string;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: string;
  maxHeight?: string;
}

export function PromptEditor({ value, onChange, label, placeholder, readOnly, minHeight = "3.2rem", maxHeight = "26rem" }: Props) {
  const extensions = useMemo(
    () => [EditorView.lineWrapping, promptHighlighter, EditorView.contentAttributes.of({ "aria-label": label })],
    [label],
  );
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      editable={!readOnly}
      readOnly={readOnly}
      theme="none"
      minHeight={minHeight}
      maxHeight={maxHeight}
      extensions={extensions}
      indentWithTab={false}
      basicSetup={{
        lineNumbers: false,
        foldGutter: false,
        highlightActiveLine: false,
        highlightActiveLineGutter: false,
        autocompletion: false,
        bracketMatching: false,
        closeBrackets: false,
        searchKeymap: false,
        highlightSelectionMatches: false,
        dropCursor: false,
        indentOnInput: false,
      }}
    />
  );
}
