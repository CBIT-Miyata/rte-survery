"use client";

import { ReactNode } from "react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>;
}


