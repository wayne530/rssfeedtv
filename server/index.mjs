import express from 'express';
import fetch from 'node-fetch';

const app = express();
const port = 3001;

// Serve static files from the React app
app.use(express.static('public'));

app.get('/feed', async (req, res) => {
  const url = req.query.url;
  if (! url) {
    res.status(400).send('Missing url parameter');
    return;
  }
  try {
    const response = await fetch(url);
    res.header('Access-Control-Allow-Origin', '*');
    res.send(await response.text());
  } catch (e) {
    res.status(400).send(`Error fetching feed [${url}]: ${e.message}]`);
  }
});

app.listen(port, () => {
  console.log(`Express app listening on port ${port}`)
});
