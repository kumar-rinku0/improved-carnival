/**
 * Props for ReusableDialog component.
 */
export interface ReusableDialogProps {
    /** Whether the dialog is open. */
    open: boolean
    /** Called when open state should change. */
    onOpenChange: (open: boolean) => void
    /** Main title shown in the header. */
    title: string
    /** Optional description shown beneath the title. */
    description?: string
    /** The main content of the dialog. */
    children: React.ReactNode
    /** Optional footer (e.g. buttons). */
    footer?: React.ReactNode
    /** Optional trigger element (e.g. a button) to open the dialog. */
    trigger?: React.ReactNode
    /** Extra className(s) to override or extend styles. */
    className?: string
  }
  