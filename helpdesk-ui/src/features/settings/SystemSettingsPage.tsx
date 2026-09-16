import React, { useState } from 'react';
import { Button, Input, Select, Alert, useToast } from '../../components';

export function SystemSettingsPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Mock settings state
  const [settings, setSettings] = useState({
    companyName: 'Acme Corp',
    supportEmail: 'support@acmecorp.com',
    aiConfidenceThreshold: '0.85',
    autoAssign: 'true',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate save
    setTimeout(() => {
      setLoading(false);
      addToast('System settings saved successfully');
    }, 800);
  };

  return (
    <div className="page" style={{ maxWidth: '600px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <span className="page-subtitle">Configure system-wide behavior</span>
        </div>
      </div>

      <Alert variant="info">
        Note: These are global settings that apply to all users and agents.
      </Alert>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)', marginTop: 'var(--sp-4)' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <h2 style={{ fontSize: 'var(--text-h3)', margin: 0, borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--sp-2)' }}>
            General
          </h2>
          <Input
            label="Company Name"
            value={settings.companyName}
            onChange={e => setSettings({ ...settings, companyName: e.target.value })}
            required
          />
          <Input
            label="Support Email (Fallback)"
            type="email"
            value={settings.supportEmail}
            onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <h2 style={{ fontSize: 'var(--text-h3)', margin: 0, borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--sp-2)' }}>
            AI & Automation
          </h2>
          <Select
            label="AI Auto-classification Confidence Threshold"
            value={settings.aiConfidenceThreshold}
            onChange={e => setSettings({ ...settings, aiConfidenceThreshold: e.target.value })}
            options={[
              { value: '0.95', label: 'Very High (0.95) - Safer, more manual triage' },
              { value: '0.85', label: 'High (0.85) - Recommended' },
              { value: '0.70', label: 'Medium (0.70) - More automated, potential misclassifications' },
            ]}
          />
          <Select
            label="Ticket Routing"
            value={settings.autoAssign}
            onChange={e => setSettings({ ...settings, autoAssign: e.target.value })}
            options={[
              { value: 'true', label: 'Auto-assign to available agents' },
              { value: 'false', label: 'Leave unassigned in queue' },
            ]}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--sp-4)' }}>
          <Button type="submit" variant="primary" loading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
