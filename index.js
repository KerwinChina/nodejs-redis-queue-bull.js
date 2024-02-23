const Queue = require('bull');
const myQueue = new Queue('testQueue', {
  redis: {
    port: 6379,
    host: '127.0.0.1',
    password: 'foobared',
    db: 0  // Specify using database index 0
  }
});

// Add jobs to the queue
myQueue.add({ foo: 'bar' }, { delay: 5000, attempts: 2 });
myQueue.add({ type: 'recurring' }, { repeat: { cron: '*/10 * * * * *' } });

// Process jobs
myQueue.process(async (job) => {
  if (job.data.type === 'recurring') {
    console.log('Processing recurring job', job.data);
  } else {
    console.log('Processing regular job', job.data);
  }
});

// Listen for events
myQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
}).on('failed', (job, err) => {
  console.log(`Job ${job.id} failed with error ${err.message}`);
}).on('progress', (job, progress) => {
  console.log(`Job ${job.id} progress: ${progress}%`);
});

// Clean jobs
async function cleanJobs() {
  await myQueue.clean(5000, 'completed');
  await myQueue.clean(5000, 'failed');
  console.log('Cleaned completed and failed jobs');
}

// Use setTimeout to simulate asynchronous cleaning operation
setTimeout(cleanJobs, 10000);

// Close the queue (usually called when the application exits)
async function closeQueue() {
  await myQueue.close();
  console.log('Queue closed');
}

process.on('SIGINT', closeQueue);
process.on('SIGTERM', closeQueue);
