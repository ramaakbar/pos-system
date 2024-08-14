import React, { createElement } from "react";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const textVariants = cva("", {
  variants: {
    variant: {
      default: "text-base leading-7 text-foreground",
      muted: "text-sm text-muted-foreground",
    },
    size: {
      base: "",
      small: "text-sm",
      large: "text-lg",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type As = "p" | "span" | "div" | "label";

export type TextProps = VariantProps<typeof textVariants> &
  JSX.IntrinsicElements[As] & {
    as?: As;
  };

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant, as = "p", ...props }, ref) => {
    return createElement(as, {
      className: cn(textVariants({ variant, className })),
      ref,
      ...props,
    });
  }
);
Text.displayName = "Text";
