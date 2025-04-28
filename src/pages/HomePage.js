import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Weather from '../components/Weather';
import Auth from '../components/Auth';
import { supabase } from '../supabase';
import './HomePage.css';

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [catches, setCatches] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      const fetchCatches = async () => {
        const { data, error } = await supabase
          .from('catches')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(5);
        if (error) {
          console.error('Error fetching catches:', error);
        } else {
          setCatches(data.map(catchItem => ({
            description: `${catchItem.fish_type} - ${catchItem.length}" (${catchItem.date})`,
            image: catchItem.image_url,
          })));
        }
      };
      fetchCatches();
    } else {
      setCatches([]);
    }
  }, [user]);

  return (
    <div className="homepage">
      <Auth setUser={setUser} user={user} />
      <div className="weather-section">
        <Weather />
      </div>
      <div className="features">
        <Link to="/gear-guide" className="feature-card">Gear Guide</Link>
        <Link to="/catch-log" className="feature-card">Catch Log</Link>
        <Link to="/tides" className="feature-card">Tides</Link>
      </div>
      <h2>Recent Catches</h2>
      <div className="recent-catches">
        {catches.length > 0 ? (
          catches.map((catchItem, index) => (
            <div key={index} className="catch">
              <div>{catchItem.description}</div>
              {catchItem.image && (
                <img src={catchItem.image} alt={catchItem.description} style={{ maxWidth: '100%', maxHeight: '150px', marginTop: '5px' }} />
              )}
            </div>
          ))
        ) : (
          <p className="catch">No catches logged yet.</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;