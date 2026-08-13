export type InfoFormData = {
  firstName: string;
  lastName: string;
  email: string;
  salonName: string;
};

export type InfoRecord = InfoFormData & {
  id: string;
  timestamp: string;
};

export const InfoModel = {
  async create(data: InfoFormData): Promise<InfoRecord> {
    return {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...data,
    };
  },

  async getAll(): Promise<InfoRecord[]> {
    return [];
  },
};
