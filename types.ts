export enum View {
  Dashboard,
  Students,
  Teachers,
  Courses,
  Assessments,
  Attendance,
  ReportCardGenerator,
  TeacherDashboard,
  LessonPlanner,
  StudentDashboard,
  ClassManagement,
  Events,
  PrintReport
}

export interface Student {
  id: string;
  name: string;
  grade: number;
  className: string;
  enrollmentDate: string;
  guardian: string;
  dateOfBirth: string;
  address: string;
  guardianPhone: string;
  imageUrl?: string;
  password?: string;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  hireDate: string;
  email: string;
  imageUrl?: string;
  phone: string;
  qualifications: string;
  password?: string;
}

export interface AdminUser {
  role: 'admin';
  id: 'admin';
  name: string;
  imageUrl: string;
  password?: string;
}

export interface TeacherUser extends Teacher {
  role: 'teacher';
}

export interface StudentUser extends Student {
  role: 'student';
}

export type User = AdminUser | TeacherUser | StudentUser;


export interface Course {
  id: string;
  name: string;
  code: string;
  teacher: string;
  credits: number;
}

export interface Announcement {
  id: number;
  title: string;
  date: string;
  content: string;
}

export interface Assessment {
  id:string;
  studentName: string;
  courseName: string;
  type: 'Quiz' | 'Test' | 'Homework' | 'Project';
  date: string;
  score: number;
}

export interface AttendanceRecord {
  teacherId: string;
  teacherName: string;
  status: 'Present' | 'Absent' | 'Checked Out';
  checkInTime: string | null;
  checkOutTime: string | null;
}

export interface SchoolEvent {
  id: number;
  title: string;
  date: string;
  description: string;
  category: 'Academic' | 'Sports' | 'Arts' | 'Community';
}