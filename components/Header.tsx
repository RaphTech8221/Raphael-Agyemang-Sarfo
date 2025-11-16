
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ANNOUNCEMENTS_DATA } from '../constants';
import { User, SchoolEvent } from '../types';

interface HeaderProps {
  title: string;
  currentUser: User;
  onOpenChangePasswordModal: () => void;
  onOpenEditSchoolNameModal: () => void;
  events: SchoolEvent[];
  reminders: number[];
  setReminders: React.Dispatch<React.SetStateAction<number[]>>;
  onSave: () => Promise<boolean>;
  isDirty: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, currentUser, onOpenChangePasswordModal, onOpenEditSchoolNameModal, events, reminders, setReminders, onSave, isDirty }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [unreadAnnouncementsCount, setUnreadAnnouncementsCount] = useState(ANNOUNCEMENTS_DATA.length);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDirty && saveStatus === 'saved') {
      const timer = setTimeout(() => setSaveStatus('idle'), 2000);
      return () => clearTimeout(timer);
    } else if (!isDirty) {
      setSaveStatus('idle');
    }
  }, [isDirty, saveStatus]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const upcomingReminders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare dates only, not time
    return events
        .filter(event => reminders.includes(event.id) && new Date(event.date) >= today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, reminders]);
  
  const totalNotifications = unreadAnnouncementsCount + upcomingReminders.length;
  
  const handleNotificationsToggle = () => {
    if (!isNotificationsOpen) {
      setUnreadAnnouncementsCount(0);
    }
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const handleRemoveReminder = (eventId: number) => {
    setReminders(prev => prev.filter(id => id !== eventId));
  };

  const handleSaveClick = async () => {
    setSaveStatus('saving');
    const success = await onSave();
    if (success) {
      setSaveStatus('saved');
    } else {
      setSaveStatus('idle');
      alert('An error occurred while saving. Please try again.');
    }
  };

  const renderSaveButton = () => {
    if (saveStatus === 'saved') {
      return (
        <button disabled className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-all duration-300 animate-fade-in-sm">
           <style>{`
            @keyframes fade-in-sm { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
            .animate-fade-in-sm { animation: fade-in-sm 0.3s ease-out forwards; }
          `}</style>
          <i className="fa-solid fa-check mr-2"></i>
          Saved
        </button>
      );
    }
  
    if (!isDirty) {
      return null;
    }
  
    return (
      <button
        onClick={handleSaveClick}
        disabled={saveStatus === 'saving'}
        className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-all duration-200 disabled:bg-slate-400 disabled:cursor-wait animate-fade-in-sm"
      >
        {saveStatus === 'saving' ? (
          <>
            <i className="fa-solid fa-spinner fa-spin mr-2"></i>
            Saving...
          </>
        ) : (
          'Save Changes'
        )}
      </button>
    );
  };

  return (
    <header className="bg-white shadow-sm h-20 flex items-center justify-between px-8">
      <h2 className="text-3xl font-bold text-slate-700">{title}</h2>
      <div className="flex items-center space-x-6">
          {renderSaveButton()}
          <div className="relative" ref={notificationsRef}>
             <button
                onClick={handleNotificationsToggle}
                className="relative text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 rounded-full p-2"
                aria-label="Toggle notifications"
              >
                  <i className="fa-solid fa-bell text-xl"></i>
                  {totalNotifications > 0 && (
                     <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center border-2 border-white">{totalNotifications}</span>
                  )}
              </button>
              {isNotificationsOpen && (
                 <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-20 animate-fade-in-down">
                    <style>{`
                      @keyframes fade-in-down { 0% { opacity: 0; transform: translateY(-10px); } 100% { opacity: 1; transform: translateY(0); } }
                      .animate-fade-in-down { animation: fade-in-down 0.2s ease-out forwards; }
                    `}</style>
                    <div className="p-4 font-bold text-slate-700 border-b">Notifications</div>
                    <ul className="divide-y max-h-80 overflow-y-auto">
                        {upcomingReminders.length > 0 && (
                            <>
                                <li className="p-2 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">Event Reminders</li>
                                {upcomingReminders.map(event => (
                                    <li key={`reminder-${event.id}`} className="p-4 hover:bg-slate-50 transition-colors group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-sm text-slate-800">{event.title}</p>
                                                <p className="text-xs text-slate-500 mt-1">{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                                            </div>
                                            <button onClick={() => handleRemoveReminder(event.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0" aria-label="Remove reminder">
                                                <i className="fa-solid fa-times"></i>
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </>
                        )}

                        {ANNOUNCEMENTS_DATA.length > 0 && (
                             <>
                                <li className="p-2 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">Announcements</li>
                                {ANNOUNCEMENTS_DATA.map(item => (
                                    <li key={item.id} className="p-4 hover:bg-slate-50 transition-colors">
                                        <p className="font-semibold text-sm text-slate-800">{item.title}</p>
                                        <p className="text-xs text-slate-500 mt-1">{item.content}</p>
                                        <p className="text-right text-xs text-slate-400 mt-2">{item.date}</p>
                                    </li>
                                ))}
                            </>
                        )}

                         {totalNotifications === 0 && (
                            <li className="p-4 text-center text-sm text-slate-500">No new notifications.</li>
                         )}
                    </ul>
                 </div>
              )}
          </div>
          <div className="relative" ref={profileMenuRef}>
            <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center p-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400">
              <div className="w-12 h-12">
                  <img
                      src={currentUser.imageUrl || `https://picsum.photos/seed/${currentUser.id}/200`}
                      alt={currentUser.name}
                      className="w-full h-full rounded-full object-cover"
                  />
              </div>
              <div className="ml-3 text-right">
                <p className="text-sm font-semibold text-slate-800">{currentUser.name}</p>
                {currentUser.role === 'teacher' && <p className="text-xs text-slate-500">{currentUser.subject}</p>}
                {currentUser.role === 'admin' && <p className="text-xs text-slate-500">Administrator</p>}
                {currentUser.role === 'student' && <p className="text-xs text-slate-500">Grade: {currentUser.grade}</p>}
              </div>
              <i className="fa-solid fa-chevron-down text-xs text-slate-500 ml-2"></i>
            </button>
             {isProfileMenuOpen && (
                 <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl z-20 animate-fade-in-down">
                     <ul className="py-1">
                        {currentUser.role === 'admin' && (
                          <li>
                            <a href="#" onClick={(e) => { e.preventDefault(); onOpenEditSchoolNameModal(); setIsProfileMenuOpen(false); }} className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                                <i className="fa-solid fa-school w-6 text-slate-500"></i>
                                <span>Edit School Name</span>
                            </a>
                          </li>
                        )}
                        <li>
                            <a href="#" onClick={(e) => { e.preventDefault(); onOpenChangePasswordModal(); setIsProfileMenuOpen(false); }} className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                                <i className="fa-solid fa-key w-6 text-slate-500"></i>
                                <span>Change Password</span>
                            </a>
                        </li>
                     </ul>
                 </div>
             )}
          </div>
      </div>
    </header>
  );
};

export default Header;
