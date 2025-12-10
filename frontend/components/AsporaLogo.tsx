import React from 'react';
// Placeholder for logo - replace with actual image path
const logoImage = '';

interface IsporaLogoProps {
  className?: string;
  size?: "small" | "default" | "large";
}

export const IsporaLogo = React.forwardRef<HTMLDivElement, IsporaLogoProps>(
  ({ className = "", size = "default" }, ref) => {
    const sizeClasses = {
      small: "h-6 w-6",
      default: "h-8 w-8", 
      large: "h-12 w-12"
    };

    return (
      <div ref={ref} className={`flex items-center justify-center ${className}`}>
        {/* Logo using the provided image */}
        <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
          <img 
            src={logoImage} 
            alt="iSpora Logo" 
            className={`${sizeClasses[size]} rounded-full object-cover`}
          />
        </div>
      </div>
    );
  }
);

IsporaLogo.displayName = "IsporaLogo";

// Main export with updated name
export default IsporaLogo;

// Backwards compatibility export
export { IsporaLogo as AsporaLogo };