
import React, { useState } from 'react';
import { generateReportCardComment } from '../services/geminiService';

const ReportCardGenerator: React.FC = () => {
  const [studentName, setStudentName] = useState('');
  const [strengths, setStrengths] = useState('');
  const [areasForImprovement, setAreasForImprovement] = useState('');
  const [generatedComment, setGeneratedComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !strengths || !areasForImprovement) {
      setError('Please fill out all fields.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setGeneratedComment('');

    try {
      const comment = await generateReportCardComment(studentName, strengths, areasForImprovement);
      setGeneratedComment(comment);
    } catch (err) {
      setError('Failed to generate comment. Please check your API key and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedComment);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-md">
        <h3 className="text-2xl font-bold text-slate-800 mb-1">AI Comment Generator</h3>
        <p className="text-slate-500 mb-6">Provide student details to generate a thoughtful report card comment.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="studentName" className="block text-sm font-medium text-slate-700 mb-1">Student Name</label>
            <input
              id="studentName"
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g., Jane Doe"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition"
            />
          </div>
          <div>
            <label htmlFor="strengths" className="block text-sm font-medium text-slate-700 mb-1">Strengths & Positive Qualities</label>
            <textarea
              id="strengths"
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              placeholder="e.g., Excellent participation in class discussions, strong problem-solving skills, very creative."
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition"
            />
          </div>
          <div>
            <label htmlFor="improvement" className="block text-sm font-medium text-slate-700 mb-1">Areas for Improvement</label>
            <textarea
              id="improvement"
              value={areasForImprovement}
              onChange={(e) => setAreasForImprovement(e.target.value)}
              placeholder="e.g., Needs to double-check work for careless errors, can be hesitant to ask for help."
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center disabled:bg-slate-400"
          >
            {isLoading ? (
                <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Generating...
                </>
            ) : (
                <>
                    <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
                    Generate Comment
                </>
            )}
          </button>
        </form>
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">Generated Comment</h3>
          {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-4">{error}</div>}
          <div className="bg-slate-50 p-6 rounded-lg min-h-[300px] text-slate-700 leading-relaxed relative">
              {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-lg">
                      <div className="text-center">
                          <i className="fa-solid fa-spinner fa-spin text-4xl text-sky-500"></i>
                          <p className="mt-2 text-slate-600">Thinking...</p>
                      </div>
                  </div>
              )}
              {generatedComment ? (
                  <>
                      <p>{generatedComment}</p>
                      <button onClick={handleCopy} className="absolute top-4 right-4 bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold py-1 px-3 rounded-lg text-sm transition">
                          <i className="fa-solid fa-copy mr-2"></i>Copy
                      </button>
                  </>
              ) : (
                  !isLoading && <p className="text-slate-400">Your generated comment will appear here.</p>
              )}
          </div>
      </div>
    </div>
  );
};

export default ReportCardGenerator;
