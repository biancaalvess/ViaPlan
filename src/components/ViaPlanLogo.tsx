import React from "react";

interface ViaPlanLogoProps {
  className?: string;
  size?: number;
}

export const ViaPlanLogo: React.FC<ViaPlanLogoProps> = ({
  className = "",
  size,
}) => {
  return (
    <div className={`flex justify-center mb-3 md:mb-4 ${className}`}>
      <img
        src="/image/03.png"
        alt="ViaPlan Logo"
        className={`drop-shadow-2xl object-contain transition-all duration-300 ${
          size ? "" : "w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48"
        }`}
        width={size}
        height={size}
        style={size ? { maxWidth: `${size}px`, maxHeight: `${size}px` } : {}}
      />
    </div>
  );
};

export default ViaPlanLogo;
