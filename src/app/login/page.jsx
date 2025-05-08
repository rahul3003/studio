
import { LoginForm } from '@/components/auth/login-form';
import { Rocket } from 'lucide-react'; // Or a more suitable logo icon

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <div className="mb-8 flex items-center space-x-2 text-primary">
        <Rocket className="h-10 w-10" />
        <h1 className="text-4xl font-bold">HRMS portal</h1>
      </div>
      <LoginForm />
    </div>
  );
}
