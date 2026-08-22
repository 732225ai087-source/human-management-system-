import cron from 'node-cron';
import { attendanceService } from '../services/attendanceService.js';

export function initCronJobs(): void {
  // Auto-mark absent at 23:59 every day
  cron.schedule('59 23 * * *', async () => {
    console.log('🕐 Running auto-absent marking job...');
    try {
      const result = await attendanceService.markAbsentForDate(new Date());
      console.log(`✅ Marked ${result.marked} users as absent`);
    } catch (error) {
      console.error('❌ Auto-absent job failed:', error);
    }
  });

  console.log('📅 Cron jobs initialized');
}
