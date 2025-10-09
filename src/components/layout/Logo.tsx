import React from 'react';
import Image from 'next/image';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  opacity?: number;
}

export const Logo: React.FC<LogoProps> = ({
  width = 40,
  height = 40,
  className = 'object-contain',
  opacity = 1
}) => {
  return (
    <Image
      src="/assets/SSPL.png"
      alt="SSPL Logo"
      width={width}
      height={height}
      className={className}
      style={{ opacity }}
    />
  );
};