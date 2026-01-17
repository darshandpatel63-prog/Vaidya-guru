import React, { useState } from 'react';
import { User, Exam } from '../types';

export const ExamPortal: React.FC<{ user: User }> = ({ user }) => {
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const MOCK_EXAMS: Exam[] = [{
    id: 'e1', title: 'Basic Ayurveda Quiz', subject: 'Kaya Chikitsa', durationMinutes: 10, createdAt: Date.now(), createdBy: 'Prof. Aryan',
    questions: [
      { id: 'q1', text: 'Who wrote Charaka Samhita?', options: ['Sushruta', 'Charaka', 'Vagbhata', 'Dhanvantari'], correctAnswer: 1 },
      { id: 'q2', text: 'Which Dosha is related to movement?', options: ['Vata', 'Pitta', 'Kapha', 'All'], correctAnswer: 0 }
    ]
  }];

  if (isFinished) return (
    <div className="p-10 text-center bg-white rounded-[3rem] shadow-xl">
       <h2 className="text-3xl font-bold text-green-900 mb-4">Exam Submitted!</h2>
       <p className="text-stone-400 mb-8">Your results will be reviewed by the professor.</p>
       <button onClick={() => setIsFinished(false)} className="px-10 py-4 bg-green-900 text-white rounded-full font-bold">Return to Portal</button>
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold serif-font text-stone-800 mb-8">Exam Portal</h2>
      <div className="grid gap-6">
        {MOCK_EXAMS.map(ex => (
          <div key={ex.id} className="bg-white p-6 rounded-[2.5rem] border flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">{ex.title}</h3>
              <p className="text-xs text-stone-400">{ex.subject} • {ex.durationMinutes} Mins</p>
            </div>
            <button onClick={() => setIsFinished(true)} className="px-6 py-2 bg-green-900 text-white rounded-full font-bold">Start Now</button>
          </div>
        ))}
      </div>
    </div>
  );
};
