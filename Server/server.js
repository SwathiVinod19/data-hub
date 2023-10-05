const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { DateTime } = require('luxon');

const app = express();
const port = process.env.PORT || 3000;
const corsOptions = {
  origin: 'http://localhost:3000',
}
app.use(cors(corsOptions));
// Middleware to set response headers for JSON
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Set scrapper ID, update version
const ScraperID = 'Cam0001JSON';

// The URL of the website you want to scrape
const SDate = DateTime.now().minus({ days: 1 });
const EDate = DateTime.now().plus({ days: 10 });
const UpdateTime = DateTime.now().toISO();

// Function to fetch data from the website
const fetchData = async () => {
  const url = `http://calendar.cambridge.ca/default/Advanced?StartDate=${SDate.toFormat(
    'MM/dd/yyyy'
  )}&EndDate=${EDate.toFormat('MM/dd/yyyy')}`;

  try {
    const response = await axios.get(url);

    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      const events = $('.calendar-list-list');

      const eventArray = [];

      events.each((index, element) => {
        const dateText = $(element).find('.calendar-list-time').text().trim();
        const [date_part, time_part] = dateText.split(' - ');
        const event_date = DateTime.fromFormat(date_part, 'cccc, MMMM dd, yyyy');

        const EventName = $(element).find('a').text().trim();
        const LinkElement = $(element).find('a');
        const NavURL = 'http://calendar.cambridge.ca' + LinkElement.attr('href');

        const startDate = event_date.toISO();

        eventArray.push({
          eventID: DateTime.now().toFormat('yyyyMMdd') + NavURL,
          eventName: EventName,
          sourceURL: NavURL,
          description: '',
          date: {
            start: startDate,
            end: startDate,
          },
          location: {
            name: '',
            address: '',
          },
          organizer: {
            name: '',
            contact: {
              email: '',
              phone: '',
            },
          },
          tags: [],
          ticketInfo: {
            isFree: true,
            price: null,
            registrationLink: '',
          },
          additionalInfo: '',
          dateUpdate: UpdateTime,
          scraperID: ScraperID,
        });
      });

      return eventArray;
    } else {
      console.error('Failed to retrieve the webpage. Status code:', response.status);
      return [];
    }
  } catch (error) {
    console.error('An error occurred while fetching data:', error.message);
    return [];
  }
};

// Route to fetch and return scraped data as JSON
app.get('/scrape', async (req, res) => {
  const scrapedData = await fetchData();
  res.json(scrapedData);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
