
import React, { useState, useRef } from "react";
import { UserProfile, AnalysisResult } from "../types";
import { getGenAI, cn } from "../utils";
import { ProgressBar } from "./ProgressBar";
import html2canvas from "html2canvas";

interface ResultDashboardProps {
  user: UserProfile;
  result: AnalysisResult;
  answers: Record<number, string>;
}

export const ResultDashboard = ({ user, result }: ResultDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'recommendations' | 'characters'>('profile');
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [characters, setCharacters] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [recType, setRecType] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const generateRecommendations = async (typeId: string, typeLabel: string) => {
    setRecType(typeLabel);
    setLoadingAI(true);
    setRecommendations(null);
    try {
      const ai = getGenAI();
      const prompt = `
        User Profile:
        - MBTI: ${result.mbti}
        - Temperament: ${result.temperament}
        - Synthesis: ${result.finalProfile.synthesis}
        - Generation: ${user.generation}
        - Occupation: ${user.occupation}

        Based on this psychological profile, give specific, actionable advice for: "${typeLabel}".
        
        Constraints:
        1. Language: Indonesian.
        2. Tone: Helpful but tailored to ${user.generation}.
        3. Length: Maximum 300 characters total. Keep it concise and punchy.
        4. Format: HTML tags (<ul>, <li>, <strong>, <p>) for styling. No markdown code blocks.
      `;
      const resp = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      setRecommendations(resp.text || "Gagal memuat rekomendasi.");
    } catch (e) {
      console.error(e);
      setRecommendations("Error generating advice.");
    } finally {
      setLoadingAI(false);
    }
  };

  const generateCharacters = async () => {
    setLoadingAI(true);
    setCharacters(null);
    try {
      const ai = getGenAI();
      const prompt = `
        User: ${user.age} years old ${user.gender} (${user.generation}).
        Profile: ${result.mbti} + ${result.temperament}.
        
        Task: Match fictional characters based on these RULES:
        
        IF GEN X (Male): 90s RCTI Western/HK films, Avengers/DC.
        IF GEN X (Female): 90s RCTI Western dramas, 2000s Indo soap operas, K-Drama.
        IF GEN Y (Male): Naruto, One Piece, 2000s Sunday Cartoons, Kamen Rider.
        IF GEN Y (Female): Naruto, 2000s Sunday Cartoons RCTI Indonesia, K-Drama.
        IF GEN Z (Male): Naruto, One Piece, Mobile Legends.
        IF GEN Z (Female): Naruto, K-Drama, Female Cartoons (Barbie/Anime/BoBoiBoy/Upin-Ipin).

        Provide 3 matches. 
        
        Constraints:
        1. For each, give the Character Name, Origin, and a Short Justification connecting to user's personality (${result.mbti}/${result.temperament}).
        2. Length: Maximum 300 characters per character justification.
        3. Format: HTML string with <div class="mb-4"><h3>Name</h3><p>Justification</p></div> structure. No markdown code blocks.
        4. Language: Indonesian. Casual tone.
      `;
      const resp = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      setCharacters(resp.text || "Gagal memuat karakter.");
    } catch (e) {
      console.error(e);
      setCharacters("Error generating characters.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      // Small delay to ensure render
      await new Promise(r => setTimeout(r, 100));
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // Retina quality
        useCORS: true,
        backgroundColor: null
      });
      
      const link = document.createElement('a');
      link.download = `CACT-Result-${user.nickname}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();
    } catch (err) {
      console.error("Download failed", err);
      alert("Gagal mendownload gambar.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsSharing(true);
    try {
      await new Promise(r => setTimeout(r, 100));
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
            setIsSharing(false);
            return;
        }
        const file = new File([blob], `CACT-${user.nickname}.jpg`, { type: 'image/jpeg' });
        
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
             try {
                await navigator.share({
                    title: 'CACT Gue Banget Result',
                    text: `Cek profil psikologi gue: ${result.mbti} + ${result.temperament} di CACT Gue Banget!`,
                    files: [file]
                });
             } catch (shareError) {
                console.log('Share cancelled', shareError);
             }
        } else {
             alert("Browser kamu tidak mendukung share gambar langsung. Gambar akan di-download otomatis ya!");
             const link = document.createElement('a');
             link.download = `CACT-Result-${user.nickname}.jpg`;
             link.href = canvas.toDataURL('image/jpeg', 0.9);
             link.click();
        }
        setIsSharing(false);
      }, 'image/jpeg', 0.9);
    } catch (err) {
      console.error("Share failed", err);
      setIsSharing(false);
      alert("Gagal memproses gambar untuk share.");
    }
  };

  const recOptions = [
    { id: "Career Development", label: "Pengembangan Karir" },
    { id: "Coworker Relationships", label: "Hubungan Rekan Kerja" },
    { id: "Upskilling Needs", label: "Kebutuhan Upskilling" },
    { id: "Business Ideas", label: "Ide Bisnis" },
    { id: "Personal Weaknesses", label: "Kelemahan Pribadi" }
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 animate-fade-in pb-20 relative">
      
      {/* Off-screen Capture Card */}
      <div className="fixed left-[-9999px] top-0">
        <div ref={cardRef} className="w-[600px] h-[900px] bg-gradient-to-br from-pastel-blue via-white to-pastel-pink p-8 flex flex-col items-center justify-between text-center relative border-8 border-white">
          <div className="w-full">
            <h2 className="text-3xl font-display font-bold text-purple-600 tracking-wider mb-2">CACT Gue Banget</h2>
            <div className="h-1 w-24 bg-purple-400 mx-auto rounded-full"></div>
          </div>

          <div className="flex-1 flex flex-col justify-center w-full space-y-8">
            <div>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-1">Nickname</p>
              <h1 className="text-5xl font-display font-bold text-gray-800">{user.nickname}</h1>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full px-8">
              <div className="bg-white/80 p-6 rounded-2xl shadow-sm border border-purple-100">
                 <p className="text-xs text-purple-600 uppercase font-bold mb-2">MBTI</p>
                 <p className="text-4xl font-bold text-gray-800">{result.mbti}</p>
              </div>
              <div className="bg-white/80 p-6 rounded-2xl shadow-sm border border-purple-100">
                 <p className="text-xs text-purple-600 uppercase font-bold mb-2">Temperament</p>
                 <p className="text-2xl font-bold text-gray-800 break-words">{result.temperament}</p>
              </div>
            </div>

            <div className="w-full px-8">
               <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-4">4 Key Traits</p>
               <div className="grid grid-cols-2 gap-3">
                 {result.finalProfile.keyTraits?.slice(0, 4).map((trait, i) => (
                    <div key={i} className="bg-purple-600 text-white py-3 px-4 rounded-xl font-bold text-xl shadow-md">
                      {trait}
                    </div>
                 ))}
               </div>
            </div>
          </div>

          <div className="w-full pt-6 border-t border-gray-200/50">
             <p className="text-gray-500 text-sm italic">"{result.narrative.summary}"</p>
             <p className="text-xs text-gray-400 mt-2">Analyzed by CACT AI</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-xl mb-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pastel-blue via-pastel-purple to-pastel-pink"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
           <span className="inline-block px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold tracking-wider uppercase">
            {user.generation} Profile
          </span>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
                onClick={handleShare}
                disabled={isSharing || isDownloading}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold shadow-md transition disabled:opacity-50 transform hover:scale-105"
            >
                {isSharing ? 'Sharing...' : '🔗 Share'}
            </button>
            <button 
                onClick={handleDownload}
                disabled={isDownloading || isSharing}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold shadow-md transition disabled:opacity-50 transform hover:scale-105"
            >
                {isDownloading ? 'Saving...' : '📥 Download Hasil'}
            </button>
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-800 dark:text-white mb-2">
          {result.mbti} <span className="text-purple-500">+</span> {result.temperament}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 italic mb-6">"{result.narrative.summary}"</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
           <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-xl">
             <span className="text-xs text-blue-600 dark:text-blue-300 uppercase font-bold">HEXACO</span>
             <p className="font-bold text-gray-800 dark:text-white leading-tight mt-1">{result.finalProfile.hexacoSummary}</p>
           </div>
           <div className="bg-pink-50 dark:bg-gray-700 p-4 rounded-xl">
             <span className="text-xs text-pink-600 dark:text-pink-300 uppercase font-bold">HSP Level</span>
             <p className="font-bold text-gray-800 dark:text-white leading-tight mt-1">{result.finalProfile.hspLevel}</p>
           </div>
           <div className="col-span-2 bg-purple-50 dark:bg-gray-700 p-4 rounded-xl">
              <span className="text-xs text-purple-600 dark:text-purple-300 uppercase font-bold">Vibe Check</span>
              <p className="text-lg font-medium text-gray-800 dark:text-white mt-1">{result.narrative.humorousContent}</p>
           </div>
        </div>
      </div>

      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'profile', label: 'Full Analysis' },
          { id: 'recommendations', label: 'Rekomendasi' },
          { id: 'characters', label: 'Matching Characters' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all",
              activeTab === tab.id 
                ? "bg-pastel-blue text-blue-900 shadow-lg scale-105" 
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-lg min-h-[300px]">
        {activeTab === 'profile' && (
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="font-display text-2xl mb-4 text-purple-600 dark:text-purple-300">Synthesis Profile</h3>
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
              {result.finalProfile.synthesis}
            </p>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <h3 className="font-display text-2xl mb-4 text-purple-600 dark:text-purple-300">Pilih Topik Rekomendasi</h3>
            <div className="flex flex-wrap gap-3 mb-6">
              {recOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => generateRecommendations(opt.id, opt.label)}
                  className="px-4 py-2 border-2 border-pastel-blue rounded-xl text-sm font-bold text-blue-700 dark:text-blue-300 hover:bg-pastel-blue hover:text-blue-900 transition"
                >
                  {opt.label}
                </button>
              ))}
            </div>
            
            {loadingAI && (
              <div className="py-8">
                 <ProgressBar label="Meracik rekomendasi terbaik..." />
              </div>
            )}
            
            {recommendations && !loadingAI && (
              <div className="bg-blue-50 dark:bg-gray-900 p-6 rounded-2xl animate-fade-in border border-blue-100 dark:border-gray-700">
                <h4 className="font-bold text-lg mb-4 text-blue-800 dark:text-blue-200">{recType}</h4>
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200"
                  dangerouslySetInnerHTML={{ __html: recommendations }} 
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'characters' && (
          <div className="text-center">
             {!characters && !loadingAI && (
               <div className="py-10">
                 <p className="mb-6 text-gray-600 dark:text-gray-400">Lihat karakter fiksi yang "Gue Banget" sesuai generasi kamu!</p>
                 <button 
                  onClick={generateCharacters}
                  className="bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold py-4 px-8 rounded-full shadow-lg transform hover:scale-110 transition duration-300"
                 >
                   Cek Kembaran Fiksi Gue
                 </button>
               </div>
             )}

             {loadingAI && (
                <div className="py-10">
                   <ProgressBar label="Menjelajahi alam lain untuk mencari kembaranmu..." />
                </div>
             )}

             {characters && !loadingAI && (
               <div className="text-left animate-fade-in space-y-4">
                 <h3 className="font-display text-2xl text-center mb-8 text-purple-600 dark:text-purple-300">Your Fictional Squad</h3>
                 <div 
                  className="grid gap-6 md:grid-cols-1 text-gray-800 dark:text-gray-200"
                  dangerouslySetInnerHTML={{ __html: characters }} 
                 />
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};
