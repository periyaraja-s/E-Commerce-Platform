import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault(); setError(''); setSubmitting(true);
    try { await register(form.name, form.email, form.password); navigate('/'); }
    catch (err) { setError(err.response?.data?.message || 'Unable to create account'); }
    finally { setSubmitting(false); }
  }

  return <main><h1>Create account</h1>{error && <p>{error}</p>}<form onSubmit={handleSubmit}>
    <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
    <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
    <input type="password" placeholder="Password (8+ characters)" minLength="8" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
    <button disabled={submitting}>{submitting ? 'Creating...' : 'Create account'}</button>
  </form><p>Already registered? <Link to="/login">Sign in</Link></p></main>;
}
