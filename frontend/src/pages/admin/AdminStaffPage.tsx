import { Helmet } from 'react-helmet-async';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';

export default function AdminStaffPage() {
  return (
    <>
      <Helmet><title>Staff - Admin - LibraVault</title></Helmet>
      <div className="mb-6">
        <Badge variant="blue" size="md" className="mb-2">Admin</Badge>
        <h1 className="font-heading font-bold text-3xl uppercase">Staff</h1>
      </div>
      <Card color="white" padding="lg" hoverable={false}>
        <p className="font-heading font-bold uppercase">Staff page is available.</p>
        <p className="text-sm text-brutal-dark-gray mt-2">Manage staff accounts and permissions here.</p>
      </Card>
    </>
  );
}
