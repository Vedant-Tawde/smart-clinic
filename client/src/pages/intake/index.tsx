import { useState } from "react";
import { useWalkIn } from "@/hooks/use-patients";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { CheckCircle2, UserPlus, AlertCircle } from "lucide-react";

export default function Intake() {
  const { mutate: createWalkIn, isPending } = useWalkIn();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    visitType: "first_time",
    problemDescription: "",
    isEmergency: false,
  });
  
  const [successResult, setSuccessResult] = useState<{score: number, exp: string} | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createWalkIn(
      {
        ...formData,
        age: parseInt(formData.age),
        visitType: formData.visitType as any,
      },
      {
        onSuccess: (data) => {
          setSuccessResult({
            score: data.severityScore,
            exp: data.explanation
          });
          toast({
            title: "Patient Registered",
            description: "AI triage completed successfully.",
          });
          // Reset basic fields
          setFormData(f => ({ ...f, name: "", age: "", problemDescription: "", isEmergency: false }));
        },
        onError: (err) => {
          toast({
            title: "Error",
            description: err.message,
            variant: "destructive",
          });
        }
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Patient Intake</h1>
        <p className="text-slate-500 mt-1">Register walk-in patients and perform AI triage.</p>
      </div>

      {successResult && (
        <Card className="bg-emerald-50 border-emerald-200 premium-shadow">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="mt-1">
              <CheckCircle2 className="text-emerald-600 w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-900">Patient Successfully Triaged</h3>
              <p className="text-emerald-800 mt-1 mb-3">AI assigned a severity score of <strong>{successResult.score}/10</strong>.</p>
              <div className="text-sm bg-white/60 p-3 rounded-lg text-emerald-900 border border-emerald-100">
                <strong>AI Explanation:</strong> {successResult.exp}
              </div>
              <Button 
                variant="outline" 
                className="mt-4 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                onClick={() => setSuccessResult(null)}
              >
                Register Next Patient
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="premium-shadow border-border/50 rounded-2xl bg-white">
        <CardHeader className="border-b border-slate-100 px-6 py-5">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="text-primary w-5 h-5" />
            Registration Form
          </CardTitle>
          <CardDescription>Enter patient details. AI will automatically assess severity and assign to the optimal doctor queue.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                  required 
                  className="rounded-xl h-11"
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input 
                  id="age" 
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(f => ({ ...f, age: e.target.value }))}
                  required 
                  className="rounded-xl h-11"
                  placeholder="e.g. 34"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visitType">Visit Type</Label>
              <Select 
                value={formData.visitType} 
                onValueChange={(val) => setFormData(f => ({ ...f, visitType: val }))}
              >
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="first_time">First Time Visit</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="chronic_management">Chronic Management</SelectItem>
                  <SelectItem value="minor_complaint">Minor Complaint</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="problem">Chief Complaint / Symptoms</Label>
              <Textarea 
                id="problem" 
                required
                value={formData.problemDescription}
                onChange={(e) => setFormData(f => ({ ...f, problemDescription: e.target.value }))}
                className="rounded-xl resize-none min-h-[120px]"
                placeholder="Describe the patient's symptoms in detail. The AI will use this for triage..."
              />
            </div>

            <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <Switch 
                id="emergency" 
                checked={formData.isEmergency}
                onCheckedChange={(checked) => setFormData(f => ({ ...f, isEmergency: checked }))}
              />
              <Label htmlFor="emergency" className="flex items-center gap-2 cursor-pointer font-medium">
                Mark as High Priority / Emergency
                <AlertCircle className="w-4 h-4 text-red-500" />
              </Label>
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200"
                disabled={isPending}
              >
                {isPending ? "Processing via AI Triage..." : "Register & Triage Patient"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
