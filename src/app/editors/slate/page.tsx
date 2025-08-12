"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Container, Heading } from "@chakra-ui/react";
import { createEditor, Transforms, Editor, Element as SlateElement, Node, Range, Descendant } from "slate";
import { Slate, Editable, withReact, useSlate, RenderElementProps, RenderLeafProps } from "slate-react";
import type { BaseEditor } from "slate";
import type { ReactEditor } from "slate-react";

type Align = "left" | "center" | "right";
type CustomText = { text: string; bold?: boolean };
type ParagraphElement = { type: "paragraph"; align?: Align; children: (CustomText | LinkElement)[] };
type CodeElement = { type: "code"; align?: Align; children: CustomText[] };
type LinkElement = { type: "link"; url: string; children: CustomText[] };
type CustomElement = ParagraphElement | CodeElement | LinkElement;
type AlignableElement = SlateElement & { align?: Align };
type CustomEditor = BaseEditor & ReactEditor;

export default function SlatePage() {
  const editor = useMemo<CustomEditor>(() => withInlines(withReact(createEditor()) as CustomEditor), []);
  const initialValue = useMemo(() => [{ type: "paragraph", children: [{ text: "Hello Slate" }] }], []);
  const [value, setValue] = useState<Descendant[] | null>(initialValue as unknown as Descendant[]);

  function useDebounce<T>(v: T, delayMs = 200): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(v);
    useEffect(() => {
      const id = setTimeout(() => setDebouncedValue(v), delayMs);
      return () => clearTimeout(id);
    }, [v, delayMs]);
    return debouncedValue;
  }
  const debouncedValue = useDebounce(value, 200);

  // local helper type guards
  const isElementType = (n: Node, type: CustomElement["type"]): n is CustomElement =>
    SlateElement.isElement(n) && (n as CustomElement).type === type;

  function Toolbar() {
    const editor = useSlate();
    const marks = Editor.marks(editor) as { bold?: boolean } | null;
    const isBoldActive = Boolean(marks?.bold);

    const toggleBold = () => {
      const current = Editor.marks(editor) as { bold?: boolean } | null;
      const isActive = current?.bold === true;
      if (isActive) {
        Editor.removeMark(editor, "bold");
      } else {
        Editor.addMark(editor, "bold", true);
      }
    };
    const toggleCodeBlock = () => {
      const [match] = Editor.nodes(editor, { match: n => isElementType(n, "code") });
      const nextType: ParagraphElement["type"] | CodeElement["type"] = match ? "paragraph" : "code";
      Transforms.setNodes<ParagraphElement | CodeElement>(
        editor,
        { type: nextType } as Partial<ParagraphElement | CodeElement>,
        { match: n => SlateElement.isElement(n) }
      );
    };

    const isLinkActive = () => {
      const [match] = Editor.nodes(editor, { match: n => isElementType(n, "link") });
      return Boolean(match);
    };

    const unwrapLink = () => {
      Transforms.unwrapNodes(editor, { match: n => isElementType(n, "link") });
    };

    const wrapLink = (url: string) => {
      if (isLinkActive()) unwrapLink();
      const { selection } = editor;
      const link: Partial<LinkElement> = {
        type: "link",
        url,
        children: [],
      };
      if (selection && Range.isCollapsed(selection)) {
        Transforms.insertNodes(editor, {
          ...(link as LinkElement),
          children: [{ text: url }],
        });
      } else {
        Transforms.wrapNodes(editor, link as LinkElement, { split: true });
        Transforms.collapse(editor, { edge: "end" });
      }
    };

    const toggleLink = async () => {
      if (isLinkActive()) {
        unwrapLink();
        return;
      }
      // 簡易実装: promptでURL入力
      const url = window.prompt("Enter URL:");
      if (!url) return;
      wrapLink(url);
    };

    const setAlign = (align: Align) => {
      Transforms.setNodes<AlignableElement>(editor, { align }, {
        match: n => SlateElement.isElement(n) && !isElementType(n, "link"),
      });
    };

    const isAlignActive = (align: Align) => {
      const [match] = Editor.nodes(editor, {
        match: n => SlateElement.isElement(n) && (n as AlignableElement).align === align,
      });
      return Boolean(match);
    };
    return (
      <Box mb={3} display="flex" gap={2}>
        <Button size="sm" variant={isBoldActive ? "solid" : "outline"} onClick={toggleBold}>Bold</Button>
        <Button size="sm" onClick={toggleCodeBlock}>Code Block</Button>
        <Button size="sm" onClick={toggleLink} variant={isLinkActive() ? "solid" : "outline"}>Link</Button>
        <Button size="sm" onClick={() => setAlign("left")} variant={isAlignActive("left") ? "solid" : "outline"}>Left</Button>
        <Button size="sm" onClick={() => setAlign("center")} variant={isAlignActive("center") ? "solid" : "outline"}>Center</Button>
        <Button size="sm" onClick={() => setAlign("right")} variant={isAlignActive("right") ? "solid" : "outline"}>Right</Button>
      </Box>
    );
  }

  const renderElement = useCallback((props: RenderElementProps) => {
    const { element, attributes, children } = props;
    const alignStyle = { textAlign: (element as AlignableElement).align ?? undefined } as React.CSSProperties;
    const elementType = (element as CustomElement).type;
    if (elementType === "code") {
      return (
        <pre {...attributes} style={{ margin: 0, padding: "8px", background: "#f7fafc", ...alignStyle }}>
          <code>{children}</code>
        </pre>
      );
    }
    if (elementType === "link") {
      const url = (element as LinkElement).url;
      return (
        <a {...attributes} href={url} target="_blank" rel="noopener noreferrer" style={{ color: "#3182ce", textDecoration: "underline" }}>
          {children}
        </a>
      );
    }
    return (
      <p {...attributes} style={alignStyle}>
        {children}
      </p>
    );
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    const { attributes, children } = props;
    const leaf = props.leaf as CustomText;
    let rendered: React.ReactNode = children;
    if (leaf.bold) {
      rendered = <strong>{rendered}</strong>;
    }
    return <span {...attributes}>{rendered}</span>;
  }, []);

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
      event.preventDefault();
      const current = Editor.marks(editor) as { bold?: boolean } | null;
      if (current?.bold) {
        Editor.removeMark(editor, "bold");
      } else {
        Editor.addMark(editor, "bold", true);
      }
    }
  }, [editor]);

  return (
    <Container maxW="100%" p={10}>
      <Heading size="md" mb={4}>Slate</Heading>
      <Box border="1px" borderColor="gray.200" borderRadius="md" p={3}>
        <Slate editor={editor} initialValue={initialValue} onChange={(v) => setValue(v as Descendant[])}>
          <Toolbar />
          <Editable
            placeholder="Enter some text..."
            style={{ minHeight: "400px" }}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={onKeyDown}
          />
        </Slate>
      </Box>
      <Box mt={12} p={3} border="1px" borderColor="gray.200" borderRadius="md" bg="gray.50">
        <Heading size="sm" mb={2}>Slate JSON (debounced 200ms)</Heading>
        <Box as="pre" whiteSpace="pre-wrap" fontFamily="mono" fontSize="sm" m={0}>
          {debouncedValue ? JSON.stringify(debouncedValue, null, 2) : ""}
        </Box>
      </Box>
    </Container>
  );
}

function withInlines(editor: CustomEditor): CustomEditor {
  const { isInline } = editor;
  editor.isInline = (element: SlateElement) => {
    return (element as Partial<LinkElement>).type === "link" ? true : isInline(element);
  };
  return editor;
}


