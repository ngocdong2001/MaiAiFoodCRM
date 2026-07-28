import { placeholderRoutes } from "@/features/dashboard/overview/data/data";

type PlaceholderRoute = (typeof placeholderRoutes)[number];

type PlaceholderSectionProps = {
  route: PlaceholderRoute;
};

const PlaceholderSection = ({ route }: PlaceholderSectionProps) => {
  const Icon = route.icon;

  return (
    <section className="flex min-h-105 flex-col items-center justify-center rounded-xl border border-dashed border-[#DEE1E7] bg-white p-10 text-center shadow-[0px_1px_2px_0px_#0000000a]">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FEF1F8]">
        <Icon className="h-7 w-7 text-[#F04CAC]" />
      </span>
      <h1 className="mt-5 text-2xl font-bold tracking-tight text-[#171A21]">
        {route.title}
      </h1>
      <p className="mt-2 max-w-md text-sm text-[#8D95A5]">
        {route.description}
      </p>
      <span className="mt-5 rounded-full bg-[#FEF1F8] px-3 py-1 text-xs font-medium text-[#F04CAC]">
        Coming soon
      </span>
    </section>
  );
};

export default PlaceholderSection;

