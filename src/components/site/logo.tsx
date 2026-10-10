import React from "react";
import Link from "next/link";
import Image from "next/image";

interface Props {
  className?: string;
}

const Logo: React.FC<Props> = ({ className = "" }) => {
  return (
    <Link href="/" className={`flex items-center transition-opacity hover:opacity-90 ${className}`}>
      <Image src="/logo.svg" alt="Venacor Saúde" width={150} height={40} priority />
    </Link>
  );
};

export default Logo;
