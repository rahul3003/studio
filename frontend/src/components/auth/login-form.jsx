
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

// Updated mock users with new roles
const mockUsers = [
  { email: "superadmin@example.com", password: "password", role: "superadmin", name: "Super Admin User" },
  { email: "manager@example.com", password: "password", role: "manager", name: "Manager User" },
  { email: "hr@example.com", password: "password", role: "hr", name: "HR User" },
  { email: "accounts@example.com", password: "password", role: "accounts", name: "Accounts User" },
  { email: "employee@example.com", password: "password", role: "employee", name: "Employee User" },
  // Added some more users for variety if needed for testing different roles
  { email: "alice.manager@example.com", password: "password", role: "manager", name: "Alice Manager" },
  { email: "bob.employee@example.com", password: "password", role: "employee", name: "Bob Employee" },

];


export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values) {
    console.log("Attempting login with:", values);
    toast({
      title: "Login Attempt",
      description: "Simulating login...",
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    const foundUser = mockUsers.find(u => u.email === values.email && u.password === values.password);

    if (foundUser) {
      toast({
        title: "Login Successful",
        description: `Welcome back, ${foundUser.name}!`,
      });
      localStorage.setItem("userRole", foundUser.role); // Current role starts as base role
      localStorage.setItem("userBaseRole", foundUser.role); // Base role is the login role
      localStorage.setItem("userName", foundUser.name);
      localStorage.setItem("userEmail", foundUser.email);
      
      // Dispatch custom event to notify other components/tabs about the login
      window.dispatchEvent(new CustomEvent('authRoleChanged'));
      router.push("/dashboard");

    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
      form.setError("email", { type: "manual", message: " " });
      form.setError("password", { type: "manual", message: "Invalid credentials" });
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} className="pl-10" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Button variant="link" type="button" className="h-auto p-0 text-sm text-accent hover:text-accent/90">
                      Forgot password?
                    </Button>
                  </div>
                  <div className="relative">
                     <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} className="pr-10 pl-10" />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 h-auto -translate-y-1/2 px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </Form>
        <Separator className="my-6" />
        <div className="space-y-4">
            <Button variant="outline" className="w-full">
              {/* Placeholder for Google Icon */}
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /><path fill="none" d="M1 1h22v22H1z" /></svg>
              Sign in with Google
            </Button>
        </div>
        <Alert className="mt-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Mock Credentials</AlertTitle>
          <AlertDescription>
            Use password <code className="font-mono bg-muted px-1 py-0.5 rounded">password</code> with:
            <ul className="list-disc pl-5 mt-1 text-xs">
              <li><code className="font-mono bg-muted px-1 py-0.5 rounded">superadmin@example.com</code></li>
              <li><code className="font-mono bg-muted px-1 py-0.5 rounded">manager@example.com</code></li>
              <li><code className="font-mono bg-muted px-1 py-0.5 rounded">hr@example.com</code></li>
              <li><code className="font-mono bg-muted px-1 py-0.5 rounded">accounts@example.com</code></li>
              <li><code className="font-mono bg-muted px-1 py-0.5 rounded">employee@example.com</code></li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Button variant="link" className="p-0 h-auto text-accent hover:text-accent/90">
            Sign up
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
