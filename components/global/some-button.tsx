import React from "react"
import { Button, ButtonProps } from "../ui/button"
import { cn } from "@/lib/utils" // Import a utility for conditionally joining class names

const AnimatedButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        {...props}
        className={cn(
          `p-5 relative before:absolute before:left-0 before:top-0 before:w-[150%] before:h-[40px] before:bg-slate-700 before:skew-x-[-30deg]
           overflow-hidden before:-translate-x-[110%] hover:before:-translate-x-[10%] before:transition-all before:duration-300 dark:bg-primar dark:before:bg-transparent`,
          className // This allows merging with any custom className passed as a prop
        )}
      >
        <span className="relative">{children}</span>
      </Button>
    )
  }
)

AnimatedButton.displayName = "AnimatedButton"

export default AnimatedButton
