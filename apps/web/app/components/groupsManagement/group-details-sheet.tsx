import type { Group } from "~/routes/admin/groups-management";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";

interface Props {
  group: Group | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GroupDetailsSheet({ group, open, onOpenChange }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[1280px] max-w-[100vw] rounded-0 md:rounded-tl-2xl p-0 pb-0 overflow-auto md:overflow-hidden md:max-w-[60vw] gap-0">
        <div className="Side sheet">{group?.groupName}</div>
      </SheetContent>
    </Sheet>
  );
}
