import React from "react";
import Image from "next/image";

const Icon = ({
  src,
  alt,
  className,
  color,
}: {
  src: string;
  alt: string;
  className?: string;
  color?: string;
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={20}
      height={20}
      className={className}
      style={{ fill: color }}
    />
  );
};

export default Icon;
