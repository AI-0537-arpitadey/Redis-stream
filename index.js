const express = require('express');
const Redis = require('ioredis');
const bodyParser = require('body-parser');
const app = express();
const port = 4000;

const redis = new Redis();

app.use(bodyParser.json());

app.post('/send-message', async (req, res) => {
  const { user, message } = req.body;

  if (!user || !message) {
    return res.status(400).json({ error: 'User and message are required' });
  }

  // Add the message to a Redis Stream
  await redis.xadd('chat', '*', ['user', user, 'message', message]);

  return res.status(200).json({ status: 'Message sent' });
});

app.get('/get-messages', async (req, res) => {
  // Read messages from the Redis Stream
  const messages = await redis.xrange('chat', '-', '+');

 return res.json(messages);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
