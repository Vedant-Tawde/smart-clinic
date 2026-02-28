import { Badge } from "@/components/ui/badge";

export function AppointmentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    waiting: "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200",
    in_consultation: "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200",
    completed: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200",
    cancelled: "bg-slate-100 text-slate-800 hover:bg-slate-100 border-slate-200",
    no_show: "bg-red-100 text-red-800 hover:bg-red-100 border-red-200",
  };

  const labels: Record<string, string> = {
    waiting: "Waiting",
    in_consultation: "In Consultation",
    completed: "Completed",
    cancelled: "Cancelled",
    no_show: "No Show",
  };

  return (
    <Badge variant="outline" className={`${styles[status] || styles.waiting} px-2.5 py-0.5 rounded-full font-medium shadow-none`}>
      {labels[status] || status}
    </Badge>
  );
}
