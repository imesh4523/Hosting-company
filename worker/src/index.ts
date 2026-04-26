import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  'vps-tasks',
  async (job: Job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    
    const { dropletId, action, apiKey } = job.data;

    try {
      if (action === 'create') {
        // Logic for creating VPS in DO
        console.log(`Creating droplet ${job.data.name}...`);
        // Simulating API call
        await new Promise(r => setTimeout(r, 2000));
        console.log(`Droplet ${job.data.name} created successfully.`);
      } else if (action === 'reboot') {
        await axios.post(`https://api.digitalocean.com/v2/droplets/${dropletId}/actions`, 
          { type: 'reboot' },
          { headers: { Authorization: `Bearer ${apiKey}` } }
        );
      }
    } catch (error) {
      console.error(`Failed to process job ${job.id}:`, error);
      throw error;
    }
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed!`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error: ${err.message}`);
});

console.log('Worker service started and waiting for jobs...');
