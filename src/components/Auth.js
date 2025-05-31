import React, { useState } from 'react';
import { supabase } from '../supabase';
import "../styles/Auth.css";

const Auth = ({ setUser, user }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data, error } = isSignup
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;
      setUser(data.user);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) setError(error.message);
    else setUser(null);
  };

  return (
    <div className="auth-container">
      {user ? (
        <div>
          <p>Logged in as: {user.email}</p>
          <button onClick={handleLogout} className="auth-button">
            Log Out
          </button>
        </div>
      ) : (
        <>
          <h2>{isSignup ? 'Sign Up' : 'Log In'}</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
          />
          {error && <p>{error}</p>}
          <button onClick={handleAuth} className="auth-button">
            {isSignup ? 'Sign Up' : 'Log In'}
          </button>
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="auth-button auth-button-secondary"
          >
            {isSignup ? 'Switch to Log In' : 'Switch to Sign Up'}
          </button>
        </>
      )}
    </div>
  );
};

export default Auth;