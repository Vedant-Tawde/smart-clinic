import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin, useSignup } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Auth() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // separate state for signup to avoid overriding
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const { mutate: login, isPending: isLoginPending } = useLogin();
  const { mutate: signup, isPending: isSignupPending } = useSignup();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLoginSubmit = (e: React.FormEvent) => {
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

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signup(
      { username: signupUsername, password: signupPassword },
      {
        onSuccess: () => {
          toast({
            title: "Account Created",
            description: "You have successfully signed up and logged in.",
          });
          setLocation("/");
        },
        onError: (err) => {
          toast({
            title: "Sign Up Failed",
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
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Welcome to ClinicOS</CardTitle>
          <CardDescription className="text-slate-500">Access your platform</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLoginSubmit} className="space-y-5">
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
                  disabled={isLoginPending}
                >
                  {isLoginPending ? "Authenticating..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignupSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signupUsername" className="text-slate-700 font-medium text-sm">Username</Label>
                  <Input
                    id="signupUsername"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    placeholder="new_user"
                    className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signupPassword" className="text-slate-700 font-medium text-sm">Password</Label>
                  </div>
                  <Input
                    id="signupPassword"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200"
                  disabled={isSignupPending}
                >
                  {isSignupPending ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
