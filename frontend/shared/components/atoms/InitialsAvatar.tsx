import { cn } from "@/shared/lib/utils";

type InitialsAvatarProps = {
  name: string;
  className?: string;
  online?: boolean;
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

const InitialsAvatar = ({ name, className, online }: InitialsAvatarProps) => {
  return (
    <span className="relative inline-flex shrink-0">
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full text-xs font-semibold",
          palette[getPaletteIndex(name)],
          className,
        )}
      >
        {getInitials(name)}
      </span>
      {online && (
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-[#37D278]" />
      )}
    </span>
  );
};

export default InitialsAvatar;
