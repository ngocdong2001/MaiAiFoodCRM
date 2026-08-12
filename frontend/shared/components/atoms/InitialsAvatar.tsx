"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/shared/lib/utils";

type InitialsAvatarProps = {
  name: string;
  className?: string;
  online?: boolean;
  src?: string;
};

const palette = [
  "bg-[#FDE7F3] text-primary",
  "bg-[#E8FBE7] text-[#2FA35C]",
  "bg-[#E7F0FD] text-[#3B7DE0]",
  "bg-[#FDF3E7] text-[#D98A2B]",
  "bg-[#F0E7FD] text-[#8A4CE0]",
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

const getPaletteIndex = (name: string) =>
  name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
  palette.length;

const InitialsAvatar = ({ name, className, online, src }: InitialsAvatarProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <span className="relative inline-flex shrink-0">
      {src && !imageFailed ? (
        <Image src={src} alt={name} width={80} height={80} unoptimized onError={() => setImageFailed(true)} className={cn("rounded-full object-cover", className)} />
      ) : <span
        className={cn(
          "inline-flex items-center justify-center rounded-full text-xs font-semibold",
          palette[getPaletteIndex(name)],
          className,
        )}
      >
        {getInitials(name)}
      </span>}
      {online && (
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-[#37D278]" />
      )}
    </span>
  );
};

export default InitialsAvatar;
