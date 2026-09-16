import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import { useAuth, getRoleHome } from '../../hooks/useAuth';
import { Button, Input, Alert } from '../../components';
import './LoginPage.css';

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already logged in → redirect home
  React.useEffect(() => {
    if (user) navigate(getRoleHome(user.role), { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      // redirect handled by useEffect above
    } catch {
      setError('Incorrect email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Brand mark */}
        <div className="login-card__brand">
          <div className="login-card__brand-icon">
            <Ticket size={24} />
          </div>
          <span className="login-card__brand-name">HelpDesk AI</span>
        </div>

        <h1 className="login-card__title">Sign in to your account</h1>

        {error && (
          <Alert variant="error">{error}</Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="login-card__fields">
            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={loading}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="login-card__hint">
          <span>Forgot your password?</span>{' '}
          <span className="login-card__hint-action">Contact your IT administrator.</span>
        </p>

        {/* Test credentials hint */}
        <div className="login-card__demo">
          <p className="login-card__demo-title">Demo accounts (password: <code>password</code>)</p>
          <div className="login-card__demo-rows">
            {[
              { role: 'Employee', email: 'alice@corp.com' },
              { role: 'Agent',    email: 'carol@corp.com' },
              { role: 'Manager',  email: 'frank@corp.com' },
              { role: 'Admin',    email: 'grace@corp.com' },
            ].map(a => (
              <button
                key={a.email}
                className="login-card__demo-btn"
                type="button"
                onClick={() => { setEmail(a.email); setPassword('password'); }}
              >
                <strong>{a.role}</strong>
                <span>{a.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
