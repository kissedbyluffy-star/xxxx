'use client';

import { motion } from 'framer-motion';
import { STATUS_LABELS, TIMELINE_STEPS } from '@/lib/constants';

export default function StatusTimeline({ status }: { status: string }) {
  const currentIndex = TIMELINE_STEPS.findIndex((step) => step === status);

  return (
    <div className="mt-6 space-y-4">
      {TIMELINE_STEPS.map((step, index) => {
        const isActive = index <= currentIndex;
        return (
          <motion.div
            key={step}
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <div
              className={`h-3 w-3 rounded-full ${
                isActive ? 'bg-emerald-400 shadow-glow' : 'bg-white/20'
              }`}
            />
            <div className="flex flex-col">
              <span className={`text-sm ${isActive ? 'text-white' : 'text-white/50'}`}>
                {STATUS_LABELS[step]}
              </span>
              {index === currentIndex && (
                <span className="text-xs text-white/40">We will update this step automatically.</span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
