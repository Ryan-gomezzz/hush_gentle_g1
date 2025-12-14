import * as React from "react"
import { cn } from "@/utils/cn"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost"
    size?: "sm" | "md" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-sage-500 text-white hover:bg-sage-600 shadow-sm": variant === "primary",
                        "bg-beige-300 text-sage-900 hover:bg-beige-400": variant === "secondary",
                        "border-2 border-sage-500 text-sage-700 hover:bg-sage-50": variant === "outline",
                        "hover:bg-sage-50 text-sage-700": variant === "ghost",

                        "h-9 px-4 text-sm": size === "sm",
                        "h-11 px-8 text-base": size === "md",
                        "h-14 px-10 text-lg": size === "lg",
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
