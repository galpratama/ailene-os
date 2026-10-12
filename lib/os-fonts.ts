import { Stack_Sans_Headline, Stack_Sans_Text } from "next/font/google";

const stackSansText = Stack_Sans_Text({
  variable: "--font-stack-text",
  subsets: ["latin"],
});

const stackSansHeadline = Stack_Sans_Headline({
  variable: "--font-stack-headline",
  subsets: ["latin"],
});

// OS-only type; anything portaled out of the OS wrapper (tooltips) needs this class too.
export const osTypeClassName = `${stackSansText.variable} ${stackSansHeadline.variable} os-type`;
