import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase'; // Adjust path as needed
import './CatchLog.css';

const CatchLog = () => {
  const [catchEntry, setCatchEntry] = useState({
    fishType: '',
    length: '',
    date: '',
    image: null,
  });
  const [catches, setCatches] = useState([]);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [user, setUser] = useState(null);

  // Fetch the authenticated user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  // Fetch catches from Supabase
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
          setError('Failed to load catches.');
        } else {
          setCatches(data.map(catchItem => ({
            description: `${catchItem.fish_type} - ${catchItem.length}" (${catchItem.date})`,
            image: catchItem.image_url,
          })));
        }
      };
      fetchCatches();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCatchEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result;
        setCatchEntry((prev) => ({ ...prev, image: base64String }));
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please upload a valid image file (e.g., JPG, PNG).');
      setCatchEntry((prev) => ({ ...prev, image: null }));
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting catch with user:', user);
    console.log('Catch entry:', catchEntry);
    if (!user) {
      setError('Please log in to log a catch.');
      return;
    }
    if (!catchEntry.fishType || !catchEntry.length || !catchEntry.date) {
      setError('Please fill in all fields (except image, which is optional).');
      return;
    }
  
    let imageUrl = null;
    if (catchEntry.image) {
      const timestamp = Date.now();
      const file = dataURLtoFile(catchEntry.image, `catch-${timestamp}.png`);
      console.log('Uploading image:', file);
      const { data, error: uploadError } = await supabase.storage
        .from('catch-photos')
        .upload(`${user.id}/${file.name}`, file, { upsert: false });
      if (uploadError) {
        console.error('Image upload error:', uploadError);
        setError(`Failed to upload image: ${uploadError.message}, but catch will still be saved.`);
      } else {
        console.log('Upload response data:', data); // Log the response
        imageUrl = supabase.storage.from('catch-photos').getPublicUrl(data.path).data.publicUrl; // Use data.path directly
        console.log('Image uploaded, public URL:', imageUrl);
      }
    }
  
    const newCatch = {
      user_id: user.id,
      fish_type: catchEntry.fishType,
      length: parseFloat(catchEntry.length),
      date: catchEntry.date,
      image_url: imageUrl,
    };
    console.log('Inserting catch:', newCatch);
  
    const { error: insertError } = await supabase.from('catches').insert(newCatch);
    if (insertError) {
      console.error('Error saving catch:', insertError);
      setError(`Failed to save catch: ${insertError.message}`);
      return;
    }
  
    setCatches((prev) => [{
      description: `${catchEntry.fishType} - ${catchEntry.length}" (${catchEntry.date})`,
      image: imageUrl,
    }, ...prev.slice(0, 4)]);
    setCatchEntry({ fishType: '', length: '', date: '', image: null });
    setImagePreview(null);
    setError('');
  };

  const clearCatches = async () => {
    if (!user) {
      setError('Please log in to clear catches.');
      return;
    }
    const { error } = await supabase
      .from('catches')
      .delete()
      .eq('user_id', user.id);
    if (error) {
      console.error('Error clearing catches:', error);
      setError('Failed to clear catches.');
    } else {
      setCatches([]);
    }
  };

  // Helper to convert base64 to file for Supabase Storage
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  return (
    <div className="catch-log-container">
      <h1 className="catch-log-title">Catch Log</h1>
      {!user ? (
        <p>Please log in to log a catch.</p>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="catch-log-form">
            <div className="form-group">
              <label>
                Fish Type:
                <input
                  type="text"
                  name="fishType"
                  value={catchEntry.fishType}
                  onChange={handleInputChange}
                  className="catch-input"
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Length (in inches):
                <input
                  type="number"
                  name="length"
                  value={catchEntry.length}
                  onChange={handleInputChange}
                  className="catch-input"
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Date (YYYY-MM-DD):
                <input
                  type="date"
                  name="date"
                  value={catchEntry.date}
                  onChange={handleInputChange}
                  className="catch-input"
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Catch Photo (optional):
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="catch-input file-input"
                />
              </label>
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Catch Preview" style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '10px' }} />
                </div>
              )}
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="catch-log-button">
              Log Catch
            </button>
          </form>

          <h2 className="recent-catches-title">Recent Catches</h2>
          <div className="recent-catches-list">
            {catches.length > 0 ? (
              <>
                <button onClick={clearCatches} className="catch-log-button" style={{ marginBottom: '10px' }}>
                  Clear Catches
                </button>
                {catches.map((catchItem, index) => (
                  <div key={index} className="catch-item">
                    <div>{catchItem.description}</div>
                    {catchItem.image && (
                      <img src={catchItem.image} alt={catchItem.description} style={{ maxWidth: '100%', maxHeight: '150px', marginTop: '5px' }} />
                    )}
                  </div>
                ))}
              </>
            ) : (
              <p className="no-catches">No catches logged yet.</p>
            )}
          </div>
        </>
      )}
      <Link to="/" className="back-link">
        Back to Home
      </Link>
    </div>
  );
};

export default CatchLog;

