const express = require('express');
const Redis = require('ioredis');

const app = express();
const port = 3000;

const redis = new Redis({
  host: "127.0.0.1", // Set your Redis host here
  port: 6389, // Set your Redis port here
});

app.use(express.json());

app.post('/produce', async (req, res) => {
  const { message } = req.body;
  // console.log("message..........==> ", message);

  if (message === undefined) {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }

  try {
    // Generate a unique message ID
    // const messageId = Date.now().toString();

    // Store the message in a Redis stream
    await redis.xadd('redis-test1', 'MAXLEN', '~', 1000, '*', 'message', JSON.stringify(message));

    console.log('Message sent successfully:', message);
    return res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ success: false, error: 'Error sending message' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
