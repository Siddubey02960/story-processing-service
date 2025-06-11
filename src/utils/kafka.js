const { Kafka } = require('kafkajs');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { mergeMediaWithMusic } = require('./processor');
const { uploadMedia } = require('./cloudinaryUploader');

const kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER] });
const consumer = kafka.consumer({ groupId: 'story-processor-group' });
const producer = kafka.producer();

const startConsumer = async () => {
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({ topic: 'story-enhancement-requested', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value.toString());
      const { storyId, mediaUrl, musicUrl } = data;

      try {
        const mediaPath = `/tmp/media-${storyId}.mp4`;
        const musicPath = `/tmp/music-${storyId}.mp3`;
        const outputPath = `/tmp/final-${storyId}.mp4`;

        const download = async (url, filepath) => {
          const writer = fs.createWriteStream(filepath);
          const res = await axios({ url, method: 'GET', responseType: 'stream' });
          res.data.pipe(writer);
          return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
          });
        };

        await download(mediaUrl, mediaPath);
        await download(musicUrl, musicPath);

        await mergeMediaWithMusic(mediaPath, musicPath, outputPath);

        const uploadResult = await uploadMedia(outputPath);
        const finalUrl = uploadResult.secure_url;

        await producer.send({
          topic: 'story-enhanced',
          messages: [
            {
              key: storyId.toString(),
              value: JSON.stringify({
                storyId,
                finalUrl,
              }),
            },
          ],
        });

        console.log(`Story ${storyId} processed & uploaded`);
      } catch (err) {
        console.error(`Failed to process story ${storyId}:`, err.message);
      }
    }
  });
};

module.exports = { startConsumer };
