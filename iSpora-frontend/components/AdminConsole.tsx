import React, { useMemo, useEffect, useState } from 'react';
import {
  Admin,
  Resource,
  List,
  Datagrid,
  TextField,
  EmailField,
  DateField,
  TextInput,
  TopToolbar,
  CreateButton,
  ExportButton,
  WrapperField,
  NumberField,
} from 'react-admin';

function useAuthHeaders() {
  const devKey = localStorage.getItem('devKey') || '';
  const token = localStorage.getItem('token') || '';
  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (devKey) headers.set('X-Dev-Key', devKey);
  headers.set('Content-Type', 'application/json');
  return headers;
}

function createDataProvider(baseUrl: string) {
  const apiBase = baseUrl.replace(/\/$/, '');
  return {
    // Users list mapped to /api/admin/users
    getList: async (resource: string, params: any) => {
      const headers = useAuthHeaders();
      const { pagination, filter } = params || {};
      const page = pagination?.page || 1;
      const perPage = pagination?.perPage || 25;
      const search = filter?.q || '';
      const status = filter?.status || 'all';
      const role = filter?.role || 'all';

      let url = `${apiBase}/${resource}`;
      const qs = new URLSearchParams({ page: String(page), limit: String(perPage) });
      if (search) qs.set('search', search);
      if (status) qs.set('status', status);
      if (role) qs.set('role', role);
      url += `?${qs.toString()}`;

      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`Failed to fetch ${resource}`);
      const json = await res.json();
      const data = json.data || [];
      return { data, total: json.total || data.length };
    },
    getOne: async (resource: string, params: any) => {
      const headers = useAuthHeaders();
      const res = await fetch(`${apiBase}/${resource}/${params.id}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      return { data: json.data || json };
    },
    update: async (resource: string, params: any) => {
      const headers = useAuthHeaders();
      const res = await fetch(`${apiBase}/${resource}/${params.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(params.data),
      });
      if (!res.ok) throw new Error('Failed to update');
      const json = await res.json();
      return { data: json.data || json };
    },
    // Fallbacks for other methods if needed
    create: async (resource: string, params: any) => {
      const headers = useAuthHeaders();
      const res = await fetch(`${apiBase}/${resource}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(params.data),
      });
      if (!res.ok) throw new Error('Failed to create');
      const json = await res.json();
      return { data: json.data || json };
    },
    delete: async (resource: string, params: any) => {
      const headers = useAuthHeaders();
      const res = await fetch(`${apiBase}/${resource}/${params.id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Failed to delete');
      return { data: { id: params.id } };
    },
  } as any;
}

// Dashboard showing system stats
function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => {
    const load = async () => {
      const headers = useAuthHeaders();
      const apiBase = (
        import.meta.env.VITE_API_URL || 'https://ispora-backend.onrender.com/api'
      ).replace(/\/$/, '');
      try {
        const res = await fetch(`${apiBase}/admin/stats`, { headers });
        if (res.ok) {
          const json = await res.json();
          setStats(json.data || json);
        }
      } catch {}
    };
    load();
  }, []);

  if (!stats) return <div style={{ padding: 16 }}>Loading metrics...</div>;

  return (
    <div
      style={{
        padding: 16,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: 16,
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ fontSize: 12, color: '#6b7280' }}>Total Users</div>
        <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.totalUsers}</div>
      </div>
      <div
        style={{
          background: '#fff',
          padding: 16,
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ fontSize: 12, color: '#6b7280' }}>Active Users</div>
        <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.activeUsers}</div>
      </div>
      <div
        style={{
          background: '#fff',
          padding: 16,
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ fontSize: 12, color: '#6b7280' }}>Projects</div>
        <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.totalProjects}</div>
      </div>
      <div
        style={{
          background: '#fff',
          padding: 16,
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ fontSize: 12, color: '#6b7280' }}>Opportunities</div>
        <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.totalOpportunities}</div>
      </div>
    </div>
  );
}

// Users List with filters
const userFilters = [
  <TextInput key="q" source="q" label="Search" alwaysOn />,
  <TextInput key="status" source="status" label="Status" />,
  <TextInput key="role" source="role" label="Role" />,
];

function UsersList() {
  return (
    <List
      filters={userFilters}
      perPage={25}
      actions={
        <TopToolbar>
          <CreateButton />
          <ExportButton />
        </TopToolbar>
      }
    >
      <Datagrid rowClick="show">
        <TextField source="id" />
        <TextField source="name" />
        <EmailField source="email" />
        <TextField source="role" />
        <TextField source="status" />
        <DateField source="joinDate" label="Joined" />
        <DateField source="lastActive" label="Last Active" />
        <NumberField source="projects" />
        <NumberField source="contributions" />
      </Datagrid>
    </List>
  );
}

export default function AdminConsole() {
  const apiBase = (
    import.meta.env.VITE_API_URL || 'https://ispora-backend.onrender.com/api'
  ).replace(/\/$/, '');
  const dataProvider = useMemo(() => createDataProvider(apiBase), [apiBase]);

  return (
    <Admin dataProvider={dataProvider} basename="/admin-console" dashboard={Dashboard}>
      <Resource name="admin/users" options={{ label: 'Users' }} list={UsersList} />
      <Resource name="admin/reports" options={{ label: 'Reports' }} list={List} />
    </Admin>
  );
}
