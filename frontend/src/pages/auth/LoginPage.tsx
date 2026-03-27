import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Mail, Lock, BookOpen, Eye, EyeOff, User as UserIcon, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof schema>;

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
  const [showPassword, setShowPassword] = useState(false);
  const { login, logout, loginWithGoogle, loginAsGuest } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const role = await login(data.email, data.password);

      if (activeTab === 'admin' && role !== 'admin') {
        await logout();
        toast.error('This account does not have admin access.');
        return;
      }

      toast.success('Welcome back!');
      navigate(role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    } catch {
      toast.error('Invalid email or password. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    try { await loginWithGoogle(); } catch { toast.error('Google login failed.'); }
  };

  const handleGuest = (role: 'user' | 'admin') => {
    loginAsGuest(role);
    toast.success(`Logged in as Guest ${role === 'admin' ? 'Admin' : 'User'}.`);
    navigate(role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
  };

  const isAdmin = activeTab === 'admin';

  return (
    <>
      <Helmet><title>Login — LibraVault</title></Helmet>
      <div className={`min-h-screen flex items-center justify-center px-4 py-12 ${isAdmin ? 'bg-brutal-black' : 'bg-brutal-yellow'}`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-md border-3 border-brutal-black shadow-brutal-xl ${isAdmin ? 'bg-brutal-dark-gray' : 'bg-brutal-white'}`}>
          {/* Header */}
          <div className={`p-6 border-b-3 border-brutal-black ${isAdmin ? 'bg-brutal-coral' : 'bg-brutal-yellow'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-brutal-black border-3 border-brutal-black"><BookOpen size={24} className="text-brutal-yellow" /></div>
              <span className={`font-heading font-bold text-2xl uppercase ${isAdmin ? 'text-white' : ''}`}>LibraVault</span>
            </div>
            <h1 className={`font-heading font-bold text-3xl uppercase ${isAdmin ? 'text-white' : ''}`}>Sign In</h1>
          </div>

          {/* Role Tabs */}
          <div className="flex border-b-3 border-brutal-black">
            {(['user', 'admin'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 font-heading font-bold uppercase text-sm tracking-wider transition-colors
                  ${activeTab === tab
                    ? (isAdmin ? 'bg-brutal-coral text-white' : 'bg-brutal-yellow')
                    : (isAdmin ? 'bg-brutal-dark-gray text-brutal-gray hover:bg-brutal-black' : 'bg-brutal-gray hover:bg-brutal-white')
                  }`}>
                {tab === 'admin' ? '🛡️ Admin' : '👤 User'}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Email" type="email" placeholder="your@email.com" icon={<Mail size={18} />} error={errors.email?.message} {...register('email')} />
              <div className="relative">
                <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" icon={<Lock size={18} />} error={errors.password?.message} {...register('password')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-brutal-dark-gray">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end"><Link to="/forgot-password" className="text-sm font-bold text-brutal-coral hover:underline">Forgot password?</Link></div>
              <Button type="submit" fullWidth size="lg" isLoading={isSubmitting} variant={isAdmin ? 'danger' : 'primary'}>
                Sign In as {activeTab}
              </Button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className={`flex-1 h-[3px] ${isAdmin ? 'bg-brutal-dark-gray' : 'bg-brutal-black'}`} />
              <span className={`font-heading font-bold text-sm uppercase ${isAdmin ? 'text-brutal-gray' : ''}`}>or</span>
              <div className={`flex-1 h-[3px] ${isAdmin ? 'bg-brutal-dark-gray' : 'bg-brutal-black'}`} />
            </div>

            <Button variant="outline" fullWidth onClick={handleGoogleLogin}>Continue with Google</Button>

            <div className="mt-3">
              <Button
                variant={isAdmin ? 'danger' : 'secondary'}
                fullWidth
                onClick={() => handleGuest(activeTab)}
                icon={isAdmin ? <Shield size={18} /> : <UserIcon size={18} />}
              >
                Continue as Guest {isAdmin ? 'Admin' : 'User'}
              </Button>
            </div>

            <p className={`text-center mt-6 text-sm ${isAdmin ? 'text-brutal-gray' : ''}`}>
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-brutal-coral hover:underline">Register here</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
