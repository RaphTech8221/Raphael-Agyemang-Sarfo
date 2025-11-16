import React, { useState } from 'react';
import { generateLessonPlan } from '../services/geminiService';

const LessonPlanner: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('45');
  const [objectives, setObjectives] = useState('');

  const [generatedPlan, setGeneratedPlan] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !gradeLevel || !topic || !duration || !objectives) {
      setError('Please fill out all fields.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setGeneratedPlan('');

    try {
      const plan = await generateLessonPlan(subject, gradeLevel, topic, duration, objectives);
      setGeneratedPlan(plan);
    } catch (err) {
      setError('Failed to generate lesson plan. Please check your API key and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedPlan) {
      navigator.clipboard.writeText(generatedPlan);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-md">
        <h3 className="text-2xl font-bold text-slate-800 mb-1">AI Lesson Planner</h3>
        <p className="text-slate-500 mb-6">Describe your lesson, and let AI build a comprehensive plan.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Science"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label htmlFor="gradeLevel" className="block text-sm font-medium text-slate-700 mb-1">Grade Level</label>
              <input
                id="gradeLevel"
                type="text"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                placeholder="e.g., 8th Grade"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
          </div>
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-slate-700 mb-1">Lesson Topic</label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Photosynthesis"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
           <div>
            <label htmlFor="duration" className="block text-sm font-medium text-slate-700 mb-1">Duration (minutes)</label>
            <input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 45"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
          <div>
            <label htmlFor="objectives" className="block text-sm font-medium text-slate-700 mb-1">Key Learning Objectives</label>
            <textarea
              id="objectives"
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              placeholder="e.g., - Students will be able to define photosynthesis.&#10;- Students will be able to identify the reactants and products."
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center disabled:bg-slate-400"
          >
            {isLoading ? (
                <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Generating...
                </>
            ) : (
                <>
                    <i className="fa-solid fa-lightbulb mr-2"></i>
                    Generate Lesson Plan
                </>
            )}
          </button>
        </form>
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">Generated Lesson Plan</h3>
          {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-4">{error}</div>}
          <div className="bg-slate-50 p-6 rounded-lg min-h-[400px] text-slate-700 leading-relaxed relative overflow-y-auto max-h-[60vh]">
              {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-lg z-10">
                      <div className="text-center">
                          <i className="fa-solid fa-spinner fa-spin text-4xl text-indigo-500"></i>
                          <p className="mt-2 text-slate-600">Building your lesson plan...</p>
                      </div>
                  </div>
              )}
              {generatedPlan ? (
                  <>
                      <div className="whitespace-pre-wrap font-sans">{generatedPlan}</div>
                      <button onClick={handleCopy} className="absolute top-4 right-4 bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold py-1 px-3 rounded-lg text-sm transition">
                          {copySuccess ? (
                            <><i className="fa-solid fa-check mr-2 text-green-500"></i>Copied!</>
                          ) : (
                            <><i className="fa-solid fa-copy mr-2"></i>Copy</>
                          )}
                      </button>
                  </>
              ) : (
                  !isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                        <i className="fa-solid fa-file-lines text-5xl mb-4"></i>
                        <p>Your generated lesson plan will appear here.</p>
                    </div>
                  )
              )}
          </div>
      </div>
    </div>
  );
};

export default LessonPlanner;