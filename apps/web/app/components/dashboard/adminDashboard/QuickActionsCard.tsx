import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import {
  UserPlus,
  Plane,
  ClipboardPlus,
  ArrowDownFromLineIcon,
  CircleAlert,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { LeaveTypeOverview } from "~/components/leaveTypes/leave-types";
import AllHandsOnDeck from "~/components/dashboard/adminDashboard/all-hands-on-deck";

function renderDialogContent(label: string) {
  switch (label) {
    case "Schedule All-Hands":
      return <AllHandsOnDeck />;
    //add other valus later
    default:
      return null;
  }
}

export function QuickActionsCard() {
  const quickActions = [
    {
      Icon: <UserPlus size={28} />,
      label: "Add New User",
      desc: "Register a new team member",
      onClick: () => {},
    },
    {
      Icon: <Plane size={28} />,
      label: "Create Leave Type",
      desc: "Define new leave categories",
      onClick: () => {},
    },
    {
      Icon: <ArrowDownFromLineIcon size={28} />,
      label: "Manage Approval Groups",
      desc: "Set group-level leave policies",
      onClick: () => {},
    },
    {
      Icon: <CircleAlert size={28} />,
      label: "Schedule All-Hands",
      desc: "Plan upcoming team meetings",
      dialog: true,
    },
    {
      Icon: <ClipboardPlus size={28} />,
      label: "Export Reports",
      desc: "Download leave data reports",
      onClick: () => {},
    },
  ];

  return (
    <Card className="col-span-6 rounded border-0">
      <CardHeader className="border-b border-muted">
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Perform actions related to users and approvals.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 rounded">
        {quickActions.map((item, idx) =>
          item.dialog ? (
            <Dialog key={idx}>
              <DialogTrigger asChild>
                <button className="w-full text-left p-3 rounded border-0 hover:bg-accent transition-colors">
                  <div className="flex justify-start items-center gap-2">
                    <div className="rounded-full p-3 bg-muted">{item.Icon}</div>
                    <div className="flex flex-col">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </button>
              </DialogTrigger>
              {renderDialogContent(item.label)}
              {/* {item.label === "Schedule All-Hands" ? <AllHandsOnDeck /> : null} */}
            </Dialog>
          ) : (
            <button
              key={idx}
              onClick={item.onClick}
              className="w-full text-left p-3 rounded border-0 hover:bg-accent transition-colors"
            >
              <div className="flex justify-start items-center gap-2">
                <div className="rounded-full p-3 bg-muted">{item.Icon}</div>
                <div className="flex flex-col">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            </button>
          )
        )}
      </CardContent>
    </Card>
  );
}
