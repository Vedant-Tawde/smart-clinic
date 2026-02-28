import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: login, isPending } = useLogin();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(
      { username, password },
      {
        onSuccess: () => {
          setLocation("/");
        },
        onError: (err) => {
          toast({
            title: "Authentication Failed",
            description: err.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/5 blur-3xl" />
      </div>

      <Card className="w-full max-w-md premium-shadow border-border/50 bg-white/80 backdrop-blur-xl z-10 rounded-2xl">
        <CardHeader className="space-y-3 pb-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary mx-auto flex items-center justify-center text-white shadow-lg shadow-primary/30 mb-2">
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Sign in to ClinicOS</CardTitle>
          <CardDescription className="text-slate-500">Enter your admin credentials to access the system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-700 font-medium text-sm">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700 font-medium text-sm">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200" 
              disabled={isPending}
            >
              {isPending ? "Authenticating..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
