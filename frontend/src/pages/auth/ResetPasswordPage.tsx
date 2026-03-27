import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabaseClient';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Password updated. You can now sign in.');
    } catch (err: any) {
      toast.error(err?.message || 'Password reset failed.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Helmet><title>Reset Password — LibraVault</title></Helmet>
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-brutal-green">
        <div className="w-full max-w-md">
          <Card color="white" padding="lg" hoverable={false}>
            <Badge variant="black" size="md" className="mb-3">Security</Badge>
            <h1 className="font-heading font-bold text-3xl uppercase mb-2">Reset password</h1>
            <p className="text-brutal-dark-gray mb-6">
              Choose a new password for your account.
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  label="New Password"
                  type={show ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  icon={<Lock size={18} />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-9 text-brutal-dark-gray"
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat password"
                icon={<Lock size={18} />}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <Button type="submit" fullWidth isLoading={isSaving}>
                Update Password
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}

