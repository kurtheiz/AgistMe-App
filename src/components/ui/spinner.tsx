import { cn } from "../../lib/utils"

const Spinner = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full", className)}
      {...props}
    />
  )
}

export { Spinner }
