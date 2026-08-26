'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { PageContainer, PageHeader, DataTablePagination } from '../../../components/ui';
import { ExportMenu } from '../../../components/export-menu';
import { Plus, Search, Edit, Trash2, Shield, User, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import { usePermissions } from '../../../hooks/use-auth';
import { useTranslation } from '../../../provider';

export default function UsersListPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { hasPermission, user: currentUser } = usePermissions();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: rolesData } = useQuery<{ items: any[] }>({
    queryKey: ['roles'],
    queryFn: () => api('/roles'),
  });

  const { data, isLoading } = useQuery<{
    items: any[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }>({
    queryKey: ['users', search, roleFilter, statusFilter, page, limit],
    queryFn: () =>
      api(
        `/users?search=${encodeURIComponent(search)}&role=${roleFilter}&status=${statusFilter}&page=${page}&limit=${limit}`
      ),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api(`/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to update user status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      setDeleteId(null);
      setErrorMsg(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to delete user');
    },
  });

  const canCreateUser = hasPermission(['users.create', 'users.manage']);
  const canUpdateUser = hasPermission(['users.update', 'users.manage']);
  const canDeleteUser = hasPermission(['users.delete', 'users.manage']);

  const exportColumns = [
    { key: 'name', header: t('users.user_name') },
    { key: 'email', header: t('common.email') },
    { key: 'phone', header: t('common.phone') },
    { key: 'roleName', header: t('users.role') },
    { key: 'status', header: t('common.status') },
    { key: 'lastLoginAt', header: t('users.last_active'), format: (v: any) => (v ? new Date(v).toLocaleString() : 'Never') },
    { key: 'createdAt', header: t('common.date'), format: (v: any) => (v ? new Date(v).toLocaleDateString() : '—') },
  ];

  return (
    <PageContainer>
      <PageHeader
        title={t('users.title')}
        description={t('users.description')}
        breadcrumbs={[
          { label: t('common.dashboard'), href: '/dashboard' },
          { label: t('users.title') },
        ]}
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            {data?.items && (
              <ExportMenu
                filename="stockpilot-user-directory"
                columns={exportColumns}
                data={data.items}
              />
            )}
            {canCreateUser && (
              <Link href="/dashboard/users/create" className="primary-button">
                <Plus size={16} style={{ marginRight: 6 }} />
                {t('users.add_user')}
              </Link>
            )}
          </div>
        }
      />

      {errorMsg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 16,
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.85rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="table-toolbar" style={{ marginBottom: 16 }}>
        <div className="search">
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder={t('users.search_placeholder')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="ALL">{t('users.all_roles')}</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="SALES">Sales</option>
          <option value="PURCHASE">Purchase</option>
          <option value="ACCOUNTANT">Accountant</option>
          {rolesData?.items.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="ALL">{t('common.all')}</option>
          <option value="ACTIVE">{t('status.active')}</option>
          <option value="INACTIVE">{t('status.inactive')}</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t('users.user')}</th>
              <th>{t('common.phone')}</th>
              <th>{t('users.role')}</th>
              <th>{t('common.status')}</th>
              <th>{t('users.last_active')}</th>
              <th style={{ textAlign: 'right' }}>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 32 }}>
                  {t('common.loading')}
                </td>
              </tr>
            ) : !data?.items || data.items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>
                  {t('users.no_users')}
                </td>
              </tr>
            ) : (
              data.items.map((u) => {
                const isSelf = currentUser?.id === u.id;
                const isSuper = u.role === 'SUPER_ADMIN';

                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.name}
                            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                              color: '#ffffff',
                              display: 'grid',
                              placeItems: 'center',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                            }}
                          >
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                            <Link href={`/dashboard/users/${u.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                              {u.name}
                            </Link>
                            {isSelf && (
                              <span
                                style={{
                                  marginLeft: 6,
                                  fontSize: '0.68rem',
                                  padding: '1px 5px',
                                  borderRadius: 4,
                                  background: '#e0e7ff',
                                  color: '#3730a3',
                                  fontWeight: 600,
                                }}
                              >
                                You
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.82rem', color: '#334155' }}>{u.phone || '—'}</div>
                    </td>

                    <td>
                      <span
                        className="pill"
                        style={{
                          background: isSuper ? '#fef3c7' : '#ede9fe',
                          color: isSuper ? '#92400e' : '#5b21b6',
                          fontWeight: 700,
                        }}
                      >
                        {u.roleName || u.role}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() => {
                          if (isSelf) return;
                          toggleStatusMutation.mutate({
                            id: u.id,
                            status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                          });
                        }}
                        disabled={isSelf || !canUpdateUser}
                        title={isSelf ? 'Cannot deactivate self' : 'Click to toggle status'}
                        style={{
                          background: 'transparent',
                          border: 0,
                          cursor: isSelf || !canUpdateUser ? 'default' : 'pointer',
                          padding: 0,
                        }}
                      >
                        <span className={`pill ${u.status === 'ACTIVE' ? 'success' : ''}`}>
                          {u.status === 'ACTIVE' ? t('status.active') : t('status.inactive')}
                        </span>
                      </button>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <Link
                          href={`/dashboard/users/${u.id}`}
                          className="ghost"
                          style={{ padding: '6px 8px' }}
                          title={t('common.view')}
                        >
                          <Eye size={13} />
                        </Link>

                        {canUpdateUser && (
                          <Link
                            href={`/dashboard/users/${u.id}/edit`}
                            className="ghost"
                            style={{ padding: '6px 8px' }}
                            title={t('common.edit')}
                          >
                            <Edit size={13} />
                          </Link>
                        )}

                        {canDeleteUser && !isSelf && (
                          <button
                            type="button"
                            onClick={() => setDeleteId(u.id)}
                            className="ghost"
                            style={{ padding: '6px 8px', color: '#dc2626', borderColor: '#fecaca' }}
                            title={t('common.delete')}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data?.pagination && (
        <DataTablePagination
          page={page}
          total={data.pagination.total}
          limit={limit}
          onPage={setPage}
          onLimitChange={setLimit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="dialog-backdrop">
          <div className="dialog">
            <h3>{t('users.delete_user')}</h3>
            <p>
              {t('common.delete_confirm')}
            </p>
            <div>
              <button type="button" onClick={() => setDeleteId(null)} disabled={deleteMutation.isPending}>
                {t('common.cancel')}
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? t('common.loading') : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
