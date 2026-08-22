import { app } from './app.js';
import { config } from './config/env.js';
import { initCronJobs } from './jobs/markAbsent.js';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Dayflow server running on port ${PORT}`);
  console.log(`📋 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);

  // Initialize cron jobs
  initCronJobs();
});
