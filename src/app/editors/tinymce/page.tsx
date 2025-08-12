"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Box, Container, Heading } from "@chakra-ui/react";

const Editor = dynamic(() => import("@tinymce/tinymce-react").then(m => m.Editor), { ssr: false });

export default function TinyMCEPage() {
  const [html, setHtml] = useState<string>("<p>Hello TinyMCE</p>");

  function useDebounce<T>(value: T, delayMs = 200): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
      const id = setTimeout(() => setDebouncedValue(value), delayMs);
      return () => clearTimeout(id);
    }, [value, delayMs]);
    return debouncedValue;
  }
  const debouncedHtml = useDebounce(html, 200);
  return (
    <Container maxW="100%" p={10}>
      <Heading size="md" mb={4}>TinyMCE</Heading>
      <Editor
        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
        init={{
          menubar: false,
          height: 400,
          plugins: "lists link image code",
          toolbar: "undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code",
        }}
        initialValue="<p>Hello TinyMCE</p>"
        onEditorChange={(content) => setHtml(content)}
      />
      <Box mt={12} p={3} border="1px" borderColor="gray.200" borderRadius="md" bg="gray.50">
        <Heading size="sm" mb={2}>HTML (debounced 200ms)</Heading>
        <Box as="pre" whiteSpace="pre-wrap" fontFamily="mono" fontSize="sm" m={0}>
          {debouncedHtml}
        </Box>
      </Box>
    </Container>
  );
}


