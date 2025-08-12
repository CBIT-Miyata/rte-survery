"use client";

import { useEffect, useState } from "react";
import { Box, Button, Container, Heading } from "@chakra-ui/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";

export default function TipTapPage() {
  function useDebounce<T>(value: T, delayMs = 200): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
      const id = setTimeout(() => setDebouncedValue(value), delayMs);
      return () => clearTimeout(id);
    }, [value, delayMs]);
    return debouncedValue;
  }

  const [json, setJson] = useState<Record<string, unknown> | null>(null);
  const debounced = useDebounce(json, 200);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ autolink: true, openOnClick: true, linkOnPaste: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image,
    ],
    content: "<p>Hello TipTap</p>",
    immediatelyRender: false,
    editorProps: { attributes: { style: "min-height:240px;padding:12px;border:1px solid #e2e8f0;border-radius:8px;" } },
    onUpdate({ editor }) {
      setJson(editor.getJSON() as unknown as Record<string, unknown>);
    },
  });

  return (
    <Container maxW="100%" p={10}>
      <Heading size="md" mb={4}>TipTap</Heading>
      <Box mb={3} display="flex" flexWrap="wrap" gap={2}>
        <Button size="sm" onClick={() => editor?.chain().focus().toggleBold().run()}>Bold</Button>
        <Button size="sm" onClick={() => {
          const url = window.prompt("Link URL?")?.trim();
          if (!url) return;
          editor?.chain().focus().setLink({ href: url }).run();
        }}>Link</Button>
        <Button size="sm" onClick={() => {
          const src = window.prompt("Image URL?")?.trim();
          if (!src) return;
          editor?.chain().focus().setImage({ src }).run();
        }}>Image</Button>
        <Button size="sm" onClick={() => editor?.chain().focus().setTextAlign("left").run()}>Left</Button>
        <Button size="sm" onClick={() => editor?.chain().focus().setTextAlign("center").run()}>Center</Button>
        <Button size="sm" onClick={() => editor?.chain().focus().setTextAlign("right").run()}>Right</Button>
        <Button size="sm" onClick={() => editor?.chain().focus().toggleCodeBlock().run()}>Code Block</Button>
      </Box>
      <Box>
        <EditorContent editor={editor} />
      </Box>
      <Box mt={12} p={3} border="1px" borderColor="gray.200" borderRadius="md" bg="gray.50">
        <Heading size="sm" mb={2}>ProseMirror JSON (debounced 200ms)</Heading>
        <Box as="pre" whiteSpace="pre-wrap" fontFamily="mono" fontSize="sm" m={0}>
          {debounced ? JSON.stringify(debounced, null, 2) : ""}
        </Box>
      </Box>
    </Container>
  );
}


