import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Mail, Lock, User, BookOpen, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type RegisterForm = z.infer<typeof schema>;

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [adminInviteCode, setAdminInviteCode] = useState('');
  const { register: authRegister, loginWithGoogle } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await authRegister(
        data.email,
        data.password,
        data.fullName,
        activeTab,
        activeTab === 'admin' ? adminInviteCode : undefined
      );
      toast.success('Account created! Check your email to verify.');
      navigate('/verify-email');
    } catch (error: any) {
      toast.error(error?.message || 'Registration failed. Email may already be in use.');
    }
  };

  return (
    <>
      <Helmet><title>Register — LibraVault</title></Helmet>
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-brutal-green">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md border-3 border-brutal-black shadow-brutal-xl bg-brutal-white">
          <div className="p-6 border-b-3 border-brutal-black bg-brutal-yellow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-brutal-black border-3 border-brutal-black"><BookOpen size={24} className="text-brutal-yellow" /></div>
              <span className="font-heading font-bold text-2xl uppercase">LibraVault</span>
            </div>
            <h1 className="font-heading font-bold text-3xl uppercase">Create Account</h1>
            <p className="text-sm text-brutal-dark-gray mt-1">Join our community of readers</p>
          </div>

          <div className="flex border-b-3 border-brutal-black">
            {(['user', 'admin'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 font-heading font-bold uppercase text-sm tracking-wider transition-colors
                  ${activeTab === tab ? 'bg-brutal-yellow' : 'bg-brutal-gray hover:bg-brutal-white'}`}
              >
                {tab === 'admin' ? 'Admin Register' : 'User Register'}
              </button>
            ))}
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Full Name" placeholder="John Doe" icon={<User size={18} />} error={errors.fullName?.message} {...register('fullName')} />
              <Input label="Email" type="email" placeholder="john@example.com" icon={<Mail size={18} />} error={errors.email?.message} {...register('email')} />
              {activeTab === 'admin' && (
                <Input
                  label="Admin Invite Code"
                  type="password"
                  placeholder="Enter admin invite code"
                  icon={<Lock size={18} />}
                  value={adminInviteCode}
                  onChange={(e) => setAdminInviteCode(e.target.value)}
                />
              )}
              <div className="relative">
                <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" icon={<Lock size={18} />} error={errors.password?.message} {...register('password')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-brutal-dark-gray">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
              <Input label="Confirm Password" type="password" placeholder="••••••••" icon={<Lock size={18} />} error={errors.confirmPassword?.message} {...register('confirmPassword')} />
              <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
                Create {activeTab === 'admin' ? 'Admin' : 'User'} Account
              </Button>
            </form>
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-[3px] bg-brutal-black" /><span className="font-heading font-bold text-sm uppercase">or</span><div className="flex-1 h-[3px] bg-brutal-black" />
            </div>
            <Button variant="outline" fullWidth onClick={() => loginWithGoogle()}>Continue with Google</Button>
            <p className="text-center mt-6 text-sm">Already have an account? <Link to="/login" className="font-bold text-brutal-coral hover:underline">Sign in</Link></p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
