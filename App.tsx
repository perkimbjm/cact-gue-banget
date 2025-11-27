
import React, { useState, useEffect } from "react";
import { UserProfile, AnalysisResult } from "./types";
import { getGenAI } from "./utils";
import { QUESTIONS } from "./data";
import { IntroForm } from "./components/IntroForm";
import { Quiz } from "./components/Quiz";
import { ResultDashboard } from "./components/ResultDashboard";
import { ProgressBar } from "./components/ProgressBar";

const LoadingAnalysis = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 animate-fade-in">
    <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-white mb-4">Menganalisa Jiwa...</h2>
    <ProgressBar label="Menghubungkan MBTI, Temperament, dan Analisa Kompetensi..." />
  </div>
);

export const App = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [step, setStep] = useState<'intro' | 'quiz' | 'analyzing' | 'result'>('intro');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('cact_data');
    if (saved) {
      // Potential logic restoration could go here
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const startQuiz = (u: UserProfile) => {
    setUser(u);
    setStep('quiz');
  };

  const handleAnswerUpdate = (ans: string) => {
    setAnswers(prev => ({ ...prev, [QUESTIONS[currentQ].id]: ans }));
  };

  const handleNext = async () => {
    if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(currentQ + 1);
    } else {
        setStep('analyzing');
        await analyzeProfile(user!, answers); 
    }
  };

  const handlePrev = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  const analyzeProfile = async (u: UserProfile, ans: Record<number, string>) => {
    try {
      const ai = getGenAI();
      const qnaList = QUESTIONS.map(q => `Q: ${q.text} [Category: ${q.category}]\nA: ${ans[q.id]}`).join("\n");
      
      const prompt = `
        Act as an expert psychologist. Analyze these user answers to a personality test (including multiple case studies).
        User: ${u.age} y.o ${u.gender}, ${u.occupation} (${u.generation}).
        
        Input Data:
        ${qnaList}

        Task:
        1. Determine MBTI (4 letters).
        2. Determine dominant Temperament (Sanguine, Choleric, Melancholic, Phlegmatic).
        3. Analyze HEXACO (brief summary of dominant traits).
        4. Analyze HSP (High/Medium/Low and why).
        5. Synthesize all 4 systems into a "Final Profile".
        6. Identify exactly 4 Key Traits (adjectives).
        7. Analyze specific Work Competencies based on the Case Studies provided (Communication, Managing Change, Result Orientation, Public Service, Decision Making). Provide a score (Low/Medium/High) and a very short reasoning (1 sentence).

        TONE & HUMOR RULES:
        - Gen X: Tone is Formal-Casual, Polite (Sopan), Wise, Structured. Avoid slang. Use "Anda/Saya". 
          HUMOR: Use 'Bapak-bapak' jokes, nostalgia (old tech, RCTI, Golden Memories), or mild self-deprecation about age/technology. Polite but funny.
        - Gen Y: Tone is Casual, Relatable, Millennial references, Friendly.
          HUMOR: Jokes about burnout, 'cicilan', 'healing', nostalgia 90s/2000s, 'jompo', or corporate life irony.
        - Gen Z: Tone is Trendy, viral terms, slang (jujurly, valid, no debat), energetic.
          HUMOR: Absurdist, internet slang (ygy, skena, fomo), 'mental health' jokes, or hyperbolic expressions.

        Output JSON format ONLY (no markdown code blocks):
        {
          "mbti": "XXXX",
          "temperament": "Name",
          "finalProfile": {
            "hexacoSummary": "Short phrase",
            "hspLevel": "High/Med/Low",
            "synthesis": "One paragraph combining all traits. Use simple, easy-to-understand Indonesian language suitable for laypeople. Avoid complex jargon.",
            "keyTraits": ["Trait1", "Trait2", "Trait3", "Trait4"],
            "competencies": {
               "communication": "Score (Reason)",
               "managingChange": "Score (Reason)",
               "resultOrientation": "Score (Reason)",
               "publicService": "Score (Reason)",
               "decisionMaking": "Score (Reason)"
            }
          },
          "narrative": {
            "tone": "${u.generation} style",
            "humorousContent": "One unique paragraph + humor strictly following the TONE & HUMOR RULES for ${u.generation} above in Indonesian.",
            "summary": "One compact punchy summary statement."
          }
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const json = JSON.parse(response.text!);
      setResult(json);
      setStep('result');
      
      localStorage.setItem('cact_data', JSON.stringify({ user: u, result: json }));

    } catch (err) {
      console.error("AI Error", err);
      alert("Analysis failed. Please try again.");
      setStep('quiz');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <nav className="p-4 flex justify-between items-center max-w-6xl mx-auto">
        <div className="font-display font-bold text-xl text-purple-600 dark:text-purple-300 tracking-wider">CACT</div>
        <button onClick={toggleTheme} className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm text-xl text-gray-600 dark:text-gray-300">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {step === 'intro' && <IntroForm onStart={startQuiz} />}
        {step === 'quiz' && (
          <Quiz 
            question={QUESTIONS[currentQ]} 
            selectedAnswer={answers[QUESTIONS[currentQ].id]}
            onAnswer={handleAnswerUpdate}
            onNext={handleNext}
            onPrev={handlePrev}
            current={currentQ + 1}
            total={QUESTIONS.length}
          />
        )}
        {step === 'analyzing' && <LoadingAnalysis />}
        {step === 'result' && result && user && (
          <ResultDashboard user={user} result={result} answers={answers} />
        )}
      </main>
    </div>
  );
};
