import { Helmet } from 'react-helmet-async';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';

export default function UserProfilePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <>
      <Helmet><title>Profile - User - LibraVault</title></Helmet>

      <div className="mb-6">
        <Badge variant="green" size="md" className="mb-2">User</Badge>
        <h1 className="font-heading font-bold text-3xl uppercase">Profile & Preferences</h1>
      </div>

      <Card color="white" padding="lg" hoverable={false} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-heading font-bold uppercase theme-text-muted">Name</p>
            <p className="font-bold">{user?.full_name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-heading font-bold uppercase theme-text-muted">Email</p>
            <p className="font-bold">{user?.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-heading font-bold uppercase theme-text-muted">Role</p>
            <p className="font-bold uppercase">{user?.role || 'user'}</p>
          </div>
        </div>
      </Card>
    </>
  );
}
