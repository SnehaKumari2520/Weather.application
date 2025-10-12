import React, { useEffect } from 'react'
import './Weather.css'
import search_icon from '../assets/search.png'
import clear_icon from '../assets/clear.png'
import cloud_icon from '../assets/cloud.png'
import rain_icon from '../assets/rain.png'  
import snow_icon from '../assets/snow.png'
import humidity_icon from '../assets/humidity.png'
import wind_icon from '../assets/wind.png'
import drizzle_icon from '../assets/drizzle.png'


const Weather = () =>{

  // start with null to indicate "no data yet"; use optional chaining in JSX
  const[weatherData,setWeatherData] = React.useState(null);
  const [query, setQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [rawData, setRawData] = React.useState(null);
  const [useRemoteIcon, setUseRemoteIcon] = React.useState(false);

  // Map WeatherAPI condition text to local icons
  const getIconForCondition = (conditionText) => {
    if (!conditionText) return clear_icon;
    const t = conditionText.toLowerCase();
    if (t.includes('clear') || t.includes('sunny')) return clear_icon;
    if (t.includes('cloud')) return cloud_icon;
    if (t.includes('drizzle')) return drizzle_icon;
    if (t.includes('rain') || t.includes('shower')) return rain_icon;
    if (t.includes('snow') || t.includes('sleet')) return snow_icon;
    return clear_icon;
  }

  // map condition to page background gradient
  const bgForCondition = (conditionText) => {
    if (!conditionText) return 'linear-gradient(135deg,#7453d6 0%,#b25cec 100%)';
    const t = conditionText.toLowerCase();
    if (t.includes('clear') || t.includes('sunny')) return 'linear-gradient(135deg,#f6d365 0%,#fda085 100%)'; // warm sunny
    if (t.includes('cloud')) return 'linear-gradient(135deg,#cfd9df 0%,#e2ebf0 100%)'; // soft gray
    if (t.includes('drizzle')) return 'linear-gradient(135deg,#89f7fe 0%,#66a6ff 100%)'; // light blue
    if (t.includes('rain') || t.includes('shower')) return 'linear-gradient(135deg,#3a7bd5 0%,#00d2ff 100%)'; // rainy blue
    if (t.includes('snow') || t.includes('sleet')) return 'linear-gradient(135deg,#e6e9f0 0%,#eef1f5 100%)'; // cold pale
    return 'linear-gradient(135deg,#7453d6 0%,#b25cec 100%)';
  }

  const search = async(city) =>{
    try {
     setError('');
     setLoading(true);
     const location = city || query || "London"; // fallback if no city provided
     const apiKey = import.meta.env.VITE_WEATHER_API_ID;
     const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)}`;

      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Weather API error: ${res.status} ${text}`);
      }
      const data = await res.json();
      console.log('weatherapi response', data);
      setRawData(data);

      const condition = data?.current?.condition?.text || '';

      // remote icon from WeatherAPI (may be protocol-relative)
      const remoteIconRaw = data?.current?.condition?.icon || null;
      const remoteIcon = remoteIconRaw ? (remoteIconRaw.startsWith('//') ? 'https:' + remoteIconRaw : remoteIconRaw) : null;

      const icon = (useRemoteIcon && remoteIcon) ? remoteIcon : getIconForCondition(condition);

      setWeatherData({
        humidity: data?.current?.humidity,
        windSpeed: data?.current?.wind_kph, // units: kph
        temperature: Math.round(data?.current?.temp_c),
        city: data?.location?.name,
        condition: condition,
        icon: icon,
      });

    } catch (err) {
      console.error('Failed to fetch weather:', err);
      setError(err.message || 'Failed to fetch');
      setWeatherData(null);
      setRawData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{
   search("New York");
  },[])

  // apply page background based on current condition
  useEffect(()=>{
    const defaultBg = 'linear-gradient(135deg,#7453d6 0%,#b25cec 100%)';
    const bg = weatherData?.condition ? bgForCondition(weatherData.condition) : defaultBg;
    const prev = document.body.style.background;
    document.body.style.transition = 'background 600ms ease';
    document.body.style.background = bg;
    return ()=>{ document.body.style.background = prev || defaultBg }
  },[weatherData])


  return (
    <>
      {/* overlays are fixed so they cover viewport; card stays above */}
      {weatherData?.condition && (/rain|shower|drizzle/i).test(weatherData.condition) && (
        <div className="weather-overlay rain" aria-hidden="true" />
      )}

      {weatherData?.condition && (/snow|sleet/i).test(weatherData.condition) && (
        <div className="weather-overlay snow" aria-hidden="true" />
      )}

      {weatherData?.condition && (/clear|sunny/i).test(weatherData.condition) && (
        <div className="weather-overlay sun" aria-hidden="true">
          <div className="sun" />
        </div>
      )}

      {weatherData?.condition && (/cloud|overcast/i).test(weatherData.condition) && (
        <div className="weather-overlay clouds" aria-hidden="true">
          <div className="cloud c1" />
          <div className="cloud c2" />
        </div>
      )}

      {weatherData?.condition && (/wind|breeze|windy/i).test(weatherData.condition) && (
        <div className="weather-overlay wind" aria-hidden="true">
          <div className="leaf l1" />
          <div className="leaf l2" />
        </div>
      )}

      {weatherData?.condition && (/thunder|storm|lightning/i).test(weatherData.condition) && (
        <div className="weather-overlay storm" aria-hidden="true">
          <div className="bolt" />
        </div>
      )}

      <div className = "weather">
      <form className="search-bar" onSubmit={(e)=>{e.preventDefault(); search(query);}}>
        <input
          type="text"
          placeholder="search city"
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
        />
        <button type="submit" aria-label="search">
          <img src={search_icon} alt = "search"/>
        </button>
      </form>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}

      <img src={weatherData?.icon || clear_icon} alt={weatherData?.condition || 'weather'} className='weather-icon'/>
      <p className='temperature'>{weatherData?.temperature ?? '--'}°c</p>
      <p className='location'>{weatherData?.city ?? '—'}</p>

      <div style={{marginTop:12, marginBottom:8}}>
        <label style={{color:'#fff', fontSize:14}}>
          <input type="checkbox" checked={useRemoteIcon} onChange={(e)=>setUseRemoteIcon(e.target.checked)} /> Use WeatherAPI icon
        </label>
      </div>

      <div className="weather-data">
        <div className="col">
          <img src={humidity_icon} alt="humidity" />
          <div>
            <p>{weatherData?.humidity ?? '--'}</p>
            <span>Humidity</span>
          </div>
        </div>

        <div className="col">
          <img src={wind_icon} alt="wind" />
          <div>
            <p>{weatherData?.windSpeed ?? '--'}</p>
            <span>Wind Speed</span>
          </div>
        </div>
      </div>

      <details className="debug">
        <summary style={{color:'#fff'}}>Debug</summary>
        <pre style={{color:'#000', maxHeight:300, overflow:'auto', background:'#eee', padding:8}}>
{JSON.stringify({rawData, chosenIcon: weatherData?.icon, useRemoteIcon}, null, 2)}
        </pre>
        <div style={{marginTop:8}}>
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            <button onClick={()=>setWeatherData((w)=>({...(w||{}), condition:'Sunny'}))}>Simulate Sunny</button>
            <button onClick={()=>setWeatherData((w)=>({...(w||{}), condition:'Rain'}))}>Simulate Rain</button>
            <button onClick={()=>setWeatherData((w)=>({...(w||{}), condition:'Snow'}))}>Simulate Snow</button>
            <button onClick={()=>setWeatherData((w)=>({...(w||{}), condition:'Cloudy'}))}>Simulate Cloudy</button>
            <button onClick={()=>setWeatherData((w)=>({...(w||{}), condition:'Windy'}))}>Simulate Wind</button>
            <button onClick={()=>setWeatherData((w)=>({...(w||{}), condition:'Storm'}))}>Simulate Storm</button>
            <button onClick={()=>{ setWeatherData(rawData ? { ...(weatherData||{}), condition: rawData.current?.condition?.text } : null) }}>Restore</button>
          </div>
        </div>
      </details>
    </div>
    </>
  )
}

export default Weather
