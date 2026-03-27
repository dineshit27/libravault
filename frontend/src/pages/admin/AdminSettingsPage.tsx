import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { adminApi } from '../../services/api';

type SettingsForm = {
  library_name: string;
  contact_email: string;
  contact_phone: string;
  fine_per_day: string;
  default_borrow_days: string;
  max_renewals: string;
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SettingsForm>({
    library_name: '',
    contact_email: '',
    contact_phone: '',
    fine_per_day: '0',
    default_borrow_days: '14',
    max_renewals: '2',
  });

  const settingsQuery = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => adminApi.getSettings(),
  });

  useEffect(() => {
    if (!settingsQuery.data) return;

    setForm({
      library_name: settingsQuery.data.library_name || '',
      contact_email: settingsQuery.data.contact_email || '',
      contact_phone: settingsQuery.data.contact_phone || '',
      fine_per_day: String(settingsQuery.data.fine_per_day ?? 0),
      default_borrow_days: String(settingsQuery.data.default_borrow_days ?? 14),
      max_renewals: String(settingsQuery.data.max_renewals ?? 2),
    });
  }, [settingsQuery.data]);

  const saveSettings = useMutation({
    mutationFn: () =>
      adminApi.updateSettings({
        library_name: form.library_name,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        fine_per_day: Number(form.fine_per_day),
        default_borrow_days: Number(form.default_borrow_days),
        max_renewals: Number(form.max_renewals),
      }),
    onSuccess: async () => {
      toast.success('Settings saved.');
      await settingsQuery.refetch();
    },
    onError: () => toast.error('Failed to save settings.'),
  });

  return (
    <>
      <Helmet><title>Settings - Admin - LibraVault</title></Helmet>
      <div className="mb-6">
        <Badge variant="blue" size="md" className="mb-2">Admin</Badge>
        <h1 className="font-heading font-bold text-3xl uppercase">Settings</h1>
      </div>

      {settingsQuery.isLoading ? (
        <Card color="white" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase">Loading...</p>
        </Card>
      ) : settingsQuery.isError ? (
        <Card color="coral" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase text-white">Failed to load settings.</p>
        </Card>
      ) : (
        <Card color="white" padding="lg" hoverable={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Library Name"
              value={form.library_name}
              onChange={(e) => setForm((prev) => ({ ...prev, library_name: e.target.value }))}
            />
            <Input
              label="Contact Email"
              type="email"
              value={form.contact_email}
              onChange={(e) => setForm((prev) => ({ ...prev, contact_email: e.target.value }))}
            />
            <Input
              label="Contact Phone"
              value={form.contact_phone}
              onChange={(e) => setForm((prev) => ({ ...prev, contact_phone: e.target.value }))}
            />
            <Input
              label="Fine Per Day"
              type="number"
              value={form.fine_per_day}
              onChange={(e) => setForm((prev) => ({ ...prev, fine_per_day: e.target.value }))}
            />
            <Input
              label="Default Borrow Days"
              type="number"
              value={form.default_borrow_days}
              onChange={(e) => setForm((prev) => ({ ...prev, default_borrow_days: e.target.value }))}
            />
            <Input
              label="Max Renewals"
              type="number"
              value={form.max_renewals}
              onChange={(e) => setForm((prev) => ({ ...prev, max_renewals: e.target.value }))}
            />
          </div>
          <div className="mt-5">
            <Button onClick={() => saveSettings.mutate()} isLoading={saveSettings.isPending}>
              Save Settings
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
