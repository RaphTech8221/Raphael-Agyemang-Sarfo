import React, { useMemo } from 'react';
import { Student, Assessment, Course } from '../types';

interface PrintableReportProps {
  student: Student;
  schoolName: string;
  assessments: Assessment[];
  courses: Course[];
  onBack: () => void;
}

const PrintableReport: React.FC<PrintableReportProps> = ({ student, schoolName, assessments, courses, onBack }) => {
  const studentAssessments = useMemo(() => {
    return assessments.filter(a => a.studentName === student.name);
  }, [student, assessments]);

  const resultsByCourse = useMemo(() => {
    const grouped: Record<string, { assessments: Assessment[], average: number | string, teacher: string }> = {};

    studentAssessments.forEach(assessment => {
      if (!grouped[assessment.courseName]) {
        const courseInfo = courses.find(c => c.name === assessment.courseName);
        grouped[assessment.courseName] = { assessments: [], average: 0, teacher: courseInfo?.teacher || 'N/A' };
      }
      grouped[assessment.courseName].assessments.push(assessment);
    });

    for (const courseName in grouped) {
      const courseData = grouped[courseName];
      const totalScore = courseData.assessments.reduce((sum, a) => sum + a.score, 0);
      const average = courseData.assessments.length > 0 ? Math.round(totalScore / courseData.assessments.length) : 'N/A';
      grouped[courseName].average = average;
    }

    return grouped;
  }, [studentAssessments, courses]);
  
  const overallAverage = useMemo(() => {
    if (studentAssessments.length === 0) return 'N/A';
    const total = studentAssessments.reduce((sum, a) => sum + a.score, 0);
    return Math.round(total / studentAssessments.length);
  }, [studentAssessments]);

  const getGrade = (score: number | string) => {
    if (typeof score !== 'number') return 'N/A';
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  return (
    <>
      <style>{`
        @media print {
          body {
            background-color: #fff;
          }
          .no-print {
            display: none !important;
          }
          .printable-area {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>
      <div className="no-print p-4 bg-white shadow-md rounded-lg mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-700">Print Preview</h2>
          <div>
              <button
                  onClick={onBack}
                  className="px-4 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition mr-2"
              >
                  <i className="fa-solid fa-arrow-left mr-2"></i>Back to Roster
              </button>
              <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg text-white bg-sky-500 hover:bg-sky-600 transition font-semibold"
              >
                  <i className="fa-solid fa-print mr-2"></i>Print this report
              </button>
          </div>
      </div>
      <div className="printable-area max-w-4xl mx-auto bg-white p-10 rounded-xl shadow-2xl border border-slate-200">
        <header className="flex justify-between items-center pb-6 border-b-2 border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">{schoolName}</h1>
            <p className="text-slate-500">Student Report Card</p>
          </div>
          <i className="fa-solid fa-school text-5xl text-sky-500"></i>
        </header>

        <section className="mt-6 bg-slate-50 p-6 rounded-lg">
            <h2 className="text-lg font-bold text-slate-700 mb-4">Student Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div><strong className="text-slate-600 w-32 inline-block">Student Name:</strong> <span className="text-slate-800 font-semibold">{student.name}</span></div>
                <div><strong className="text-slate-600 w-32 inline-block">Student ID:</strong> <span className="text-slate-800 font-semibold">{student.id}</span></div>
                <div><strong className="text-slate-600 w-32 inline-block">Date of Birth:</strong> <span className="text-slate-800 font-semibold">{student.dateOfBirth}</span></div>
                <div><strong className="text-slate-600 w-32 inline-block">Grade & Class:</strong> <span className="text-slate-800 font-semibold">{student.grade} - {student.className}</span></div>
                <div><strong className="text-slate-600 w-32 inline-block">Guardian:</strong> <span className="text-slate-800 font-semibold">{student.guardian}</span></div>
                <div><strong className="text-slate-600 w-32 inline-block">Guardian Phone:</strong> <span className="text-slate-800 font-semibold">{student.guardianPhone}</span></div>
                <div className="md:col-span-2"><strong className="text-slate-600 w-32 inline-block">Address:</strong> <span className="text-slate-800 font-semibold">{student.address}</span></div>
            </div>
        </section>

        <section className="mt-8">
            <h2 className="text-xl font-bold text-slate-700 mb-4">Academic Performance</h2>
            <div className="space-y-6">
                {Object.keys(resultsByCourse).length > 0 ? Object.keys(resultsByCourse).map((courseName) => {
                    const data = resultsByCourse[courseName];
                    return (
                    <div key={courseName}>
                        <div className="flex justify-between items-baseline bg-slate-100 p-3 rounded-t-lg">
                            <div>
                               <h3 className="font-bold text-slate-800">{courseName}</h3>
                               <p className="text-xs text-slate-500">Teacher: {data.teacher}</p>
                            </div>
                            <p className="text-sm font-semibold text-slate-600">
                                Course Average: <span className="font-bold text-lg text-sky-600">{data.average}% (Grade: {getGrade(data.average)})</span>
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-500 border-x border-b border-slate-200">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-2">Assessment Type</th>
                                        <th className="px-4 py-2">Date</th>
                                        <th className="px-4 py-2 text-right">Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.assessments.map(assessment => (
                                        <tr key={assessment.id} className="border-t border-slate-200">
                                            <td className="px-4 py-2">{assessment.type}</td>
                                            <td className="px-4 py-2">{assessment.date}</td>
                                            <td className="px-4 py-2 text-right font-medium text-slate-800">{assessment.score}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
                }) : (
                    <p className="text-slate-500 text-center py-8 bg-slate-50 rounded-lg">No assessment data available for this student.</p>
                )}
            </div>
        </section>

        <section className="mt-8 bg-sky-50 border-t-4 border-sky-500 p-6 rounded-lg text-center">
            <h3 className="text-slate-600 font-semibold">Overall Academic Average</h3>
            <p className="text-4xl font-bold text-sky-600 my-1">{overallAverage}%</p>
            <p className="text-lg font-semibold text-slate-800">Overall Grade: {getGrade(overallAverage)}</p>
        </section>

        <section className="mt-8">
            <h2 className="text-xl font-bold text-slate-700 mb-4">Teacher's Comments</h2>
            <div className="border border-slate-200 rounded-lg p-4 min-h-[100px] text-slate-600">
                <p>Teacher comments will be available at the end of the term.</p>
            </div>
        </section>

        <footer className="mt-12 pt-6 border-t border-slate-200 flex justify-between text-xs text-slate-500">
          <div>
            <p>&copy; {new Date().getFullYear()} {schoolName}</p>
            <p>Report generated on: {new Date().toLocaleDateString()}</p>
          </div>
          <div className="text-right">
              <div className="mt-6 border-t-2 border-slate-400 border-dotted pt-2 w-48 text-center">
                  <p>Head Teacher's Signature</p>
              </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default PrintableReport;