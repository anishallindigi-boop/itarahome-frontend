import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function Modal({
  form,
  icon,
  title,
}: {
  form: React.ReactNode;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
            {icon} {title}
          </button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {/* Optional description */}
            {/* <DialogDescription>Optional subtitle or instructions</DialogDescription> */}
          </DialogHeader>

          {/* Form content */}
          {form}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}