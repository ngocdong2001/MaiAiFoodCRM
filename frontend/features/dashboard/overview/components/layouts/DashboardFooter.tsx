import DashboardContainer from "./DashboardContainer";

const DashboardFooter = () => {
  return (
    <footer className="border-t border-[#DEE1E7] bg-[#F9FAFB]">
      <DashboardContainer className="flex flex-col items-center justify-between gap-2 py-5 text-sm text-[#8D95A5] sm:flex-row">
        <p>© 2026 MaiAI Systems. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#" className="transition-colors hover:text-[#F04CAC]">
            Support
          </a>
          <a href="#" className="transition-colors hover:text-[#F04CAC]">
            Terms of Service
          </a>
        </div>
      </DashboardContainer>
    </footer>
  );
};

export default DashboardFooter;
