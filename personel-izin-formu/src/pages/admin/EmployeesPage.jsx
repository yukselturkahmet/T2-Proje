import React, { useState } from 'react';
import styled from 'styled-components';
import { CREATE_USER, UPDATE_USER, USERS } from '../../api/operations';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../../components/Button';
import { Dialog, DialogActions } from '../../components/Dialog';
import { EmptyState, LoadError, Loading, Notice, useToast } from '../../components/Feedback';
import { Checkbox, Field, FormGrid, Select } from '../../components/Form';
import { PageBody, PageHeader, Toolbar } from '../../components/Page';
import { Avatar, Card, Tag, initials } from '../../components/Surface';
import { Table } from '../../components/Table';
import { useMutation, useQuery } from '../../hooks/useApi';
import { useI18n } from '../../i18n/I18nProvider';
import { t } from '../../theme/tokens';
import { useFormat } from '../../utils/useFormat';

const EMPTY = {
  username: '', password: '', firstName: '', lastName: '', role: 'EMPLOYEE',
  hireDate: '', birthDate: '', annualLeaveAdjustment: '0', active: true,
};

const Person = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

// Mounted only while open, so the form starts fresh every time.
function EmployeeDialog({ employee, onClose, onSaved }) {
  const { t: tr } = useI18n();
  const format = useFormat();
  const { user: me } = useAuth();
  const isNew = !employee;
  const [form, setForm] = useState(() => (employee
    ? { ...EMPTY, ...employee, birthDate: employee.birthDate || '', annualLeaveAdjustment: String(employee.annualLeaveAdjustment), password: '' }
    : EMPTY));
  const [create, created] = useMutation(CREATE_USER);
  const [update, updated] = useMutation(UPDATE_USER);
  const error = created.error || updated.error;
  const busy = created.loading || updated.loading;

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const common = {
      firstName: form.firstName,
      lastName: form.lastName,
      role: form.role,
      hireDate: form.hireDate,
      birthDate: form.birthDate || null,
      annualLeaveAdjustment: Number(form.annualLeaveAdjustment || 0),
    };
    try {
      if (isNew) {
        await create({ input: { ...common, username: form.username, password: form.password } });
      } else {
        await update({ id: employee.id, input: { ...common, active: form.active, ...(form.password && { newPassword: form.password }) } });
      }
      const name = `${form.firstName} ${form.lastName}`;
      onSaved(tr(isNew ? 'employees.form.created' : 'employees.form.updated', { name }));
    } catch {
      // Shown in the form.
    }
  };

  const isSelf = employee && String(employee.id) === String(me.id);

  return (
    <Dialog
      open
      onClose={onClose}
      width={640}
      title={isNew ? tr('employees.form.addTitle') : tr('employees.form.editTitle', { name: `${employee.firstName} ${employee.lastName}` })}
    >
      <form onSubmit={submit}>
        {error && <Notice $tone="error" style={{ marginBottom: 20 }}>{format.error(error)}</Notice>}
        <FormGrid>
          <Field label={tr('employees.form.firstName')} required maxLength={60} value={form.firstName} onChange={set('firstName')} />
          <Field label={tr('employees.form.lastName')} required maxLength={60} value={form.lastName} onChange={set('lastName')} />
          <Field
            label={tr('employees.form.username')} required disabled={!isNew} autoCapitalize="none" spellCheck={false}
            hint={isNew && tr('employees.form.usernameHint')} value={form.username} onChange={set('username')}
          />
          <Field
            label={tr(isNew ? 'employees.form.password' : 'employees.form.newPassword')}
            type="password" autoComplete="new-password" required={isNew}
            hint={isNew ? tr('password.hint') : tr('employees.form.newPasswordHint')}
            value={form.password} onChange={set('password')}
          />
          <Field label={tr('employees.form.hireDate')} type="date" required value={form.hireDate} onChange={set('hireDate')} />
          <Field label={tr('employees.form.birthDate')} type="date" optional value={form.birthDate} onChange={set('birthDate')} />
          <Field as={Select} label={tr('employees.form.role')} value={form.role} onChange={set('role')} disabled={isSelf}>
            <option value="EMPLOYEE">{tr('employees.roles.EMPLOYEE')}</option>
            <option value="ADMIN">{tr('employees.roles.ADMIN')}</option>
          </Field>
          <Field
            label={tr('employees.form.adjustment')} type="number" step="0.5"
            value={form.annualLeaveAdjustment} onChange={set('annualLeaveAdjustment')}
          />
          <p style={{ gridColumn: '1 / -1', fontSize: 13, color: t.textMuted, marginTop: -6 }}>
            {tr('employees.form.birthDateHint')} {tr('employees.form.adjustmentHint')}
          </p>
          {!isNew && !isSelf && (
            <div style={{ gridColumn: '1 / -1' }}>
              <Checkbox label={tr('employees.form.active')} checked={form.active} onChange={set('active')} />
            </div>
          )}
        </FormGrid>
        <DialogActions>
          <Button $variant="secondary" onClick={onClose}>{tr('common.cancel')}</Button>
          <Button type="submit" disabled={busy}>{tr('common.save')}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export function EmployeesPage() {
  const { t: tr } = useI18n();
  const format = useFormat();
  const toast = useToast();
  const { refresh } = useAuth();
  const [showInactive, setShowInactive] = useState(false);
  const { data, error, loading, reload } = useQuery(USERS, { includeInactive: showInactive });
  const [editing, setEditing] = useState(null); // null = closed, 'new', or a user

  const saved = (message) => {
    setEditing(null);
    toast(message);
    reload();
    refresh();
  };

  const users = data?.users || [];

  return (
    <PageBody>
      <PageHeader
        title={tr('employees.title')}
        intro={tr('employees.intro')}
        actions={<Button onClick={() => setEditing('new')}>{tr('employees.add')}</Button>}
      />

      <Toolbar>
        <Checkbox label={tr('employees.showInactive')} checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
      </Toolbar>

      {error && <LoadError error={error} onRetry={reload} />}
      {loading && !data && <Loading />}
      {data && users.length === 0 && <EmptyState title={tr('employees.title')} />}

      {users.length > 0 && (
        <Card $pad={false} style={{ overflowX: 'auto' }}>
          <Table>
            <thead>
              <tr>
                <th>{tr('employees.name')}</th>
                <th>{tr('employees.role')}</th>
                <th>{tr('employees.hireDate')}</th>
                <th>{tr('employees.service')}</th>
                <th>{tr('employees.balance')}</th>
                <th aria-label={tr('employees.edit')} />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ opacity: u.active ? 1 : 0.55 }}>
                  <td>
                    <Person>
                      <Avatar $size={36}>{initials(u)}</Avatar>
                      <div><strong>{u.firstName} {u.lastName}</strong><small>{u.username}</small></div>
                    </Person>
                  </td>
                  <td>
                    {tr(`employees.roles.${u.role}`)}
                    {!u.active && <> <Tag $tone={t.status.gray}>{tr('employees.inactive')}</Tag></>}
                  </td>
                  <td className="num">{format.date(u.hireDate)}</td>
                  <td className="num">{format.years(u.annualBalance.yearsOfService)}</td>
                  <td className="num">
                    <strong>{format.days(u.annualBalance.available)}</strong>
                    {u.annualBalance.pending > 0 && <small>{tr('dashboard.pending')}: {format.days(u.annualBalance.pending)}</small>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Button $small $variant="ghost" onClick={() => setEditing(u)}>{tr('employees.edit')}</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {editing && (
        <EmployeeDialog
          key={editing === 'new' ? 'new' : editing.id}
          employee={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={saved}
        />
      )}
    </PageBody>
  );
}
