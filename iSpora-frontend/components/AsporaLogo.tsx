import React from 'react';

interface IsporaLogoProps {
  className?: string;
  size?: 'small' | 'default' | 'large';
}

export const IsporaLogo = React.forwardRef<HTMLDivElement, IsporaLogoProps>(
  ({ className = '', size = 'default' }, ref) => {
    const sizeClasses = {
      small: 'h-6 w-6',
      default: 'h-8 w-8',
      large: 'h-12 w-12',
    };

    return (
      <div ref={ref} className={`flex items-center justify-center ${className}`}>
        {/* iSpora Logo SVG */}
        <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
          <svg
            viewBox="0 0 40 40"
            className={`${sizeClasses[size]} text-blue-600`}
            fill="currentColor"
          >
            <circle cx="20" cy="20" r="18" className="fill-blue-600" />
            <text x="20" y="26" textAnchor="middle" className="text-white text-xs font-bold">
              iS
            </text>
          </svg>
        </div>
      </div>
    );
  },
);

IsporaLogo.displayName = 'IsporaLogo';

// Main export with updated name
export default IsporaLogo;

// Backwards compatibility export
export { IsporaLogo as AsporaLogo };
