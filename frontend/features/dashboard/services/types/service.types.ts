export type ServiceCategory = {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  serviceCount: number;
};

export type ServiceItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  durationMinutes: number;
  categoryId: number;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  category: Omit<ServiceCategory, "serviceCount"> | null;
  bookingCount: number;
  createdAt: string;
  updatedAt: string;
};

/** One editable line of the price spreadsheet. `id` is null until the row is saved. */
export type ServiceDraftRow = {
  key: string;
  id: number | null;
  name: string;
  categoryId: number | null;
  durationMinutes: string;
  price: string;
  isActive: boolean;
  description: string | null;
  imageUrl: string | null;
};

export type ServiceBulkPayload = {
  upserts: Array<{
    id?: number;
    name: string;
    description: string | null;
    price: number;
    durationMinutes: number;
    categoryId: number;
    imageUrl: string | null;
    isActive: boolean;
    sortOrder: number;
  }>;
  deleteIds: number[];
};

export type ServiceCategoryFormValues = {
  name: string;
  description: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
};

export type ServiceStatusFilter = "all" | "active" | "inactive";
