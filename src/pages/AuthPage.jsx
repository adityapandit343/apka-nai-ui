import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { getApiErrorMessage } from '../utils/apiError';

export default function AuthPage({ mode, role = 'ShopOwner' }) {
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = mode === 'login';
  const isCustomer = role === 'Customer';
  const registerPath = isCustomer ? '/customer/register' : '/register';
  const loginPath = isCustomer ? '/customer/login' : '/login';

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password });
        showMessage('success', 'Login successful. Redirecting...');
      } else {
        await register(form, role);
        showMessage('success', 'Account created. Welcome.');
      }

      const redirectTo = location.state?.from?.pathname || (isCustomer ? '/customer/' : '/dashboard');
      setTimeout(() => navigate(redirectTo), 500);
    } catch (error) {
      showMessage('error', getApiErrorMessage(error, 'Authentication failed.'));
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex bg-ink p-8 text-cream md:w-2/5 md:p-12">
        <div className="my-auto">
          <Link to="/" className="font-playfair text-2xl font-bold text-gold">
            CutBook
          </Link>
          <h2 className="mt-10 font-playfair text-4xl font-bold">
            {isCustomer
              ? isLogin ? 'Welcome back.' : 'Create your customer account.'
              : isLogin ? 'Welcome back.' : 'Bring your shop online.'}
          </h2>
          <p className="mt-2 text-muted">
            {isCustomer
              ? 'Find salons, request services, and track your turn.'
              : 'Manage requests, live queues, and shop availability.'}
          </p>
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <div>
            <h1 className="font-playfair text-3xl font-bold">
              {isLogin ? 'Login' : 'Create account'}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {isLogin
                ? `Use your ${isCustomer ? 'customer' : 'shop owner'} account.`
                : `Create a ${isCustomer ? 'customer' : 'shop owner'} account.`}
            </p>
          </div>

          {message.text && (
            <div
              className={`rounded border p-3 text-center font-medium ${
                message.type === 'success'
                  ? 'border-green-300 bg-green-100 text-green-800'
                  : 'border-red-300 bg-red-100 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          {!isLogin && (
            <input
              type="text"
              placeholder="Full name"
              className="w-full rounded border p-3"
              value={form.fullName}
              onChange={(event) => updateField('fullName', event.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded border p-3"
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
            required
          />
          {!isLogin && (
            <input
              type="tel"
              placeholder="Phone"
              className="w-full rounded border p-3"
              value={form.phoneNumber}
              onChange={(event) => updateField('phoneNumber', event.target.value)}
              required
            />
          )}
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded border p-3"
            value={form.password}
            onChange={(event) => updateField('password', event.target.value)}
            required

          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-gold py-3 font-bold text-ink transition hover:bg-gold-light disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create account'}
          </button>

          <p className="text-center text-sm text-muted">
            {isLogin ? 'Need an account?' : 'Already have an account?'}{' '}
            <Link className="font-semibold text-gold" to={isLogin ? registerPath : loginPath}>
              {isLogin ? 'Create one' : 'Login'}
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
