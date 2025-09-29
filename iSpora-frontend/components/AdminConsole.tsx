import React, { useMemo } from 'react';
import { Admin, Resource, ListGuesser, EditGuesser, ShowGuesser } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';

export default function AdminConsole() {
  const apiBase = (import.meta.env.VITE_API_URL || 'https://ispora-backend.onrender.com/api').replace(/\/$/, '');
  const devKey = localStorage.getItem('devKey') || '';
  const token = localStorage.getItem('token') || '';

  const dataProvider = useMemo(() => simpleRestProvider(apiBase, (url: string, options: any = {}) => {
    options.headers = new Headers(options.headers || {});
    if (token) options.headers.set('Authorization', `Bearer ${token}`);
    if (devKey) options.headers.set('X-Dev-Key', devKey);
    options.headers.set('Content-Type', 'application/json');
    return fetch(url, options);
  }), [apiBase, devKey, token]);

  return (
    <Admin dataProvider={dataProvider} basename="/admin-console">
      <Resource name="admin/users" list={ListGuesser} show={ShowGuesser} edit={EditGuesser} />
      <Resource name="feed" list={ListGuesser} show={ShowGuesser} />
      <Resource name="admin/reports" list={ListGuesser} show={ShowGuesser} />
    </Admin>
  );
}


