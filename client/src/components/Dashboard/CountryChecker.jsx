import { useState } from 'react';
import axios from 'axios';

function CountryChecker() {
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getCountry = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://ip-api.com/json/');
      if (response.data.status === 'success') {
        setCountry(response.data.country);
      } else {
        setError('Unable to detect country: ' + response.data.message);
      }
    } catch (err) {
      setError('Network or API error');
    }
    setLoading(false);
  };

  return (
    <div>
      <button className='bg-white py-3 px-2' onClick={getCountry} disabled={loading}>
        {loading ? "Detecting..." : "Get My Country"}
      </button>
      {country && <div className='text-white'>Your country: {country}</div>}
      {error && <div style={{color:"red"}}>{error}</div>}
    </div>
  );
}

export default CountryChecker;