
import { Student, Teacher, Course, Announcement, View, Assessment, AttendanceRecord, SchoolEvent } from './types';

export const STUDENTS_DATA: Student[] = [
  { id: 'S001', name: 'Alice Johnson', grade: 5, className: '5A', enrollmentDate: '2022-09-01', guardian: 'John Johnson', dateOfBirth: '2014-05-20', address: '123 Maple St, Springfield', guardianPhone: '555-0101', imageUrl: 'https://picsum.photos/seed/S001/200', password: 'password123' },
  { id: 'S002', name: 'Bob Williams', grade: 3, className: '3B', enrollmentDate: '2023-01-15', guardian: 'Sarah Williams', dateOfBirth: '2016-08-12', address: '456 Oak Ave, Shelbyville', guardianPhone: '555-0102', imageUrl: 'https://picsum.photos/seed/S002/200', password: 'password123' },
  { id: 'S003', name: 'Charlie Brown', grade: 8, className: '8A', enrollmentDate: '2021-09-01', guardian: 'James Brown', dateOfBirth: '2011-02-28', address: '789 Pine Ln, Capital City', guardianPhone: '555-0103', imageUrl: 'https://picsum.photos/seed/S003/200', password: 'password123' },
  { id: 'S004', name: 'Diana Miller', grade: 2, className: '2C', enrollmentDate: '2023-09-01', guardian: 'Patricia Miller', dateOfBirth: '2017-11-05', address: '101 Elm Ct, Ogdenville', guardianPhone: '555-0104', imageUrl: 'https://picsum.photos/seed/S004/200', password: 'password123' },
  { id: 'S005', name: 'Ethan Davis', grade: 7, className: '7B', enrollmentDate: '2022-01-20', guardian: 'Robert Davis', dateOfBirth: '2012-07-19', address: '212 Birch Rd, North Haverbrook', guardianPhone: '555-0105', imageUrl: 'https://picsum.photos/seed/S005/200', password: 'password123' },
  { id: 'S006', name: 'Fiona Garcia', grade: 1, className: '1A', enrollmentDate: '2024-02-10', guardian: 'Maria Garcia', dateOfBirth: '2018-04-30', address: '333 Cedar Blvd, Brockway', guardianPhone: '555-0106', imageUrl: 'https://picsum.photos/seed/S006/200', password: 'password123' },
];

export const TEACHERS_DATA: Teacher[] = [
  { id: 'T01', name: 'Mr. David Smith', subject: 'Mathematics', hireDate: '2018-08-15', email: 'd.smith@raphtech.edu', imageUrl: 'https://picsum.photos/seed/T01/200', phone: '555-0101', qualifications: 'M.Ed. in Mathematics, B.S. in Applied Mathematics', password: 'password123' },
  { id: 'T02', name: 'Ms. Emily Jones', subject: 'Science', hireDate: '2020-07-22', email: 'e.jones@raphtech.edu', imageUrl: 'https://picsum.photos/seed/T02/200', phone: '555-0102', qualifications: 'Ph.D. in Biology, B.S. in Chemistry', password: 'password123' },
  { id: 'T03', name: 'Mrs. Olivia Wilson', subject: 'English', hireDate: '2015-09-01', email: 'o.wilson@raphtech.edu', imageUrl: 'https://picsum.photos/seed/T03/200', phone: '555-0103', qualifications: 'M.A. in English Literature', password: 'password123' },
  { id: 'T04', name: 'Mr. Michael Taylor', subject: 'History', hireDate: '2021-01-10', email: 'm.taylor@raphtech.edu', imageUrl: 'https://picsum.photos/seed/T04/200', phone: '555-0104', qualifications: 'B.A. in History, Teaching Certification', password: 'password123' },
];

export const TEACHER_ATTENDANCE_DATA: AttendanceRecord[] = TEACHERS_DATA.map(teacher => ({
    teacherId: teacher.id,
    teacherName: teacher.name,
    status: 'Absent',
    checkInTime: null,
    checkOutTime: null,
}));

export const COURSES_DATA: Course[] = [
  { id: 'C101', name: 'Algebra II', code: 'MATH-201', teacher: 'Mr. David Smith', credits: 4 },
  { id: 'C102', name: 'Biology', code: 'SCI-101', teacher: 'Ms. Emily Jones', credits: 4 },
  { id: 'C103', name: 'World Literature', code: 'ENG-301', teacher: 'Mrs. Olivia Wilson', credits: 3 },
  { id: 'C104', name: 'US History', code: 'HIST-202', teacher: 'Mr. Michael Taylor', credits: 3 },
  { id: 'C105', name: 'Introduction to Physics', code: 'SCI-201', teacher: 'Ms. Emily Jones', credits: 4 },
];

export const ANNOUNCEMENTS_DATA: Announcement[] = [
    { id: 1, title: 'Annual Sports Day', date: '2024-10-15', content: 'Get ready for a day of fun and competition! Sign-ups for events are now open.' },
    { id: 2, title: 'Parent-Teacher Meetings', date: '2024-11-05', content: 'Meetings will be held from 3 PM to 6 PM. Please book your slots online.' },
    { id: 3, title: 'Science Fair Submissions Due', date: '2024-10-25', content: 'All students participating in the science fair must submit their project proposals.' },
];

export const EVENTS_DATA: SchoolEvent[] = [
  { id: 1, title: 'Annual Sports Day', date: '2024-10-15', description: 'Get ready for a day of fun and competition! Sign-ups for events are now open.', category: 'Sports' },
  { id: 2, title: 'Science Fair Submissions Due', date: '2024-10-25', description: 'All students participating in the science fair must submit their project proposals.', category: 'Academic' },
  { id: 3, title: 'Parent-Teacher Meetings', date: '2024-11-05', description: 'Meetings will be held from 3 PM to 6 PM. Please book your slots online.', category: 'Community' },
  { id: 4, title: 'School Play Auditions', date: '2024-11-10', description: 'Auditions for the annual school play "A Midsummer Night\'s Dream" will be held in the auditorium.', category: 'Arts' },
  { id: 5, title: 'Mid-Term Exams Begin', date: '2024-11-18', description: 'Mid-term examinations for all grades will commence. Please check the schedule for details.', category: 'Academic' },
];

export const ASSESSMENTS_DATA: Assessment[] = [
  { id: 'A001', studentName: 'Alice Johnson', courseName: 'Algebra II', type: 'Test', date: '2024-05-10', score: 88 },
  { id: 'A002', studentName: 'Bob Williams', courseName: 'Biology', type: 'Quiz', date: '2024-05-12', score: 92 },
  { id: 'A003', studentName: 'Alice Johnson', courseName: 'Algebra II', type: 'Homework', date: '2024-05-15', score: 95 },
  { id: 'A004', studentName: 'Charlie Brown', courseName: 'World Literature', type: 'Project', date: '2024-05-20', score: 78 },
  { id: 'A005', studentName: 'Bob Williams', courseName: 'Introduction to Physics', type: 'Test', date: '2024-05-18', score: 85 },
  // FIX: Object literal may only specify known properties, and 'name' does not exist in type 'Assessment'.
  { id: 'A006', studentName: 'Ethan Davis', courseName: 'US History', type: 'Quiz', date: '2024-05-14', score: 90 },
];

export const NAVIGATION_ITEMS = [
  { icon: 'fa-solid fa-house', label: 'Dashboard', view: View.Dashboard },
  { icon: 'fa-solid fa-user-graduate', label: 'Students', view: View.Students },
  { icon: 'fa-solid fa-people-roof', label: 'Class Management', view: View.ClassManagement },
  { icon: 'fa-solid fa-chalkboard-user', label: 'Teachers', view: View.Teachers },
  { icon: 'fa-solid fa-book', label: 'Courses', view: View.Courses },
  { icon: 'fa-solid fa-file-signature', label: 'Assessments', view: View.Assessments },
  { icon: 'fa-solid fa-clock', label: 'Attendance', view: View.Attendance },
  { icon: 'fa-solid fa-calendar-check', label: 'Events', view: View.Events },
  { icon: 'fa-solid fa-pen-to-square', label: 'AI Comment Generator', view: View.ReportCardGenerator },
];

export const TEACHER_NAVIGATION_ITEMS = [
  { icon: 'fa-solid fa-house', label: 'Dashboard', view: View.TeacherDashboard },
  { icon: 'fa-solid fa-user-graduate', label: 'My Students', view: View.Students },
  { icon: 'fa-solid fa-user-check', label: 'Class Attendance', view: View.StudentAttendance },
  { icon: 'fa-solid fa-book', label: 'My Courses', view: View.Courses },
  { icon: 'fa-solid fa-lightbulb', label: 'AI Lesson Planner', view: View.LessonPlanner },
];

export const STUDENT_NAVIGATION_ITEMS = [
  { icon: 'fa-solid fa-house', label: 'Dashboard', view: View.StudentDashboard },
  { icon: 'fa-solid fa-book', label: 'My Courses', view: View.Courses },
  { icon: 'fa-solid fa-file-signature', label: 'My Assessments', view: View.Assessments },
];