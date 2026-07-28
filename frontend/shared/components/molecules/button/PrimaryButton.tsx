import type { ReactNode } from "react";

import { Button } from "../../ui/button";
import type { Button as ButtonComponent } from "../../ui/button";

type PrimaryButtonProps = {
  label?: string;
  children?: ReactNode;
  className?: string;
  variant?: Parameters<typeof ButtonComponent>[0]["variant"];
  size?: Parameters<typeof ButtonComponent>[0]["size"];
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  onClick?: React.ComponentProps<typeof Button>["onClick"];
  disabled?: boolean;
};

const PrimaryButton = ({
  label,
  children,
  className,
  variant = "default",
  size = "default",
  icon,
  iconPosition = "start",
  onClick,
  disabled = false,
}: PrimaryButtonProps) => {
  const content = children ?? label;

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={onClick}
      disabled={disabled}
      data-icon={icon ? `inline-${iconPosition}` : undefined}
    >
      {iconPosition === "start" ? icon : null}
      {content}
      {iconPosition === "end" ? icon : null}
    </Button>
  );
};

export default PrimaryButton;
