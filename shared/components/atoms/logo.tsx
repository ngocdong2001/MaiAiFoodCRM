import Image from "next/image";
import logo from "@/assets/images/logo.png";

const Logo = () => {
  return (
    <Image
      src={logo}
      alt="MaiAI"
      loading="eager"
      priority
      sizes="(max-width: 768px) 128px, 164px"
      className="h-11 w-auto"
    />
  );
};

export default Logo;
