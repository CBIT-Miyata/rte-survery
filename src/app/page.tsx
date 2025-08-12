"use client";

import { Box, Container, Heading, Stack, Text, Link as ChakraLink } from "@chakra-ui/react";
import NextLink from "next/link";

export default function Home() {
  return (
    <Container maxW="100%" p={10}>
      <Stack gap={6}>
        <Heading size="lg">RTE Survey</Heading>
        <Text color="gray.600">
          リッチテキストエディタのライブラリ比較検証用リポジトリ。
        </Text>
        <Box as="ul" listStyleType="disc" pl={5} display="grid" rowGap={2}>
          <Box as="li"><ChakraLink as={NextLink} href="/editors/tiptap" color="teal.600">TipTap</ChakraLink></Box>
          <Box as="li"><ChakraLink as={NextLink} href="/editors/lexical" color="teal.600">Lexical</ChakraLink></Box>
          <Box as="li"><ChakraLink as={NextLink} href="/editors/quill" color="teal.600">Quill</ChakraLink></Box>
          <Box as="li"><ChakraLink as={NextLink} href="/editors/tinymce" color="teal.600">TinyMCE</ChakraLink></Box>
          <Box as="li"><ChakraLink as={NextLink} href="/editors/slate" color="teal.600">Slate</ChakraLink></Box>
        </Box>
      </Stack>
    </Container>
  );
}
