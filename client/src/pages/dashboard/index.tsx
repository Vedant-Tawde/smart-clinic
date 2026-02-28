import { useDashboard } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Zap, Activity, AlertTriangle } from "lucide-react";
import { AppointmentStatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Dashboard() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) return <DashboardSkeleton />;
  if (error || !data) return <div className="p-8 text-red-500">Failed to load dashboard data.</div>;

  const { analytics, queue, doctors } = data;

  const activePatients = queue.filter(q => q.status === 'waiting' || q.status === 'in_consultation');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Clinic Pulse</h1>
        <p className="text-slate-500 mt-1">Real-time overview of clinic operations.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Active Consultations" 
          value={analytics.activeConsultations.toString()} 
          icon={<Users className="text-blue-500" size={20} />} 
          trend="Currently seeing doctors"
        />
        <MetricCard 
          title="Avg Wait Time" 
          value={`${analytics.avgWaitMinutes}m`} 
          icon={<Clock className="text-amber-500" size={20} />} 
          trend="From arrival to consult"
        />
        <MetricCard 
          title="Daily Throughput" 
          value={analytics.dailyThroughput.toString()} 
          icon={<Zap className="text-emerald-500" size={20} />} 
          trend="Patients seen today"
        />
        <MetricCard 
          title="Queue Efficiency" 
          value={analytics.queueEfficiency} 
          icon={<Activity className="text-primary" size={20} />} 
          trend={`Score: ${analytics.optimizationScore}/100`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Queue Preview */}
        <Card className="lg:col-span-2 premium-shadow border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 px-6 py-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Patient Queue
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activePatients.length === 0 ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                <Users size={32} className="text-slate-300 mb-3" />
                <p>No patients currently in queue.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activePatients.slice(0, 5).map((apt) => (
                  <div key={apt.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${apt.patient.aiSeverityScore > 7 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                        {apt.patient.aiSeverityScore}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{apt.patient.name}</h4>
                        <div className="text-xs text-slate-500 flex gap-2 items-center mt-0.5">
                          <span>{apt.patient.visitType.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>Wait: {apt.predictedStart ? format(new Date(apt.predictedStart), 'HH:mm') : 'Calculating...'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium text-slate-900">{apt.doctor?.name || "Unassigned"}</div>
                        <div className="text-xs text-slate-500">Est. {apt.predictedDuration}m</div>
                      </div>
                      <AppointmentStatusBadge status={apt.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Doctor Status */}
        <Card className="premium-shadow border-border/50 rounded-2xl">
          <CardHeader className="bg-white border-b border-slate-100 px-6 py-5">
            <CardTitle className="text-lg font-semibold">Doctor Status</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-slate-100">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="p-4 px-6 flex flex-col gap-2 hover:bg-slate-50/50 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-900">{doctor.name}</span>
                      {doctor.isOverworked ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                          <AlertTriangle size={12} /> Overworked
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Available</span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Fatigue Level</span>
                        <span>{doctor.fatigueScore}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${doctor.fatigueScore > 80 ? 'bg-red-500' : doctor.fatigueScore > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                          style={{ width: `${doctor.fatigueScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <Card className="premium-shadow border-border/50 rounded-2xl bg-white hover:-translate-y-0.5 transition-transform duration-200">
      <CardContent className="p-5 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight text-slate-900">{value}</h3>
          <p className="text-xs text-slate-400 mt-2">{trend}</p>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-xl">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-48 bg-slate-200 rounded-lg"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-[400px] lg:col-span-2 bg-slate-200 rounded-2xl"></div>
        <div className="h-[400px] bg-slate-200 rounded-2xl"></div>
      </div>
    </div>
  );
}
