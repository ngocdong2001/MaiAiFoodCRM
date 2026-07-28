import { AlertCircle } from "lucide-react";

const AlertsBanner = () => {
  return (
    <section className="rounded-xl border border-[#F7C6E4] bg-linear-to-r from-[#FDF0F8] to-[#FCE7F3] p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#F04CAC]" />
        <div>
          <p className="text-sm font-semibold text-[#171A21]">
            Important Alerts
          </p>
          <p className="mt-1 text-sm text-[#6B7280]">
            Your calendar integration with Google Calendar is out of sync.
            Please check settings to resolve.{" "}
            <a href="#" className="font-medium text-[#F04CAC] hover:underline">
              Review settings
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default AlertsBanner;
