"use client";

import { useEffect, useRef, useState } from "react";
import { Container, Heading, Box } from "@chakra-ui/react";
import "quill/dist/quill.snow.css";
import Quill from "quill";

function useDebounce<T>(value: T, delayMs = 200): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debouncedValue;
}

export default function QuillPage() {
  const editorElRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const [delta, setDelta] = useState<Record<string, unknown> | null>(null);
  const debouncedDelta = useDebounce(delta, 200);

  useEffect(() => {
    let mounted = true;
    // Keep references for cleanup
    let quillInstance: any | null = null; // eslint-disable-line @typescript-eslint/no-explicit-any
    let handleChange: (() => void) | null = null;
    (async () => {
      const Quill = (await import("quill")).default;
      if (!mounted || !editorElRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const quill: any = new Quill(editorElRef.current, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline"],
            ["link", "image"],
            [{ align: "" }, { align: "center" }, { align: "right" }],
            ["code-block"],
            [{ list: "ordered" }, { list: "bullet" }],
          ],
        },
      });
      quill.setText("Hello Quill\n");
      quillRef.current = quill;
      quillInstance = quill;

      // Initialize and subscribe to changes
      setDelta(quill.getContents());
      handleChange = () => {
        setDelta(quill.getContents());
      };
      quill.on("text-change", handleChange);
    })();
    return () => {
      mounted = false;
      if (quillInstance && handleChange) {
        quillInstance.off("text-change", handleChange);
      }
      quillRef.current = null;
    };
  }, []);
  
  return (
    <Container maxW="100%" p={10}>
      <Heading size="md" mb={4}>Quill</Heading>
      <Box border="1px" borderColor="gray.200" borderRadius="md" h="400px">
        <div ref={editorElRef} />
      </Box>
      <Box mt={12} p={3} border="1px" borderColor="gray.200" borderRadius="md" bg="gray.50">
        <Heading size="sm" mb={2}>Delta (debounced 200ms)</Heading>
        <Box as="pre" whiteSpace="pre-wrap" fontFamily="mono" fontSize="sm" m={0}>
          {debouncedDelta ? JSON.stringify(debouncedDelta, null, 2) : ""}
        </Box>
      </Box>
    </Container>
  );
}


