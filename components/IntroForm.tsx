
import React, { useState } from "react";
import { UserProfile, Generation } from "../types";

export const IntroForm = ({ onStart }: { onStart: (p: UserProfile) => void }) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    nickname: "",
    age: undefined,
    gender: "Male",
    occupation: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nickname || !formData.age || !formData.occupation) return;
    
    let gen: Generation = "Gen Z";
    if (formData.age >= 45) gen = "Gen X";
    else if (formData.age >= 29) gen = "Gen Y";

    onStart({
      ...formData as UserProfile,
      generation: gen,
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl animate-fade-in">
      <h1 className="text-3xl font-display font-bold text-center text-purple-600 dark:text-purple-300 mb-2">CACT Gue Banget</h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Kenali dirimu lewat lensa psikologi. Pastikan jawaban sesuai karaktermu</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-200">Panggilan</label>
          <input 
            type="text" 
            required
            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.nickname}
            onChange={e => setFormData({...formData, nickname: e.target.value})}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200">Umur</label>
            <input 
              type="number" 
              required
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.age || ''}
              onChange={e => setFormData({...formData, age: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200">Gender</label>
            <select 
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.gender}
              onChange={e => setFormData({...formData, gender: e.target.value as "Male" | "Female"})}
            >
              <option value="Male">Laki-laki</option>
              <option value="Female">Perempuan</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-200">Pekerjaan Utama</label>
          <input 
            type="text" 
            required
            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.occupation}
            onChange={e => setFormData({...formData, occupation: e.target.value})}
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-pastel-purple hover:bg-purple-300 text-purple-900 font-bold py-3 px-4 rounded-xl transition duration-300 transform hover:scale-105 shadow-md"
        >
          Mulai Tes
        </button>
      </form>
      <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
        Disclaimer: Aplikasi ini untuk hiburan & profiling dasar, bukan pengganti psikolog klinis. Tenang Privasi dan isian data aman di browser Anda.
      </p>
    </div>
  );
};
