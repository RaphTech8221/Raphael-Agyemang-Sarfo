
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Students from './components/Students';
import Teachers from './components/Teachers';
import Courses from './components/Courses';
import Assessments from './components/Assessments';
import Attendance from './components/Attendance';
import ReportCardGenerator from './components/ReportCardGenerator';
import Events from './components/Events';
import LessonPlanner from './components/LessonPlanner';
import Login from './components/Login';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import { View, User, Student, Teacher, SchoolEvent, Course, ClassAssignment, StudentAttendanceRecord, Assessment, AttendanceRecord } from './types';
import Header from './components/Header';
import { NAVIGATION_ITEMS, TEACHER_NAVIGATION_ITEMS, STUDENT_NAVIGATION_ITEMS, EVENTS_DATA, STUDENTS_DATA, TEACHERS_DATA, COURSES_DATA, ASSESSMENTS_DATA } from './constants';
import ClassManagement from './components/ClassManagement';
import ChangePasswordModal from './components/ChangePasswordModal';
import PrintableReport from './components/PrintableReport';
import StudentAttendance from './components/StudentAttendance';


const EditSchoolNameModal: React.FC<{
  currentSchoolName: string;
  onClose: () => void;
  onUpdate: (newName: string) => void;
}> = ({ currentSchoolName, onClose, onUpdate }) => {
  const [newName, setNewName] = useState(currentSchoolName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onUpdate(newName.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4 transform transition-all duration-300 ease-out animate-fade-in-up">
        <style>{`
          @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
          .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
        `}</style>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-800">Edit School Name</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 focus:outline-none">
            <i className="fa-solid fa-times text-2xl"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="schoolName" className="block text-sm font-medium text-slate-700 mb-1">School Name</label>
            <input
              id="schoolName"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition"
            />
          </div>
          <div className="flex justify-end pt-4 space-x-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-lg text-white bg-sky-500 hover:bg-sky-600 transition font-semibold">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isEditSchoolNameModalOpen, setIsEditSchoolNameModalOpen] = useState(false);
  const [printingStudent, setPrintingStudent] = useState<Student | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const [schoolName, setSchoolName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('schoolName');
      return saved ? JSON.parse(saved) : 'Katamanso KKMA 2 JHS';
    } catch {
      return 'Katamanso KKMA 2 JHS';
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('students');
      return saved ? JSON.parse(saved) : STUDENTS_DATA;
    } catch {
      return STUDENTS_DATA;
    }
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    try {
      const saved = localStorage.getItem('teachers');
      return saved ? JSON.parse(saved) : TEACHERS_DATA;
    } catch {
      return TEACHERS_DATA;
    }
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem('courses');
      return saved ? JSON.parse(saved) : COURSES_DATA;
    } catch {
      return COURSES_DATA;
    }
  });

   const [assessments, setAssessments] = useState<Assessment[]>(() => {
    try {
        const saved = localStorage.getItem('assessments');
        return saved ? JSON.parse(saved) : ASSESSMENTS_DATA;
    } catch {
        return ASSESSMENTS_DATA;
    }
   });

  const [events, setEvents] = useState<SchoolEvent[]>(() => {
    try {
      const saved = localStorage.getItem('events');
      return saved ? JSON.parse(saved) : EVENTS_DATA;
    } catch {
      return EVENTS_DATA;
    }
  });

  const [reminders, setReminders] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('reminders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [classAssignments, setClassAssignments] = useState<ClassAssignment>(() => {
    try {
      const saved = localStorage.getItem('classAssignments');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [studentAttendance, setStudentAttendance] = useState<StudentAttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('studentAttendance');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [teacherAttendance, setTeacherAttendance] = useState<Record<string, AttendanceRecord[]>>(() => {
    try {
      const saved = localStorage.getItem('teacherAttendance');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser) as User;
        setCurrentUser(user);
        if (user.role === 'admin') setCurrentView(View.Dashboard);
        else if (user.role === 'teacher') setCurrentView(View.TeacherDashboard);
        else if (user.role === 'student') setCurrentView(View.StudentDashboard);
      }
    } catch (error) {
      console.error("Could not load user from session", error);
      localStorage.removeItem('currentUser');
    }
  }, []);

  const handleSave = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          localStorage.setItem('schoolName', JSON.stringify(schoolName));
          localStorage.setItem('students', JSON.stringify(students));
          localStorage.setItem('teachers', JSON.stringify(teachers));
          localStorage.setItem('courses', JSON.stringify(courses));
          localStorage.setItem('assessments', JSON.stringify(assessments));
          localStorage.setItem('events', JSON.stringify(events));
          localStorage.setItem('reminders', JSON.stringify(reminders));
          localStorage.setItem('classAssignments', JSON.stringify(classAssignments));
          localStorage.setItem('studentAttendance', JSON.stringify(studentAttendance));
          localStorage.setItem('teacherAttendance', JSON.stringify(teacherAttendance));
          setIsDirty(false);
          resolve(true);
        } catch (error) {
          console.error("Failed to save data to localStorage:", error);
          resolve(false);
        }
      }, 500);
    });
  };

  const updateSchoolName = (newName: string) => { setSchoolName(newName); setIsDirty(true); };
  const updateStudents = (updater: React.SetStateAction<Student[]>) => { setStudents(updater); setIsDirty(true); };
  const updateTeachers = (updater: React.SetStateAction<Teacher[]>) => { setTeachers(updater); setIsDirty(true); };
  const updateCourses = (updater: React.SetStateAction<Course[]>) => { setCourses(updater); setIsDirty(true); };
  const updateAssessments = (updater: React.SetStateAction<Assessment[]>) => { setAssessments(updater); setIsDirty(true); };
  const updateEvents = (updater: React.SetStateAction<SchoolEvent[]>) => { setEvents(updater); setIsDirty(true); };
  const updateReminders = (updater: React.SetStateAction<number[]>) => { setReminders(updater); setIsDirty(true); };
  const updateClassAssignments = (updater: React.SetStateAction<ClassAssignment>) => { setClassAssignments(updater); setIsDirty(true); };
  const updateStudentAttendance = (updater: React.SetStateAction<StudentAttendanceRecord[]>) => { setStudentAttendance(updater); setIsDirty(true); };
  const updateTeacherAttendance = (updater: React.SetStateAction<Record<string, AttendanceRecord[]>>) => { setTeacherAttendance(updater); setIsDirty(true); };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    if (user.role === 'admin') setCurrentView(View.Dashboard);
    else if (user.role === 'teacher') setCurrentView(View.TeacherDashboard);
    else if (user.role === 'student') setCurrentView(View.StudentDashboard);
  };

  const handleLogout = () => {
    if (isDirty) {
      if (!window.confirm("You have unsaved changes. Are you sure you want to log out? Your changes will be lost.")) {
        return;
      }
    }
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };
  
  const handlePasswordUpdate = (newPassword: string) => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, password: newPassword };

    if (currentUser.role === 'teacher') {
        updateTeachers(prevTeachers => prevTeachers.map(t => t.id === currentUser.id ? { ...t, password: newPassword } : t));
    } else if (currentUser.role === 'student') {
        updateStudents(prevStudents => prevStudents.map(s => s.id === currentUser.id ? { ...s, password: newPassword } : s));
    }
    
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setIsChangePasswordModalOpen(false);
  };
  
  const handleSchoolNameUpdate = (newName: string) => {
    updateSchoolName(newName);
    setIsEditSchoolNameModalOpen(false);
  };

  const handlePrintRequest = (student: Student) => {
    setPrintingStudent(student);
    setCurrentView(View.PrintReport);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} schoolName={schoolName} />;
  }
  
  if (currentView === View.PrintReport && printingStudent) {
    return (
      <PrintableReport
        student={printingStudent}
        schoolName={schoolName}
        assessments={assessments}
        courses={courses}
        onBack={() => setCurrentView(View.Students)}
      />
    );
  }

  let navItems;
  if (currentUser.role === 'admin') navItems = NAVIGATION_ITEMS;
  else if (currentUser.role === 'teacher') navItems = TEACHER_NAVIGATION_ITEMS;
  else navItems = STUDENT_NAVIGATION_ITEMS;

  const currentNavItem = navItems.find(item => item.view === currentView);
  
  let title = 'Dashboard';
  if (currentNavItem) {
      title = currentNavItem.label;
  } else {
      if (currentUser.role === 'admin') title = 'Dashboard';
      else if (currentUser.role === 'teacher') title = 'My Dashboard';
      else if (currentUser.role === 'student') title = 'My Dashboard';
  }

  const renderView = () => {
    if (currentUser.role === 'admin') {
      switch (currentView) {
        case View.Dashboard:
          return <Dashboard setCurrentView={setCurrentView} students={students} teachers={teachers} events={events} courses={courses} />;
        case View.Students:
          return <Students currentUser={currentUser} students={students} setStudents={updateStudents} onPrintRequest={handlePrintRequest} />;
        case View.ClassManagement:
          return <ClassManagement students={students} setStudents={updateStudents} teachers={teachers} classAssignments={classAssignments} setClassAssignments={updateClassAssignments} />;
        case View.Teachers:
          return <Teachers teachers={teachers} setTeachers={updateTeachers} />;
        case View.Courses:
          return <Courses currentUser={currentUser} teachers={teachers} courses={courses} setCourses={updateCourses} />;
        case View.Assessments:
          return <Assessments currentUser={currentUser} students={students} assessments={assessments} setAssessments={updateAssessments} courses={courses} />;
        case View.Attendance:
          return <Attendance teachers={teachers} allAttendance={teacherAttendance} setAllAttendance={updateTeacherAttendance} />;
        case View.Events:
          return <Events events={events} setEvents={updateEvents} reminders={reminders} setReminders={updateReminders} />;
        case View.ReportCardGenerator:
          return <ReportCardGenerator />;
        default:
          return <Dashboard setCurrentView={setCurrentView} students={students} teachers={teachers} events={events} courses={courses} />;
      }
    } else if (currentUser.role === 'teacher') { // Teacher view
      switch (currentView) {
        case View.TeacherDashboard:
          return <TeacherDashboard setCurrentView={setCurrentView} currentUser={currentUser} students={students} courses={courses} classAssignments={classAssignments} />;
        case View.Students:
          return <Students currentUser={currentUser} students={students} setStudents={updateStudents} onPrintRequest={handlePrintRequest} />;
        case View.Courses:
          return <Courses currentUser={currentUser} teachers={teachers} courses={courses} setCourses={updateCourses} />;
        case View.StudentAttendance:
            return <StudentAttendance currentUser={currentUser} students={students} classAssignments={classAssignments} studentAttendance={studentAttendance} setStudentAttendance={updateStudentAttendance} />;
        case View.LessonPlanner:
            return <LessonPlanner />;
        default:
          return <TeacherDashboard setCurrentView={setCurrentView} currentUser={currentUser} students={students} courses={courses} classAssignments={classAssignments} />;
      }
    } else if (currentUser.role === 'student') {
        switch(currentView) {
            case View.StudentDashboard:
                return <StudentDashboard currentUser={currentUser} assessments={assessments} courses={courses} />;
            case View.Courses:
                return <Courses currentUser={currentUser} teachers={teachers} courses={courses} setCourses={setCourses} />;
            case View.Assessments:
                return <Assessments currentUser={currentUser} students={students} assessments={assessments} setAssessments={setAssessments} courses={courses} />;
            default:
                return <StudentDashboard currentUser={currentUser} assessments={assessments} courses={courses} />;
        }
    }
  };
  
  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout} currentUser={currentUser} schoolName={schoolName} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={title} 
          currentUser={currentUser} 
          onOpenChangePasswordModal={() => setIsChangePasswordModalOpen(true)}
          onOpenEditSchoolNameModal={() => setIsEditSchoolNameModalOpen(true)}
          events={events}
          reminders={reminders}
          setReminders={updateReminders}
          onSave={handleSave}
          isDirty={isDirty}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-6 md:p-8">
          {renderView()}
        </main>
      </div>
       {isChangePasswordModalOpen && currentUser && (
        <ChangePasswordModal
            currentUser={currentUser}
            onClose={() => setIsChangePasswordModalOpen(false)}
            onPasswordUpdate={handlePasswordUpdate}
        />
      )}
      {isEditSchoolNameModalOpen && currentUser?.role === 'admin' && (
        <EditSchoolNameModal
          currentSchoolName={schoolName}
          onClose={() => setIsEditSchoolNameModalOpen(false)}
          onUpdate={handleSchoolNameUpdate}
        />
      )}
    </div>
  );
};

export default App;
