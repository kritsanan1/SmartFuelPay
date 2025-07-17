import * as React from "react"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { DialogTitle } from "@/components/ui/dialog"

interface HiddenDialogTitleProps {
  children: React.ReactNode
}

export function HiddenDialogTitle({ children }: HiddenDialogTitleProps) {
  return (
    <VisuallyHidden.Root>
      <DialogTitle>{children}</DialogTitle>
    </VisuallyHidden.Root>
  )
}