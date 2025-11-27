
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

  // New States for Cosplay Feature
  const [visualModalOpen, setVisualModalOpen] = useState(false);
  const [selectedCharForVisual, setSelectedCharForVisual] = useState<CharacterMatch | null>(null);
  const [userSelfie, setUserSelfie] = useState<string | null>(null);

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

  const handleVisualClick = (char: CharacterMatch) => {
    setSelectedCharForVisual(char);
    setUserSelfie(null); // Reset previous upload
    setVisualModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserSelfie(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateVisual = async (withSelfie: boolean) => {
    if (!selectedCharForVisual) return;
    
    const char = selectedCharForVisual;
    setVisualModalOpen(false); // Close modal
    setLoadingCharImg(char.name);

    try {
        const ai = getGenAI();
        const style = getStylePrompt(char.origin);
        
        let contents;

        if (withSelfie && userSelfie) {
            // Multimodal Request (Image + Text)
            // Strip the data:image/jpeg;base64, prefix
            const base64Data = userSelfie.split(',')[1];
            const mimeType = userSelfie.split(';')[0].split(':')[1];

            let genderConstraint = "";
            if (user.gender === "Female") {
                genderConstraint = `
                5. CRITICAL REQUIREMENT: The subject is a Muslim woman. The generated image MUST feature the character wearing a stylish hijab/headscarf that covers the hair AND extends down to cover the chest (hijab menutup dada/syari compliant).
                6. Modify the character's costume to be modest (long sleeves, loose fitting, no exposed skin other than face and hands) while strictly maintaining the iconic color palette and accessories of "${char.name}".
                `;
            }

            const prompt = `
            Transform the person in this image into the character "${char.name}" from "${char.origin}".
            Task: Create a "Cosplay" version.
            1. Keep the facial features and expression of the person in the uploaded image recognizable.
            2. Apply the costume and accessories of "${char.name}".
            3. Style: ultra-realistic photography, real human cosplay, no anime, no illustration.
            4. High quality, detailed, poster layout.
            ${genderConstraint}
            `;

            contents = {
                parts: [
                    { inlineData: { mimeType, data: base64Data } },
                    { text: prompt }
                ]
            };
        } else {
            // Text-only Request
            const prompt = `Generate a visual of the fictional character "${char.name}" from "${char.origin}". 
            Style: ${style}. 
            Composition: Solo portrait or dynamic pose, suitable for a trading card.
            Do not include text in the image itself.`;
            
            contents = { parts: [{ text: prompt }] };
        }
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: contents
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
        setSelectedCharForVisual(null);
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
        
        IF GEN X (Male): Male 90s RCTI Western/HK films, Male Avengers/DC.
        IF GEN X (Female): Female 90s RCTI Western dramas, Female 2000s Indo soap operas, Female K-Drama.
        IF GEN Y (Male): Male Naruto, Male One Piece, Male 2000s Sunday Cartoons, Male Kamen Rider.
        IF GEN Y (Female): Female Char Naruto, Female 2000s Sunday Cartoons RCTI Indonesia, Female K-Drama.
        IF GEN Z (Male): Male Char Naruto, Male One Piece, Male Mobile Legends.
        IF GEN Z (Female): Female Char Naruto, Female K-Drama, Female Cartoons (Barbie/Anime/BoBoiBoy/Upin-Ipin).

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

  // Helper to burn overlay into image for download/share
  const processImageWithOverlay = (base64Image: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64Image;
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject("Canvas error");

            canvas.width = img.width;
            canvas.height = img.height;

            // Draw Image
            ctx.drawImage(img, 0, 0);

            // Draw Gradient
            const gradient = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height);
            gradient.addColorStop(0, "transparent");
            gradient.addColorStop(1, "rgba(0,0,0,0.9)");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);

            // Draw MBTI Text
            const fontSizeMbti = canvas.width * 0.1; // 10% of width
            ctx.font = `bold ${fontSizeMbti}px 'Verdana', sans-serif`;
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.shadowColor = "black";
            ctx.shadowBlur = 10;
            ctx.fillText(result.mbti, canvas.width / 2, canvas.height - (canvas.height * 0.15));

            // Draw Traits Text
            const fontSizeTraits = canvas.width * 0.04; // 4% of width
            ctx.font = `${fontSizeTraits}px 'Verdana', sans-serif`;
            const traitsText = result.finalProfile.keyTraits.slice(0, 4).join(" • ");
            ctx.fillText(traitsText, canvas.width / 2, canvas.height - (canvas.height * 0.08));

            resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.onerror = (e) => reject(e);
    });
  };

  const downloadSingleImage = async (charName: string, base64: string) => {
      try {
        const processedImage = await processImageWithOverlay(base64);
        const link = document.createElement('a');
        link.download = `CACT-${charName}-Cosplay.jpg`;
        link.href = processedImage;
        link.click();
      } catch (e) {
        console.error("Error processing image", e);
        alert("Gagal memproses gambar.");
      }
  };

  const shareSingleImage = async (charName: string, base64: string) => {
      try {
          const processedImage = await processImageWithOverlay(base64);
          const res = await fetch(processedImage);
          const blob = await res.blob();
          const file = new File([blob], `CACT-${charName}.jpg`, { type: 'image/jpeg' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
               await navigator.share({
                  title: `My ${charName} Cosplay`,
                  text: `Cek cosplay ${charName} versi gue di CACT Gue Banget!`,
                  files: [file]
              });
          } else {
              downloadSingleImage(charName, base64);
          }
      } catch (e) {
          console.error("Share failed", e);
          alert("Gagal share gambar.");
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

  const competencyLabels: Record<string, string> = {
    communication: "Komunikasi",
    managingChange: "Mengelola Perubahan",
    resultOrientation: "Orientasi Hasil",
    publicService: "Pelayanan Publik",
    decisionMaking: "Pengambilan Keputusan"
  };

  return (
    <div className="max-w-4xl mx-auto p-4 animate-fade-in pb-20 relative">
      
      {/* Visual Upload Modal */}
      {visualModalOpen && selectedCharForVisual && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 text-center animate-fade-in">
                <h3 className="text-xl font-bold font-display text-gray-800 dark:text-white mb-4">
                   Cosplay jadi {selectedCharForVisual.name}?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                    Upload fotomu (selfie close-up terbaik) agar AI bisa membuatmu "cosplay" menjadi karakter ini. Atau skip untuk generate versi original.
                </p>

                <div className="mb-6">
                    <label className="block w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-bold">
                            {userSelfie ? "✅ Foto Terpilih (Ganti?)" : "📂 Pilih Foto Selfie"}
                        </span>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                </div>

                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => generateVisual(true)}
                        disabled={!userSelfie}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ✨ Generate Cosplay Wajahku
                    </button>
                    <button 
                        onClick={() => generateVisual(false)}
                        className="w-full py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-bold"
                    >
                        Skip & Generate Original
                    </button>
                    <button 
                        onClick={() => setVisualModalOpen(false)}
                        className="text-xs text-gray-400 hover:text-gray-600 mt-2"
                    >
                        Batal
                    </button>
                </div>
            </div>
         </div>
      )}

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
                <div className="w-full border-b-2 border-purple-200 pb-2 mb-2">
                  <h2 className="text-2xl font-display font-bold text-purple-600 tracking-wider">CACT Gue Banget</h2>
                </div>

                <div className="flex-1 w-full space-y-2">
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
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-2">Karakter Gue Banget</p>
                    <div className="grid grid-cols-2 gap-2">
                      {result.finalProfile.keyTraits?.slice(0, 4).map((trait, i) => (
                          <div key={i} className="bg-purple-600/90 text-white py-1 px-2 rounded-lg font-bold text-sm shadow-sm flex justify-center items-center text-center">
                            {trait}
                          </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white/60 p-4 rounded-xl mx-4">
                    <p className="text-gray-700 text-xs font-medium italic">"{result.narrative.summary}"</p>
                  </div>
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
          <div className="space-y-8 animate-fade-in">
            <div className="prose dark:prose-invert max-w-none">
                <h3 className="font-display text-2xl mb-4 text-purple-600 dark:text-purple-300">Synthesis Profile</h3>
                <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                {result.finalProfile.synthesis}
                </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl">
                <h3 className="font-display text-xl mb-6 text-gray-800 dark:text-white border-b pb-2 dark:border-gray-600">Work Competencies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.finalProfile.competencies && Object.entries(result.finalProfile.competencies).map(([key, value]) => (
                        <div key={key} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                            <h4 className="font-bold text-purple-600 dark:text-purple-300 text-sm uppercase mb-2">
                                {competencyLabels[key] || key}
                            </h4>
                            <p className="text-gray-800 dark:text-gray-200 font-medium">
                                {value}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
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
                            
                            {loadingCharImg === char.name ? (
                                <div className="mt-4 py-4">
                                    <ProgressBar label="Sedang menyulap..." />
                                </div>
                            ) : charImages[char.name] ? (
                                <div className="mt-4 relative rounded-xl overflow-hidden border-2 border-purple-300 shadow-md group-hover:shadow-xl transition-all group/image">
                                    <img src={charImages[char.name]} alt={char.name} className="w-full h-auto object-cover" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-10 pointer-events-none">
                                        <p className="text-white font-bold text-center text-sm shadow-black drop-shadow-md uppercase tracking-wider mb-1">
                                            {result.mbti}
                                        </p>
                                        <div className="flex flex-wrap justify-center gap-1">
                                            {result.finalProfile.keyTraits.map((t, i) => (
                                                <span key={i} className="text-[10px] text-white/90 bg-white/20 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Action Buttons for Image */}
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <button 
                                            onClick={() => downloadSingleImage(char.name, charImages[char.name])}
                                            className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg backdrop-blur-sm transition-transform hover:scale-110"
                                            title="Download Image"
                                        >
                                            📥
                                        </button>
                                         <button 
                                            onClick={() => shareSingleImage(char.name, charImages[char.name])}
                                            className="bg-white/90 hover:bg-white text-blue-600 p-2 rounded-full shadow-lg backdrop-blur-sm transition-transform hover:scale-110"
                                            title="Share Image"
                                        >
                                            🔗
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => handleVisualClick(char)}
                                    className="w-full py-2 bg-white dark:bg-gray-800 border-2 border-purple-400 text-purple-600 dark:text-purple-300 hover:bg-purple-500 hover:text-white dark:hover:bg-purple-600 dark:hover:border-purple-600 rounded-xl font-bold text-sm transition-all"
                                >
                                    🎨 Visualisasikan
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
