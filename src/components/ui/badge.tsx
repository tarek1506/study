import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[hsl(var(--dark-fill))] text-white",
        accent:
          "bg-[hsl(var(--accent-soft))] text-[hsl(var(--accent))]",
        outline:
          "border border-[hsl(var(--border-subtle))] text-[hsl(var(--text-secondary))]",
        secondary:
          "bg-[hsl(0_0%_93%)] text-[hsl(var(--text-secondary))]",
        programming: "bg-violet-50  text-violet-600  border border-violet-100",
        design:      "bg-pink-50    text-pink-600    border border-pink-100",
        math:        "bg-blue-50    text-blue-600    border border-blue-100",
        science:     "bg-green-50   text-green-600   border border-green-100",
        language:    "bg-orange-50  text-orange-600  border border-orange-100",
        business:    "bg-teal-50    text-teal-600    border border-teal-100",
      },
    },
    defaultVariants: { variant: "secondary" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
