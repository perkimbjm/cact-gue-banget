
import React, { useState, useRef } from "react";
import { UserProfile, AnalysisResult, CharacterMatch } from "../types";
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
  const [characters, setCharacters] = useState<CharacterMatch[] | null>(null);
  
  // Stores images for specific characters: { "Naruto": "base64..." }
  const [charImages, setCharImages] = useState<Record<string, string>>({});
  const [loadingCharImg, setLoadingCharImg] = useState<string | null>(null); // Name of char loading

  const [loadingAI, setLoadingAI] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [recType, setRecType] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const getStylePrompt = (origin: string) => {
    const o = origin.toLowerCase();
    if (o.includes('naruto') || o.includes('one piece') || o.includes('anime')) return "Japanese Anime art style, vibrant, cel-shaded, high quality 2D animation style";
    if (o.includes('avengers') || o.includes('dc') || o.includes('marvel')) return "American Comic Book art style, bold lines, dynamic lighting, heroic pose";
    if (o.includes('rcti') || o.includes('film') || o.includes('western') || o.includes('hk')) return "90s Retro Movie Poster art style, realistic, cinematic, vintage filter effect";
    if (o.includes('kamen rider') || o.includes('showa') || o.includes('heisei')) return "Tokusatsu Japanese Superhero style, dramatic suit detail, live action special effects style";
    if (o.includes('cartoon') || o.includes('boboi') || o.includes('upin')) return "Saturday Morning Cartoon art style, expressive, colorful, flat 2D";
    if (o.includes('k-drama') || o.includes('drama')) return "Korean Drama Promotional Poster style, soft lighting, romantic/dramatic atmosphere";
    return "High quality digital illustration, character concept art";
  };

  const generateVisual = async (char: CharacterMatch) => {
    setLoadingCharImg(char.name);
    try {
        const ai = getGenAI();
        const style = getStylePrompt(char.origin);
        const prompt = `Generate a visual of the fictional character "${char.name}" from "${char.origin}". 
        Style: ${style}. 
        Composition: Solo portrait or dynamic pose, suitable for a trading card.
        Do not include text in the image itself.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] }
        });

        const parts = response.candidates?.[0]?.content?.parts;
        if(parts) {
            for (const part of parts) {
                if (part.inlineData) {
                    const imgData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    setCharImages(prev => ({ ...prev, [char.name]: imgData }));
                    break;
                }
            }
        }
    } catch (e) {
        console.error("Image Gen Error", e);
        alert("Gagal membuat gambar karakter. Silakan coba lagi.");
    } finally {
        setLoadingCharImg(null);
    }
  };

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
        3. Format: JSON Array ONLY. No markdown.
        Example:
        [
          { "name": "Naruto", "origin": "Naruto Shippuden", "justification": "..." }
        ]
        4. Language: Indonesian. Casual tone.
      `;
      const resp = await ai.models.generateContent({ 
          model: 'gemini-2.5-flash', 
          contents: prompt,
          config: { responseMimeType: "application/json" }
      });
      
      const json = JSON.parse(resp.text || "[]");
      setCharacters(json);
    } catch (e) {
      console.error(e);
      setCharacters(null);
      alert("Gagal memuat karakter. Coba lagi ya!");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      // Allow render
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
      
      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Preview Hasil</h3>
              <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                ✕ Tutup
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 flex justify-center bg-gray-100 dark:bg-black">
              {/* Capture Card - Compact Design */}
              <div 
                ref={cardRef} 
                className="w-[600px] bg-gradient-to-br from-pastel-blue via-white to-pastel-pink p-6 flex flex-col items-center text-center relative shadow-2xl shrink-0"
              >
                <div className="w-full border-b-2 border-purple-200 pb-4 mb-4">
                  <h2 className="text-3xl font-display font-bold text-purple-600 tracking-wider">CACT Gue Banget</h2>
                  <p className="text-sm text-purple-400 font-bold uppercase tracking-widest mt-1">Personality Profile</p>
                </div>

                <div className="flex-1 w-full space-y-4">
                  <div>
                    <h1 className="text-4xl font-display font-bold text-gray-800 leading-tight">{user.nickname}</h1>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full px-4">
                    <div className="bg-white/90 p-4 rounded-2xl shadow-sm border border-purple-100">
                      <p className="text-xs text-purple-600 uppercase font-bold mb-1">MBTI</p>
                      <p className="text-2xl font-black text-gray-800">{result.mbti}</p>
                    </div>
                    <div className="bg-white/90 p-4 rounded-2xl shadow-sm border border-purple-100 flex flex-col justify-center">
                      <p className="text-xs text-purple-600 uppercase font-bold mb-1">Temperament</p>
                      <p className="text-lg font-black text-gray-800 leading-tight">{result.temperament}</p>
                    </div>
                  </div>

                  <div className="w-full px-4">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-2">My Top Traits</p>
                    <div className="grid grid-cols-2 gap-2">
                      {result.finalProfile.keyTraits?.slice(0, 4).map((trait, i) => (
                          <div key={i} className="bg-purple-600/90 text-white py-1 px-2 rounded-lg font-bold text-sm shadow-sm">
                            {trait}
                          </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white/60 p-4 rounded-xl mx-4">
                    <p className="text-gray-700 text-xs font-medium italic">"{result.narrative.summary}"</p>
                  </div>
                </div>

                <div className="w-full pt-4 mt-4 border-t border-purple-200">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Analyzed by CACT AI • cact-gue-banget.app</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky bottom-0 z-10 rounded-b-2xl flex gap-3">
               <button 
                  onClick={handleShare}
                  disabled={isSharing || isDownloading}
                  className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition disabled:opacity-50"
                >
                  {isSharing ? 'Sharing...' : '🔗 Share'}
                </button>
                <button 
                  onClick={handleDownload}
                  disabled={isDownloading || isSharing}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold transition disabled:opacity-50"
                >
                  {isDownloading ? 'Saving...' : '📥 Simpan ke Galeri'}
                </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-xl mb-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pastel-blue via-pastel-purple to-pastel-pink"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
           <span className="inline-block px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold tracking-wider uppercase">
            {user.generation} Profile
          </span>
          
          <button 
              onClick={() => setShowPreview(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold shadow-md transition transform hover:scale-105"
          >
              📸 Simpan & Bagikan
          </button>
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
            
            {loadingAI && !recommendations && (
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

             {loadingAI && !characters && (
                <div className="py-10">
                   <ProgressBar label="Menjelajahi alam lain untuk mencari kembaranmu..." />
                </div>
             )}

             {characters && !loadingAI && (
               <div className="text-left animate-fade-in space-y-4">
                 <h3 className="font-display text-2xl text-center mb-8 text-purple-600 dark:text-purple-300">Your Fictional Squad</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {characters.map((char, idx) => (
                        <div key={idx} className="bg-purple-50 dark:bg-gray-700 p-6 rounded-2xl shadow-sm border border-purple-100 dark:border-gray-600 flex flex-col h-full relative overflow-hidden group">
                            <h4 className="font-bold text-xl text-purple-800 dark:text-purple-200 mb-1">{char.name}</h4>
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">{char.origin}</span>
                            <p className="text-sm text-gray-700 dark:text-gray-300 flex-1 mb-6 leading-relaxed">"{char.justification}"</p>
                            
                            {charImages[char.name] ? (
                                <div className="mt-4 relative rounded-xl overflow-hidden border-2 border-purple-300 shadow-md group-hover:shadow-xl transition-all">
                                    <img src={charImages[char.name]} alt={char.name} className="w-full h-auto object-cover" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                                        <p className="text-white font-bold text-center text-sm shadow-black drop-shadow-md">
                                            {result.mbti} Character
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => generateVisual(char)}
                                    disabled={loadingCharImg === char.name}
                                    className="w-full py-2 bg-white dark:bg-gray-800 border-2 border-purple-400 text-purple-600 dark:text-purple-300 hover:bg-purple-500 hover:text-white dark:hover:bg-purple-600 dark:hover:border-purple-600 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                                >
                                    {loadingCharImg === char.name ? "Melukis..." : "🎨 Visualisasikan"}
                                </button>
                            )}
                        </div>
                    ))}
                 </div>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};
