import { Plus, UserPlus } from "lucide-react";

const WelcomeSection = () => {
  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#171A21] sm:text-3xl">
          Welcome, Sarah!
        </h1>
        <p className="mt-1 text-sm text-[#8D95A5] sm:text-base">
          Here&apos;s your salon&apos;s overview for today, September 24, 2023.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#DEE1E7] bg-[#F9FAFB] px-4 text-sm font-medium text-[#171A21] transition-colors hover:bg-[#F0F1F3]"
        >
          <Plus className="h-4 w-4" />
          New Booking
        </button>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#F04CAC] px-4 text-sm font-medium text-white transition-colors hover:bg-[#E03A9B]"
        >
          <UserPlus className="h-4 w-4" />
          Add Walk-in
        </button>
      </div>
    </section>
  );
};

export default WelcomeSection;
