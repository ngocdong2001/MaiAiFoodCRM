import type { ReactNode } from "react";

import { CircleCheck } from "lucide-react";

type FeatureListItemProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

const FeatureListItem = ({
  icon,
  title,
  description,
}: FeatureListItemProps) => {
  return (
    <div className="flex gap-4">
      <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        {icon}
      </div>
      <div className="flex items-start gap-2">
        <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-foreground" />
        <div>
          <h3 className="text-base font-medium text-foreground">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeatureListItem;
