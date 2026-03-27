import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input, { Select } from '../../components/ui/Input';
import { adminApi } from '../../services/api';

const reportTypes = [
  { value: 'borrowals', label: 'Borrowals' },
  { value: 'fines', label: 'Fines' },
  { value: 'reservations', label: 'Reservations' },
  { value: 'members', label: 'Members' },
  { value: 'books', label: 'Books' },
];

export default function AdminReportsPage() {
  const [type, setType] = useState('borrowals');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const exportMutation = useMutation({
    mutationFn: async () => {
      const params: Record<string, string> = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const blob = await adminApi.exportReport(type, params);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}-report.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },
    onSuccess: () => toast.success('Report downloaded.'),
    onError: () => toast.error('Failed to export report.'),
  });

  return (
    <>
      <Helmet><title>Reports - Admin - LibraVault</title></Helmet>
      <div className="mb-6">
        <Badge variant="blue" size="md" className="mb-2">Admin</Badge>
        <h1 className="font-heading font-bold text-3xl uppercase">Reports</h1>
      </div>

      <Card color="white" padding="lg" hoverable={false}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Report Type"
            options={reportTypes}
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
          <Input
            label="From Date"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <Input
            label="To Date"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div className="mt-5">
          <Button onClick={() => exportMutation.mutate()} isLoading={exportMutation.isPending}>
            Export CSV
          </Button>
        </div>
      </Card>
    </>
  );
}
