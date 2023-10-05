import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Make a GET request to the Express.js server
    axios.get('/scrape')
      .then((response) => {
        console.log(response.data);
        setData(response.data);
      
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div className="App">
      {/* Display the scraped data in your React component */}
      {data.map((event) => (
        <div key={event.eventID}>
          <h2>{event.eventName}</h2>
          {/* Display other event information here */}
        </div>
      ))}
    </div>
  );
}

export default App;
