import React from 'react';
import Image from 'next/image';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  width = 40,
  height = 40,
  className = 'object-contain'
}) => {
  return (
    <Image
      src="/assets/SSPL.png"
      alt="SSPL Logo"
      width={width}
      height={height}
      className={className}
    />
  );
};