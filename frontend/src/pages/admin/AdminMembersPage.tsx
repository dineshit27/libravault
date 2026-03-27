import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Users } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { memberApi } from '../../services/api';

export default function AdminMembersPage() {
  const membersQuery = useQuery({
    queryKey: ['members'],
    queryFn: () => memberApi.getAll(),
  });

  const items = membersQuery.data?.data || (membersQuery.data as any) || [];

  return (
    <>
      <Helmet><title>Members — Admin — LibraVault</title></Helmet>
      <div className="mb-6">
        <Badge variant="blue" size="md" className="mb-2">Admin</Badge>
        <h1 className="font-heading font-bold text-3xl uppercase">Manage Members</h1>
      </div>

      {membersQuery.isLoading ? (
        <Card color="white" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase">Loading…</p>
        </Card>
      ) : membersQuery.isError ? (
        <Card color="coral" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase text-white">Failed to load members.</p>
        </Card>
      ) : Array.isArray(items) && items.length === 0 ? (
        <Card color="yellow" padding="lg" hoverable={false}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brutal-white border-3 border-brutal-black shadow-brutal-sm">
              <Users size={20} />
            </div>
            <div>
              <p className="font-heading font-bold uppercase">No members found</p>
              <p className="text-sm text-brutal-dark-gray">Try again later.</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {(items as any[]).map((m) => (
            <Card key={m.id} color="white" padding="md" hoverable={false}>
              <p className="font-heading font-bold uppercase">{m.full_name || m.email || 'Member'}</p>
              <p className="text-sm text-brutal-dark-gray">
                Role: <span className="font-bold">{m.role || 'user'}</span>
              </p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

