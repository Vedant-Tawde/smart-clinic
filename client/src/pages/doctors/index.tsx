import { useState } from "react";
import { useDoctors, useCreateDoctor, useGiveBreak } from "@/hooks/use-doctors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Stethoscope, Coffee, AlertTriangle, PlusCircle } from "lucide-react";

export default function Doctors() {
  const { data: doctors, isLoading } = useDoctors();
  const { mutate: createDoctor, isPending: isCreating } = useCreateDoctor();
  const { mutate: giveBreak, isPending: isBreaking } = useGiveBreak();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "abc",
    specialization: "General Practice",
    workingHoursStart: "09:00",
    workingHoursEnd: "17:00",
    maxDailyCapacity: "20"
  });

  if (isLoading) return <div className="p-8 animate-pulse text-slate-500">Loading staff data...</div>;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createDoctor({
      ...formData,
      name: `Dr. ${formData.name}`,
      maxDailyCapacity: parseInt(formData.maxDailyCapacity)
    }, {
      onSuccess: () => {
        setOpen(false);
        toast({ title: "Doctor Added successfully" });
        setFormData({ name: "", specialization: "General Practice", workingHoursStart: "09:00", workingHoursEnd: "17:00", maxDailyCapacity: "20" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Medical Staff</h1>
          <p className="text-slate-500 mt-1">Manage doctors, monitor fatigue, and allocate breaks.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-md shadow-primary/20">
              <PlusCircle className="mr-2 w-4 h-4" /> Add Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>Add New Medical Staff</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Last Name</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">Dr.</span>
                  <Input required className="pl-9 rounded-xl" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Specialization</Label>
                <Input required className="rounded-xl" value={formData.specialization} onChange={e => setFormData(f => ({ ...f, specialization: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input type="time" required className="rounded-xl" value={formData.workingHoursStart} onChange={e => setFormData(f => ({ ...f, workingHoursStart: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input type="time" required className="rounded-xl" value={formData.workingHoursEnd} onChange={e => setFormData(f => ({ ...f, workingHoursEnd: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Daily Capacity (Patients)</Label>
                <Input type="number" required className="rounded-xl" value={formData.maxDailyCapacity} onChange={e => setFormData(f => ({ ...f, maxDailyCapacity: e.target.value }))} />
              </div>
              <Button type="submit" disabled={isCreating} className="w-full rounded-xl">
                {isCreating ? "Adding..." : "Add Doctor"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors?.map(doctor => (
          <Card key={doctor.id} className="premium-shadow border-border/50 rounded-2xl bg-white overflow-hidden flex flex-col">
            <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/30">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Stethoscope size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{doctor.name}</CardTitle>
                    <p className="text-sm text-slate-500">{doctor.specialization}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Shift</span>
                  <span className="font-medium">{doctor.workingHoursStart} - {doctor.workingHoursEnd}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Capacity</span>
                  <span className="font-medium">{doctor.maxDailyCapacity} pts/day</span>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-600 font-medium">Fatigue Level</span>
                    <span className={`font-bold ${doctor.fatigueScore > 80 ? 'text-red-600' : 'text-slate-700'}`}>{doctor.fatigueScore}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${doctor.fatigueScore > 80 ? 'bg-red-500' : doctor.fatigueScore > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${doctor.fatigueScore}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Button
                  variant={doctor.isOverworked ? "default" : "outline"}
                  className={`w-full rounded-xl ${doctor.isOverworked ? 'bg-amber-500 hover:bg-amber-600 text-white border-0' : ''}`}
                  onClick={() => {
                    giveBreak(doctor.id, {
                      onSuccess: () => toast({ title: "Break Allocated", description: `${doctor.name} is now on a 30m break.` })
                    });
                  }}
                  disabled={isBreaking}
                >
                  <Coffee className="w-4 h-4 mr-2" />
                  {doctor.isOverworked ? "Force Mandatory Break" : "Give 30m Break"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
