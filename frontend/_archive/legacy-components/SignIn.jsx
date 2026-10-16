import { useState } from 'react';

function SignIn({ onLogin }) {
  const [email, setEmail] = useState('j.marinus@sabahcocoa.org');
  const [password, setPassword] = useState('••••••••••••');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate successful authentication
    onLogin();
  };

  return (
    <div className="app-viewport">
      <div className="login-card">
        <div className="login-header">
          <span className="badge">FIELD ASSESSMENT UTILITY V2.4</span>
          <h1>CocoaCheck Sabah</h1>
          <p className="subtitle">AI-assisted cocoa bean screening</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2>Sign in</h2>
          <p className="form-hint">Enter your assigned field credentials to begin session.</p>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="primary-btn">
            Sign In
          </button>
        </form>

        <footer className="login-footer">
          <p>Access is provided by your administrator.</p>
          <small>Sabah Cocoa Board • Secure Field Authentication</small>
        </footer>
      </div>
    </div>
  );
}

export default SignIn;