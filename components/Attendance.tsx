
import React, { useState, useMemo, useEffect } from 'react';
import { AttendanceRecord, Teacher } from '../types';

const attendanceStatuses: AttendanceRecord['status'][] = ['Present', 'Absent', 'Checked Out'];

interface AttendanceProps {
  teachers: Teacher[];
  allAttendance: Record<string, AttendanceRecord[]>;
  setAllAttendance: (updater: React.SetStateAction<Record<string, AttendanceRecord[]>>) => void;
}

const Attendance: React.FC<AttendanceProps> = ({ teachers, allAttendance, setAllAttendance }) => {
  const today = new Date().toISOString().split('T')[0];
  
  useEffect(() => {
    // This effect ensures that there's an entry for today if one doesn't exist,
    // and syncs it with the current teacher list.
    const recordsForDay = allAttendance[today] || [];
    const attendanceMap = new Map(recordsForDay.map(rec => [rec.teacherId, rec]));
    const syncedRecords = teachers.map(teacher => 
        attendanceMap.get(teacher.id) || {
            teacherId: teacher.id,
            teacherName: teacher.name,
            status: 'Absent',
            checkInTime: null,
            checkOutTime: null,
        }
    ) as AttendanceRecord[];
    
    // Only update state if the list for today doesn't exist or is out of sync.
    if (!allAttendance[today] || JSON.stringify(allAttendance[today]) !== JSON.stringify(syncedRecords)) {
        setAllAttendance(prevAll => ({ ...prevAll, [today]: syncedRecords }));
    }
  }, [today, teachers, allAttendance, setAllAttendance]);

  const attendanceForToday = useMemo(() => allAttendance[today] || [], [allAttendance, today]);


  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleRefreshList = () => {
    const recordsForDay = allAttendance[today] || [];
    const attendanceMap = new Map(recordsForDay.map(rec => [rec.teacherId, rec]));
    const syncedRecords = teachers.map(teacher => 
        attendanceMap.get(teacher.id) || {
            teacherId: teacher.id,
            teacherName: teacher.name,
            status: 'Absent',
            checkInTime: null,
            checkOutTime: null,
        }
    ) as AttendanceRecord[];
    setAllAttendance(prevAll => ({ ...prevAll, [today]: syncedRecords }));
  };

  const handleCheckIn = (teacherId: string) => {
    setAllAttendance(prevAll => {
        const recordsForDay = (prevAll[today] || []).map(record => {
          if (record.teacherId === teacherId) {
              const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
              return {
                ...record,
                status: 'Present' as 'Present',
                checkInTime: record.checkInTime || now,
                checkOutTime: null,
              };
          }
          return record;
        });
        return { ...prevAll, [today]: recordsForDay };
    });
  };

  const handleCheckOut = (teacherId: string) => {
    setAllAttendance(prevAll => {
      const recordsForDay = (prevAll[today] || []).map(record =>
        record.teacherId === teacherId
          ? {
              ...record,
              status: 'Checked Out' as 'Checked Out',
              checkOutTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            }
          : record
      );
      return { ...prevAll, [today]: recordsForDay };
    });
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
  };

  const filteredAttendance = useMemo(() => attendanceForToday.filter(record => {
    const searchMatch = record.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        record.teacherId.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = selectedStatus ? record.status === selectedStatus : true;
    return searchMatch && statusMatch;
  }), [attendanceForToday, searchTerm, selectedStatus]);

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'Present':
        return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Present</span>;
      case 'Absent':
        return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">Absent</span>;
      case 'Checked Out':
        return <span className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-200 rounded-full">Checked Out</span>;
      default:
        return null;
    }
  };

  const attendanceSummary = useMemo(() => {
    return attendanceForToday.reduce((acc, record) => {
        if (record.status === 'Present') acc.Present++;
        else if (record.status === 'Absent') acc.Absent++;
        else if (record.status === 'Checked Out') acc.CheckedOut++;
        return acc;
    }, { Present: 0, Absent: 0, CheckedOut: 0 });
  }, [attendanceForToday]);


  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h3 className="text-xl font-bold text-slate-700">Teacher Attendance Log</h3>
        <p className="text-sm text-slate-500">Today's Date: {new Date().toLocaleDateString()}</p>
      </div>
      
      <div className="bg-slate-50 p-4 rounded-lg flex flex-wrap justify-between items-center gap-4 mb-6 border border-slate-200">
        <div className="flex items-center gap-x-6 gap-y-2 flex-wrap text-sm">
            <span className="font-semibold text-slate-700">Daily Summary:</span>
            <span className="text-green-600 font-medium flex items-center">
                <i className="fa-solid fa-check-circle mr-1.5"></i>
                Present: {attendanceSummary.Present}
            </span>
            <span className="text-red-600 font-medium flex items-center">
                 <i className="fa-solid fa-times-circle mr-1.5"></i>
                Absent: {attendanceSummary.Absent}
            </span>
            <span className="text-slate-600 font-medium flex items-center">
                <i className="fa-solid fa-arrow-right-from-bracket mr-1.5"></i>
                Checked Out: {attendanceSummary.CheckedOut}
            </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-grow sm:flex-grow-0">
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition"
            />
          </div>
          <div className="relative flex-grow sm:flex-grow-0">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full sm:w-48 px-4 py-2 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition appearance-none pr-8 bg-white"
            >
              <option value="">All Statuses</option>
              {attendanceStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
          </div>
          <button onClick={resetFilters} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
            Reset Filters
          </button>
          <button
            onClick={handleRefreshList}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg transition flex items-center"
          >
            <i className="fa-solid fa-sync-alt mr-2"></i>
            Refresh List
          </button>
        </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3">Teacher ID</th>
              <th scope="col" className="px-6 py-3">Teacher Name</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Check-in Time</th>
              <th scope="col" className="px-6 py-3">Check-out Time</th>
              <th scope="col" className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendance.map(record => (
              <tr key={record.teacherId} className="bg-white border-b hover:bg-slate-50">
                <td className="px-6 py-4">
                  <code className="bg-slate-100 text-slate-800 font-mono font-semibold px-2 py-1 rounded-md text-sm">
                    {record.teacherId}
                  </code>
                </td>
                <td className="px-6 py-4">{record.teacherName}</td>
                <td className="px-6 py-4">{getStatusBadge(record.status)}</td>
                <td className="px-6 py-4">{record.checkInTime || '--:--'}</td>
                <td className="px-6 py-4">{record.checkOutTime || '--:--'}</td>
                <td className="px-6 py-4 text-center space-x-2">
                  <button
                    onClick={() => handleCheckIn(record.teacherId)}
                    disabled={record.status === 'Present'}
                    className="font-medium text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded-lg text-xs disabled:bg-slate-300 disabled:cursor-not-allowed transition"
                  >
                    Check In
                  </button>
                  <button
                    onClick={() => handleCheckOut(record.teacherId)}
                    disabled={record.status !== 'Present'}
                    className="font-medium text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg text-xs disabled:bg-slate-300 disabled:cursor-not-allowed transition"
                  >
                    Check Out
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
