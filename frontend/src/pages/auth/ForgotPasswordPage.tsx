import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const schema = z.object({ email: z.string().email('Enter a valid email') });

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuthStore();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ email: string }>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: { email: string }) => {
    try { await forgotPassword(data.email); toast.success('Password reset link sent to your email!'); } catch { toast.error('Failed to send reset link.'); }
  };

  return (
    <>
      <Helmet><title>Forgot Password — LibraVault</title></Helmet>
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-brutal-yellow">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md border-3 border-brutal-black shadow-brutal-xl bg-brutal-white">
          <div className="p-6 border-b-3 border-brutal-black bg-brutal-coral">
            <h1 className="font-heading font-bold text-3xl uppercase text-white">Reset Password</h1>
            <p className="text-white/80 text-sm mt-1">We'll send you a reset link</p>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Email Address" type="email" placeholder="your@email.com" icon={<Mail size={18} />} error={errors.email?.message} {...register('email')} />
              <Button type="submit" fullWidth size="lg" isLoading={isSubmitting} variant="danger">Send Reset Link</Button>
            </form>
            <Link to="/login" className="flex items-center gap-2 justify-center mt-6 font-bold text-sm text-brutal-coral hover:underline"><ArrowLeft size={16} /> Back to login</Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
