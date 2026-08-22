export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = unknown> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: string;
  employeeId: string;
  email: string;
  role: 'EMPLOYEE' | 'ADMIN';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: Profile;
}

export interface Profile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  department?: string;
  designation?: string;
  dateOfJoining?: string;
  profilePicUrl?: string;
  documents?: Document[];
}

export interface Document {
  id: string;
  profileId: string;
  name: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
}

export interface Attendance {
  id: string;
  userId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE';
  user?: User;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  leaveType: 'PAID' | 'SICK' | 'UNPAID';
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminRemarks?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  user?: User;
  createdAt: string;
}

export interface Payroll {
  id: string;
  userId: string;
  month: number;
  year: number;
  basicSalary: number;
  hra: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paidOn?: string;
  user?: User;
}

export interface SalaryStructure {
  id: string;
  userId: string;
  basicSalary: number;
  hra: number;
  allowances: number;
  deductions: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalEmployees?: number;
  presentToday?: number;
  pendingLeaves?: number;
  totalPayroll?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  employeeId?: string;
  email: string;
  password: string;
  role: 'EMPLOYEE' | 'ADMIN';
  firstName: string;
  lastName: string;
}
