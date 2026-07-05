import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Minus, Plus, Divide, X as Multiply, Equal, Delete } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FloatingCalculator({ isOpen, onClose }: FloatingCalculatorProps) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  if (!isOpen) return null;

  const handleNum = (num: string) => {
    setDisplay(prev => prev === '0' ? num : prev + num);
  };

  const handleOp = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleEqual = () => {
    try {
      // eslint-disable-next-line no-eval
      const result = eval(equation + display);
      setDisplay(String(result));
      setEquation('');
    } catch {
      setDisplay('Error');
      setEquation('');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-20 left-6 z-50 w-72 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
        >
          <div className="bg-slate-100 dark:bg-slate-800 p-3 flex items-center justify-between cursor-move rounded-t-2xl">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Calculator</span>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl text-right overflow-hidden shadow-inner border border-slate-200/50 dark:border-slate-800/50">
              <div className="text-xs text-slate-400 h-4 mb-1 font-mono tracking-wider">{equation}</div>
              <div className="text-3xl font-mono text-slate-800 dark:text-slate-100 font-bold truncate">{display}</div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" className="text-red-500 font-bold" onClick={handleClear}>C</Button>
              <Button variant="outline" onClick={() => handleOp('/')}><Divide className="w-4 h-4" /></Button>
              <Button variant="outline" onClick={() => handleOp('*')}><Multiply className="w-4 h-4" /></Button>
              <Button variant="outline" onClick={() => {
                if (display.length > 1) setDisplay(display.slice(0, -1));
                else setDisplay('0');
              }}><Delete className="w-4 h-4" /></Button>

              <Button variant="outline" className="font-mono text-lg font-semibold" onClick={() => handleNum('7')}>7</Button>
              <Button variant="outline" className="font-mono text-lg font-semibold" onClick={() => handleNum('8')}>8</Button>
              <Button variant="outline" className="font-mono text-lg font-semibold" onClick={() => handleNum('9')}>9</Button>
              <Button variant="outline" onClick={() => handleOp('-')}><Minus className="w-4 h-4" /></Button>

              <Button variant="outline" className="font-mono text-lg font-semibold" onClick={() => handleNum('4')}>4</Button>
              <Button variant="outline" className="font-mono text-lg font-semibold" onClick={() => handleNum('5')}>5</Button>
              <Button variant="outline" className="font-mono text-lg font-semibold" onClick={() => handleNum('6')}>6</Button>
              <Button variant="outline" onClick={() => handleOp('+')}><Plus className="w-4 h-4" /></Button>

              <Button variant="outline" className="font-mono text-lg font-semibold" onClick={() => handleNum('1')}>1</Button>
              <Button variant="outline" className="font-mono text-lg font-semibold" onClick={() => handleNum('2')}>2</Button>
              <Button variant="outline" className="font-mono text-lg font-semibold" onClick={() => handleNum('3')}>3</Button>
              
              <Button variant="default" className="row-span-2 h-full bg-blue-600 hover:bg-blue-700 font-bold" onClick={handleEqual}>
                <Equal className="w-5 h-5" />
              </Button>

              <Button variant="outline" className="col-span-2 font-mono text-lg font-semibold" onClick={() => handleNum('0')}>0</Button>
              <Button variant="outline" className="font-bold text-lg" onClick={() => handleNum('.')}>.</Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
