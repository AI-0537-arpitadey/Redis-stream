const Redis = require('ioredis');
const mongoose = require('mongoose');
const cuid =require('cuid')

// Define the Mongoose schema and model
const messageSchema = new mongoose.Schema({
  content: String,
  timestamp: { type: Date, default: Date.now }
});

const MessageModel = mongoose.model('Message', messageSchema);

// Set up Redis connection
const redis = new Redis({
  host: '127.0.0.1', // Set your Redis host here
  port: 6389, // Set your Redis port here
});

// Set up MongoDB connection using Mongoose
mongoose.connect('mongodb://127.0.0.1:27019/redis', { useUnifiedTopology: true });
const mongoDB = mongoose.connection;

mongoDB.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoDB.once('open', () => {
  console.log('Connected to MongoDB');
});

// Send message to MongoDB-------------------->

async function sendMsgToMongo(givenMsg) {
  const message = JSON.parse(givenMsg);
  console.log(message);
  const messageDoc = new MessageModel({
    content: message
  });

  try {
    await messageDoc.save();
    console.log('Mongo Message sent successfully:', messageDoc);
  } catch (error) {
    console.error('Mongo Error sending message:', error);
  }
}



// Main function----------------------->

async function main() {
  const streamName = 'redis-test1';
  const consumerGroup = "cg1" //cuid();
  const consumerName = 'consumer1';

  // Create a consumer group if it doesn't exist
  try {
    await redis.xgroup('CREATE', streamName, consumerGroup, '0', 'MKSTREAM');
  } catch (error) {
    console.log("NON FATAL ==> ")
  }

  try {
    while (true) {
      const resp = await redis.xreadgroup(
        'GROUP',
        consumerGroup,
        consumerName,
        'BLOCK',
        0,
        'COUNT',
        1,
        'STREAMS',
        streamName,
        '>'
      );

      console.log("resp ==> ", JSON.stringify(resp))
      const [[_, [[messageId, [__, givenMsg]]]]] = resp

      console.log(" ==> ", messageId, givenMsg)

      await sendMsgToMongo(givenMsg);

      // Acknowledge the message
      await redis.xack(streamName, consumerGroup, messageId);
    }
  } catch (error) {
    console.error('Error:', error);
    // process.exit(1);
  }
}

main();
