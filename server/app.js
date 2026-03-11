// server/app.js
import express from 'express';

const app = express();


// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res
    .status(200)
    .send('Hello, IhsanTrack!');
});


export default app;