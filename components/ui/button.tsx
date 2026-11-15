import * as React from "react";
import { cn } from "cn";

// Primary: ink background, white text, 8px radius. Ghost: for quiet in-panel actions.
const VARIANT = {
  primary: "bg-ink text-white hover:bg-ink/90",
  ghost: "bg-transparent text-graphite hover:bg-rule/60 hover:text-ink",
};

type Props = React.ComponentProps<"button"> & { variant?: keyof typeof VARIANT };

function Button({ className, variant = "primary", type = "button", ...props }: Props) {
  return (
    <button
      type={type}
      data-slot="button"
      className={cn(
        "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-[15px] font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
        VARIANT[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Button };
