import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Mail, ArrowRight } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function VerifyEmailPage() {
  return (
    <>
      <Helmet><title>Verify Email — LibraVault</title></Helmet>
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-brutal-yellow">
        <div className="w-full max-w-lg">
          <Card color="white" padding="lg" hoverable={false}>
            <Badge variant="blue" size="md" className="mb-3">Almost there</Badge>
            <h1 className="font-heading font-bold text-3xl uppercase mb-3">Verify your email</h1>
            <p className="text-brutal-dark-gray mb-6">
              We’ve sent a verification link to your email address. Open it to activate your account, then come back and sign in.
            </p>

            <div className="border-3 border-brutal-black bg-brutal-gray p-4 shadow-brutal-sm mb-6 flex items-start gap-3">
              <div className="p-2 bg-brutal-yellow border-3 border-brutal-black shadow-brutal-sm">
                <Mail size={20} />
              </div>
              <div>
                <p className="font-heading font-bold uppercase text-sm mb-1">Didn’t get it?</p>
                <p className="text-sm text-brutal-dark-gray">
                  Check spam/junk. If it’s still missing, try registering again with the same email to re-send.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/login" className="flex-1">
                <Button fullWidth iconRight={<ArrowRight size={18} />}>Go to Login</Button>
              </Link>
              <Link to="/" className="flex-1">
                <Button fullWidth variant="outline">Back Home</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

