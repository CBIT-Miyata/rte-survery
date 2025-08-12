"use client";

import { useEffect, useState } from "react";
import { Box, Button, Container, Heading } from "@chakra-ui/react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND } from "lexical";
import { LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { CodeNode } from "@lexical/code";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";

function useDebounce<T>(value: T, delayMs = 200): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debouncedValue;
}

function Placeholder() {
  return <div style={{ position: "absolute", top: 10, left: 12, color: "#A0AEC0" }}>Enter some text...</div>;
}

export default function LexicalPage() {
  const [editorStateJSON, setEditorStateJSON] = useState<Record<string, unknown> | null>(null);
  const debouncedJSON = useDebounce(editorStateJSON, 200);
  const initialConfig = {
    namespace: "lexical-editor",
    theme: {},
    nodes: [HeadingNode, QuoteNode, LinkNode, CodeNode],
    onError(error: Error) {
      throw error;
    },
  };

  const Toolbar = () => {
    const [editor] = useLexicalComposerContext();
    return (
      <Box mb={3} display="flex" flexWrap="wrap" gap={2} position="absolute" top={-10} left={20} right={20} zIndex={1000}>
        <Button size="sm" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}>
          Bold
        </Button>
        <Button size="sm" onClick={() => {
          const url = window.prompt("Link URL?")?.trim();
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, url || null);
        }}>Link</Button>
        <Button size="sm" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}>Left</Button>
        <Button size="sm" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}>Center</Button>
        <Button size="sm" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}>Right</Button>
      </Box>
    );
  }

  return (
    <Container maxW="100%" p={10}>
      <Heading size="md" mb={4}>Lexical</Heading>
      <Box position="relative">
        <LexicalComposer initialConfig={initialConfig} >
          <Toolbar />
          <RichTextPlugin
            contentEditable={
              <ContentEditable style={{ minHeight: 160, padding: 12, border: "1px solid #E2E8F0", borderRadius: 8 }} />
            }
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin onChange={(state) => setEditorStateJSON(state.toJSON() as unknown as Record<string, unknown>)} />
          <HistoryPlugin />
        </LexicalComposer>
      </Box>
      <Box mt={12} p={3} border="1px" borderColor="gray.200" borderRadius="md" bg="gray.50">
        <Heading size="sm" mb={2}>Lexical State (debounced 200ms)</Heading>
        <Box as="pre" whiteSpace="pre-wrap" fontFamily="mono" fontSize="sm" m={0}>
          {debouncedJSON ? JSON.stringify(debouncedJSON, null, 2) : ""}
        </Box>
      </Box>
    </Container>
  );
}


