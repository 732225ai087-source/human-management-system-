import { prisma } from '../config/database.js';
import { config } from '../config/env.js';
import { hashPassword } from './hash.js';

export async function bootstrapAdmin(): Promise<void> {
  try {
    // Check if any user with role ADMIN exists in the database
    const adminExists = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (adminExists) {
      console.log('Admin user bootstrapping skipped: Admin user already exists.');
      return;
    }

    // Hash the default admin password
    const hashedPassword = await hashPassword(config.defaultAdminPassword);

    // Create a new User with role ADMIN and its corresponding Profile
    await prisma.user.create({
      data: {
        employeeId: config.defaultAdminEmpId,
        email: config.defaultAdminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        isEmailVerified: true,
        profile: {
          create: {
            firstName: 'System',
            lastName: 'Administrator',
            department: 'Management',
            designation: 'System Administrator',
          },
        },
      },
    });

    console.log('Admin user bootstrapped successfully.');
  } catch (error) {
    console.error('Error during admin user bootstrapping:', error);
    throw error;
  }
}
