"use client";

import { Mail, MapPin, Phone, Upload } from "lucide-react";
import { useEffect, useState } from "react";

import SelectField from "@/shared/components/molecules/SelectField";
import { settingsService } from "../../services/settings.service";

const TIMEZONE_OPTIONS = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Ho_Chi_Minh",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Pacific/Auckland",
].map((tz) => ({ value: tz, label: tz.replace(/_/g, " ") }));

const BusinessProfileSection = () => {
  const [form, setForm] = useState({
    salonName: "Luxe Mane Studio",
    businessType: "Hair Salon",
    email: "hello@luxemane.com",
    phone: "(555) 123-4567",
    address: "123 Elegance Blvd, Suite 200, Beverly Hills, CA 90210",
  });
  const [timezone, setTimezone] = useState("UTC");

  useEffect(() => {
    settingsService.getSalonSettings().then((s) => setTimezone(s.timezone));
  }, []);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#171A21]">Business Profile</h2>
      <p className="mt-1 text-sm text-[#8D95A5]">
        Manage your salon's core information visible to clients.
      </p>

      <div className="mt-6 rounded-[14px] border border-[#DEE1E7] bg-white shadow-[0px_2px_4px_0px_#00000012]">
        <div className="p-6">
          {/* Logo + fields row */}
          <div className="flex gap-8">
            {/* Logo upload */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#DEE1E7] bg-[#F3F4F7]/50">
                <img
                  src="https://cdn.visily.ai/text2design/images/f9ee91517509e4e6e67d8ada44cd8b7e3ecad22982df622d56bd6d80ad4d0983.webp"
                  alt="Salon logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <button className="flex items-center gap-1.5 rounded-[10px] border border-[#DEE1E7] bg-[#F9FAFB] px-3 py-1.5 text-xs font-medium text-[#171A21] shadow-[0px_2px_4px_0px_#00000012] hover:bg-[#F3F4F7]">
                <Upload className="h-3 w-3" />
                Change Logo
              </button>
            </div>

            {/* Fields grid */}
            <div className="flex flex-1 flex-col gap-5">
              <div className="grid grid-cols-2 gap-5">
                {/* Salon Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#171A21]">
                    Salon Name
                  </label>
                  <input
                    type="text"
                    value={form.salonName}
                    onChange={(e) => handleChange("salonName", e.target.value)}
                    className="rounded-[10px] border border-[#DEE1E7] px-3 py-2 text-sm text-[#171A21] shadow-[0px_2px_4px_0px_#00000012] outline-none focus:border-primary"
                  />
                </div>

                {/* Business Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#171A21]">
                    Business Type
                  </label>
                  <SelectField
                    value={form.businessType}
                    onValueChange={(value) =>
                      handleChange("businessType", value)
                    }
                    options={[
                      "Hair Salon",
                      "Nail Salon",
                      "Spa",
                      "Barbershop",
                      "Beauty Studio",
                    ].map((item) => ({ value: item, label: item }))}
                    ariaLabel="Business Type"
                    className="rounded-[10px] border-[#DEE1E7] px-3 py-2 text-sm text-[#171A21] shadow-[0px_2px_4px_0px_#00000012]"
                  />
                </div>

                {/* Contact Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#171A21]">
                    Contact Email
                  </label>
                  <div className="flex items-center gap-2 rounded-[10px] border border-[#DEE1E7] px-3 py-2 shadow-[0px_2px_4px_0px_#00000012] focus-within:border-primary">
                    <Mail className="h-4 w-4 shrink-0 text-[#8D95A5]" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full text-sm text-[#171A21] outline-none"
                    />
                  </div>
                </div>

                {/* Primary Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#171A21]">
                    Primary Phone
                  </label>
                  <div className="flex items-center gap-2 rounded-[10px] border border-[#DEE1E7] px-3 py-2 shadow-[0px_2px_4px_0px_#00000012] focus-within:border-primary">
                    <Phone className="h-4 w-4 shrink-0 text-[#8D95A5]" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="w-full text-sm text-[#171A21] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Salon Timezone */}
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#171A21]">
                    Salon Timezone
                  </label>
                  <SelectField
                    value={timezone}
                    onValueChange={setTimezone}
                    options={TIMEZONE_OPTIONS}
                    ariaLabel="Salon Timezone"
                    className="rounded-[10px] border-[#DEE1E7] px-3 py-2 text-sm text-[#171A21] shadow-[0px_2px_4px_0px_#00000012]"
                  />
                  <span className="text-xs text-[#8D95A5]">
                    Used by the voice agent to convert booking times correctly.
                  </span>
                </div>
              </div>

              {/* Physical Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#171A21]">
                  Physical Address
                </label>
                <div className="flex items-center gap-2 rounded-[10px] border border-[#DEE1E7] px-3 py-2 shadow-[0px_2px_4px_0px_#00000012] focus-within:border-primary">
                  <MapPin className="h-4 w-4 shrink-0 text-[#8D95A5]" />
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="w-full text-sm text-[#171A21] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-[#DEE1E7] bg-[#F3F4F7]/30 px-6 py-3">
          <button
            onClick={() => settingsService.updateSalonSettings({ timezone })}
            className="rounded-[10px] bg-primary px-5 py-2 text-sm font-medium text-white shadow-[0px_1px_3px_0px_#0000001a] hover:opacity-90"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfileSection;
