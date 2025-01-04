require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();
const port = 3000;

// Initialize Spotify API client
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

// Get access token
spotifyApi.clientCredentialsGrant().then(data => {
  spotifyApi.setAccessToken(data.body['access_token']);
}).catch(error => {
  console.error('Error getting access token:', error);
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Route to serve the homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Route to handle search requests
app.post('/search', (req, res) => {
  const query = req.body.query;
  spotifyApi.searchTracks(query)
    .then(data => {
      const tracks = data.body.tracks.items.map(track => ({
        name: track.name,
        artists: track.artists.map(artist => artist.name).join(', '),
        album: track.album.name,
        url: track.external_urls.spotify,
        imageUrl: track.album.images[0]?.url || '',
        releaseDate: track.album.release_date,
        popularity: track.popularity
      }));
      res.json(tracks);
    })
    .catch(error => {
      console.error('Error searching for tracks:', error);
      res.status(500).send('Error searching for tracks');
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
