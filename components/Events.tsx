import React, { useState } from 'react';
import { SchoolEvent } from '../types';

const eventCategories: SchoolEvent['category'][] = ['Academic', 'Sports', 'Arts', 'Community'];

const getCategoryStyle = (category: SchoolEvent['category']) => {
    switch (category) {
        case 'Academic':
            return { icon: 'fa-solid fa-book-open', color: 'bg-sky-500', borderColor: 'border-sky-500' };
        case 'Sports':
            return { icon: 'fa-solid fa-futbol', color: 'bg-amber-500', borderColor: 'border-amber-500' };
        case 'Arts':
            return { icon: 'fa-solid fa-palette', color: 'bg-purple-500', borderColor: 'border-purple-500' };
        case 'Community':
            return { icon: 'fa-solid fa-users', color: 'bg-emerald-500', borderColor: 'border-emerald-500' };
        default:
            return { icon: 'fa-solid fa-calendar-day', color: 'bg-slate-500', borderColor: 'border-slate-500' };
    }
};

interface EventsProps {
    events: SchoolEvent[];
    setEvents: React.Dispatch<React.SetStateAction<SchoolEvent[]>>;
    reminders: number[];
    setReminders: React.Dispatch<React.SetStateAction<number[]>>;
}

const Events: React.FC<EventsProps> = ({ events, setEvents, reminders, setReminders }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<Omit<SchoolEvent, 'id'> & { id?: number }>({
        title: '',
        date: '',
        description: '',
        category: 'Academic',
    });

    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setCurrentEvent({
            title: '',
            date: new Date().toISOString().split('T')[0],
            description: '',
            category: 'Academic',
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (event: SchoolEvent) => {
        setIsEditMode(true);
        setCurrentEvent(event);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCurrentEvent(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentEvent.title && currentEvent.date && currentEvent.description) {
            if (isEditMode) {
                setEvents(prev => prev.map(ev => ev.id === currentEvent.id ? (currentEvent as SchoolEvent) : ev));
            } else {
                const newEvent: SchoolEvent = {
                    ...currentEvent,
                    id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
                };
                setEvents(prev => [...prev, newEvent]);
            }
            handleCloseModal();
        }
    };
    
    const handleToggleReminder = (eventId: number) => {
        setReminders(prev => 
            prev.includes(eventId)
                ? prev.filter(id => id !== eventId)
                : [...prev, eventId]
        );
    };

    const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <>
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <h3 className="text-xl font-bold text-slate-700">School Events</h3>
                    <button
                        onClick={handleOpenAddModal}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center">
                        <i className="fa-solid fa-plus mr-2"></i>
                        Add Event
                    </button>
                </div>
                <div className="space-y-4">
                    {sortedEvents.map(event => {
                        const { icon, color, borderColor } = getCategoryStyle(event.category);
                        const isReminderSet = reminders.includes(event.id);
                        return (
                            <div key={event.id} className={`p-4 border-l-4 ${borderColor} bg-slate-50 rounded-r-lg flex items-start space-x-4`}>
                                <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${color}`}>
                                    <i className={`${icon} text-white text-xl`}></i>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-slate-800 text-lg">{event.title}</h4>
                                        <span className="text-sm font-medium text-slate-600">{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                                </div>
                                <div className="flex flex-col items-center space-y-2 ml-2">
                                    <button onClick={() => handleOpenEditModal(event)} className="text-slate-400 hover:text-sky-600 transition-colors" aria-label="Edit event">
                                        <i className="fa-solid fa-pencil"></i>
                                    </button>
                                    <button 
                                        onClick={() => handleToggleReminder(event.id)} 
                                        className={`text-slate-400 hover:text-amber-600 transition-colors ${isReminderSet ? 'text-amber-500' : ''}`}
                                        aria-label={isReminderSet ? "Remove reminder" : "Set reminder"}
                                    >
                                        <i className={`${isReminderSet ? 'fa-solid' : 'fa-regular'} fa-bell`}></i>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg m-4 transform transition-all duration-300 ease-out animate-fade-in-up">
                        <style>{`
                            @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
                            .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
                        `}</style>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-slate-800">{isEditMode ? 'Edit Event' : 'Add New Event'}</h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 focus:outline-none">
                                <i className="fa-solid fa-times text-2xl"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
                                <input id="title" name="title" type="text" value={currentEvent.title} onChange={handleInputChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <input id="date" name="date" type="date" value={currentEvent.date} onChange={handleInputChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition" />
                                </div>
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                    <select id="category" name="category" value={currentEvent.category} onChange={handleInputChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition">
                                        {eventCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea id="description" name="description" value={currentEvent.description} onChange={handleInputChange} required rows={4} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition" />
                            </div>
                            <div className="flex justify-end pt-4 space-x-4">
                                <button type="button" onClick={handleCloseModal} className="px-6 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition">Cancel</button>
                                <button type="submit" className="px-6 py-2 rounded-lg text-white bg-amber-500 hover:bg-amber-600 transition font-semibold">{isEditMode ? 'Save Changes' : 'Add Event'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Events;