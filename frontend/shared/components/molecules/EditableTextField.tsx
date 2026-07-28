import type {
  ReactNode,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import {
  FieldContent,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/shared/components/ui/input-group";
import { cn } from "@/shared/lib/utils";

type HelperTextType = "error" | "default";
type IconPosition = "inline-start" | "inline-end";

type CommonProps = {
  label?: string;
  icon?: ReactNode | string;
  iconPosition?: IconPosition;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  helperTextType?: HelperTextType;
  helperText?: string;
};

type EditableTextFieldProps = CommonProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, keyof CommonProps | "size"> &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, keyof CommonProps>;

const EditableTextField = ({
  label,
  icon,
  iconPosition = "inline-start",
  placeholder,
  className,
  multiline = false,
  helperTextType = "error",
  helperText,
  ...props
}: EditableTextFieldProps) => {
  return (
    <Field className={cn("gap-2", className)}>
      {label ? <FieldLabel>{label}</FieldLabel> : null}

      <FieldContent className="gap-2">
        {multiline ? (
          <InputGroup>
            {icon ? (
              <InputGroupAddon align={iconPosition}>
                {typeof icon === "string" ? (
                  <InputGroupText>{icon}</InputGroupText>
                ) : (
                  icon
                )}
              </InputGroupAddon>
            ) : null}

            <InputGroupTextarea
              placeholder={placeholder}
              {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          </InputGroup>
        ) : (
          <InputGroup>
            {icon ? (
              <InputGroupAddon align={iconPosition}>
                {typeof icon === "string" ? (
                  <InputGroupText>{icon}</InputGroupText>
                ) : (
                  icon
                )}
              </InputGroupAddon>
            ) : null}

            <InputGroupInput
              placeholder={placeholder}
              {...(props as InputHTMLAttributes<HTMLInputElement>)}
            />
          </InputGroup>
        )}

        {helperText ? (
          helperTextType === "error" ? (
            <FieldError>{helperText}</FieldError>
          ) : (
            <FieldDescription>{helperText}</FieldDescription>
          )
        ) : null}
      </FieldContent>
    </Field>
  );
};

export default EditableTextField;
