import React from 'react';

interface VegBadgeProps {
  isVeg?: boolean;
  size?: 'sm' | 'md';
}

export const VegBadge: React.FC<VegBadgeProps> = ({ isVeg = true, size = 'sm' }) => {
  const outerSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5';
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  if (isVeg) {
    return (
      <span
        title="Pure Vegetarian"
        className={`inline-flex items-center justify-center border border-emerald-600 rounded-[3px] bg-white p-[2px] ${outerSize} flex-shrink-0`}
      >
        <span className={`rounded-full bg-emerald-600 ${dotSize}`} />
      </span>
    );
  }

  return (
    <span
      title="Non-Vegetarian"
      className={`inline-flex items-center justify-center border border-rose-600 rounded-[3px] bg-white p-[2px] ${outerSize} flex-shrink-0`}
    >
      <span className={`rounded-full bg-rose-600 ${dotSize}`} />
    </span>
  );
};
