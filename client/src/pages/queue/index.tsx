import { useAppointments, useUpdateAppointmentStatus } from "@/hooks/use-appointments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentStatusBadge } from "@/components/ui/status-badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Activity, Clock, PlayCircle, CheckCircle2, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Queue() {
  const { data: appointments, isLoading } = useAppointments();
  const { mutate: updateStatus } = useUpdateAppointmentStatus();

  if (isLoading) return <div className="p-8 animate-pulse text-slate-500">Loading queue...</div>;
  if (!appointments) return null;

  const activeQueue = appointments.filter(a => a.status === 'waiting' || a.status === 'in_consultation');
  const pastQueue = appointments.filter(a => a.status !== 'waiting' && a.status !== 'in_consultation');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Live Queue Manager</h1>
          <p className="text-slate-500 mt-1">Manage and track patient flow in real-time.</p>
        </div>
      </div>

      <Card className="premium-shadow border-border/50 rounded-2xl overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-100 px-6 py-5 bg-slate-50/50">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="text-primary" size={20} />
            Active Patients ({activeQueue.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {activeQueue.length === 0 ? (
             <div className="p-12 text-center text-slate-500">No active patients in queue.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-medium">Patient</th>
                    <th className="px-6 py-4 font-medium">Severity</th>
                    <th className="px-6 py-4 font-medium">Assigned To</th>
                    <th className="px-6 py-4 font-medium">Est. Start / Time</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeQueue.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{apt.patient.name}</div>
                        <div className="text-xs text-slate-500 capitalize">{apt.patient.visitType.replace('_', ' ')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${
                          apt.patient.aiSeverityScore > 7 ? 'bg-red-100 text-red-700' : 
                          apt.patient.aiSeverityScore > 4 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {apt.patient.aiSeverityScore}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700">{apt.doctor?.name || "Unassigned"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Clock size={14} className="text-slate-400" />
                          {apt.predictedStart ? format(new Date(apt.predictedStart), 'HH:mm') : 'Waiting...'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <AppointmentStatusBadge status={apt.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="rounded-lg">Manage</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl">
                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {apt.status === 'waiting' && (
                              <DropdownMenuItem onClick={() => updateStatus({ id: apt.id, status: 'in_consultation' })}>
                                <PlayCircle className="mr-2 h-4 w-4 text-blue-500" /> Start Consultation
                              </DropdownMenuItem>
                            )}
                            {apt.status === 'in_consultation' && (
                              <DropdownMenuItem onClick={() => updateStatus({ id: apt.id, status: 'completed' })}>
                                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Mark Completed
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => updateStatus({ id: apt.id, status: 'cancelled' })} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                              <XCircle className="mr-2 h-4 w-4" /> Cancel Appointment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Past/Completed Queue could go here */}
    </div>
  );
}
