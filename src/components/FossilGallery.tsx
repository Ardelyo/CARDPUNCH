import React from 'react';
import { motion } from 'motion/react';
import { Fossil3D } from './Fossil3D';

interface Props {
  collectedFossils: ('skull' | 'ribs' | 'spine' | 'leg')[];
  onClose: () => void;
}

export function FossilGallery({ collectedFossils, onClose }: Props) {
  const allSubtypes: ('skull' | 'ribs' | 'spine' | 'leg')[] = ['skull', 'ribs', 'spine', 'leg'];
  const labels: Record<string, string> = {
    skull: 'Tengkorak',
    ribs: 'Rusuk',
    spine: 'Tulang Belakang',
    leg: 'Tulang Kaki',
  };

  const isComplete = allSubtypes.every(f => collectedFossils.includes(f));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4"
    >
      <motion.div 
         initial={{ scale: 0.9, y: 20 }}
         animate={{ scale: 1, y: 0 }}
         className="bg-neutral-800 border-4 border-amber-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-center shadow-2xl relative"
      >
         <button 
           onClick={onClose} 
           className="absolute top-4 right-6 text-neutral-400 hover:text-white text-4xl leading-none font-bold"
         >
            &times;
         </button>

         <h2 className="text-3xl sm:text-4xl font-extrabold text-amber-400 mb-2">Museum Purbakala</h2>
         <p className="text-amber-100/70 mb-8 font-medium">Koleksi Fosil Dinosaurus</p>

         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {allSubtypes.map((type) => {
               const found = collectedFossils.includes(type);
               return (
                 <div key={type} className="flex flex-col items-center">
                    <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500
                       ${found ? 'bg-amber-900/40 border-2 border-amber-500/80 shadow-[0_0_20px_rgba(217,119,6,0.3)]' : 'bg-neutral-900/80 border-2 border-neutral-800'}`}>
                       {found ? (
                          <div className="scale-125 sm:scale-150 relative -top-2">
                            <Fossil3D subtype={type} collected={true} />
                          </div>
                       ) : (
                          <span className="text-4xl opacity-20 filter grayscale">🦖</span>
                       )}
                    </div>
                    <span className={`font-bold text-xs sm:text-sm uppercase tracking-wider ${found ? 'text-amber-300' : 'text-neutral-600'}`}>
                       {labels[type]}
                    </span>
                 </div>
               );
            })}
         </div>

         {isComplete ? (
            <motion.div 
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="bg-gradient-to-r from-amber-600 to-yellow-500 text-amber-950 px-6 py-4 rounded-xl font-bold text-lg sm:text-xl inline-block shadow-[0_0_30px_rgba(245,158,11,0.5)] border border-amber-300 w-full"
            >
               🎉 LUAR BIASA! Fosil Utuh! 🎉
            </motion.div>
         ) : (
            <div className="bg-neutral-900 text-neutral-400 px-6 py-4 rounded-xl font-medium border border-neutral-800 text-sm sm:text-base">
               Galih kotak kardus untuk menemukan {4 - collectedFossils.length} bagian tulang lagi!
            </div>
         )}
      </motion.div>
    </motion.div>
  );
}
