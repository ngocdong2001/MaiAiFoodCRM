"use client";

import { Download, FileText } from "lucide-react";

const QuickExportSection = () => {
  return (
    <div className="flex flex-col rounded-[14px] border border-[#F04CAC]/10 bg-[#FEF1F8] p-6 shadow-[0px_2px_4px_0px_#00000012]">
      <h3 className="text-lg font-semibold text-[#171A21]">Quick Export</h3>
      <p className="mt-1 text-sm text-[#171A21]/70">
        Generate standard reports instantly.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <button className="flex w-full items-center justify-between rounded-[10px] bg-[#F04CAC] px-4 py-2.5 shadow-[0px_2px_4px_0px_#00000012] transition-opacity hover:opacity-90">
          <span className="text-sm font-medium text-white">
            Full Financial Summary
          </span>
          <FileText className="h-4 w-4 text-white" />
        </button>

        <button className="flex w-full items-center justify-between rounded-[10px] border border-[#DEE1E7] bg-white px-4 py-2.5 shadow-[0px_2px_4px_0px_#00000012] transition-colors hover:bg-[#F3F4F7]">
          <span className="text-sm font-medium text-[#171A21]">
            Staff Payroll Export (CSV)
          </span>
          <Download className="h-4 w-4 text-[#8D95A5]" />
        </button>
      </div>
    </div>
  );
};

export default QuickExportSection;
