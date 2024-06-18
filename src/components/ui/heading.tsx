import React, { createElement } from "react";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const headingVariants = cva("scroll-m-20 tracking-tight text-foreground", {
  variants: {
    variant: {
      h1: "text-4xl font-bold",
      h2: "text-3xl font-semibold",
      h3: "text-2xl font-semibold",
      h4: "text-xl font-semibold",
    },
  },
});

export interface HeadingProps
  extends React.ComponentPropsWithRef<"h1">,
    VariantProps<typeof headingVariants> {}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, variant = "h1", ...props }, ref) => {
    const Comp = variant as keyof JSX.IntrinsicElements;

    return createElement(Comp, {
      className: cn(headingVariants({ variant, className })),
      ref,
      ...props,
    });
  }
);
Heading.displayName = "Heading";
