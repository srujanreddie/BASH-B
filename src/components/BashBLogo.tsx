import React from 'react';

interface BashBLogoProps {
  size?: number;
  className?: string;
  withText?: boolean;
  textColor?: string;
}

export const BashBLogo: React.FC<BashBLogoProps> = ({
  size = 32,
  className = '',
  withText = false,
  textColor,
}) => {
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* SVG Icon Mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 128 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 group-hover:scale-105"
        aria-label="bash-b logo mark"
      >
        {/* Bottom subtle purple drop accent */}
        <path
          d="M58 98C58 95 62 93 68 93C74 93 78 95 78 98C78 103 74 107 68 107C62 107 58 103 58 98Z"
          fill="#a99af8"
          opacity="0.8"
        />

        {/* Left stem: bright lime neon rounded pill */}
        <rect x="28" y="14" width="24" height="84" rx="12" fill="#c8f828" />

        {/* Charcoal body forming the lowercase 'b' loop */}
        <path
          d="M40 50C40 45 44 42 49 42H70C87.673 42 102 56.327 102 74C102 91.673 87.673 106 70 106H45C33.954 106 25 97.046 25 86C25 76.5 32 68 40 64V50Z"
          fill="#18181b"
        />

        {/* Purple circular head/face inside the 'b' loop */}
        <circle cx="72" cy="72" r="26" fill="#a99af8" />

        {/* Inner dark pupil / eye cutout inside the purple circle */}
        <circle cx="58" cy="70" r="11" fill="#18181b" />

        {/* Playful expressive face markings on the purple circle */}
        <path
          d="M73 59L80 65"
          stroke="#18181b"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M74 81L81 75"
          stroke="#18181b"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="85" cy="69" r="2" fill="#18181b" />

        {/* Terminal prompt inside the lower charcoal body: > _ */}
        <path
          d="M35 76L41 81L35 86"
          stroke="#c8f828"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M47 88H57"
          stroke="#c8f828"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>

      {withText && (
        <span
          className={`font-black tracking-tight text-base sm:text-lg ${
            textColor || 'text-zinc-950 dark:text-white'
          }`}
        >
          <span>bash</span>
          <span className="text-[#c8f828]">-b</span>
        </span>
      )}
    </div>
  );
};

export default BashBLogo;
