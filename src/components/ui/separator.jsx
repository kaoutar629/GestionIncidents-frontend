import * as React from "react";

const Separator = React.forwardRef(
  ({ className = "", orientation = "horizontal", decorative = true, ...props }, ref) => (
    <div
      ref={ref}
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      className={[
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className,
      ].join(" ")}
      {...props}
    />
  )
);
Separator.displayName = "Separator";

export { Separator };
