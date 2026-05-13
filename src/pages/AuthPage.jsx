import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function AuthPage({ mode }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const isLogin = mode === 'login';

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
        await register(form);
        showMessage('success', 'Account created. Welcome.');
      }

      setTimeout(() => navigate('/dashboard'), 500);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Authentication failed';
      showMessage('error', errorMsg);
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
            {isLogin ? 'Wapas aao, Ustaa.' : 'Apni shop digital karo.'}
          </h2>
          <p className="mt-2 text-muted">
            {isLogin ? 'Queue manage karo' : '5 minute mein setup'}
          </p>
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <div>
            <h1 className="font-playfair text-3xl font-bold">
              {isLogin ? 'Login' : 'Account Banao'}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {isLogin ? 'Use your shop owner account.' : 'Create your owner account to add shops.'}
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
              placeholder="Full Name"
              className="w-full rounded border p-3"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
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
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
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
            {loading ? 'Please wait...' : isLogin ? 'Login Karo' : 'Account Banao'}
          </button>
        </form>
      </main>
    </div>
  );
}
