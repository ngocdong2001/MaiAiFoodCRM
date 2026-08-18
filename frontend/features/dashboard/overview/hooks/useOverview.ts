import { useQuery } from "@tanstack/react-query";

import { overviewService } from "../services/overview.service";

export const useOverviewStats = () =>
  useQuery({
    queryKey: ["overview", "stats"],
    queryFn: overviewService.getStats,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
