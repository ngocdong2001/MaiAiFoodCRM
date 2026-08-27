"use client";

import { Mail, MapPin, Phone, Upload } from "lucide-react";
import { useEffect, useState } from "react";

import SelectField from "@/shared/components/molecules/SelectField";
import { settingsService } from "../../services/settings.service";

/* ── Comprehensive timezone list with UTC offset labels ── */
const TIMEZONE_ENTRIES: { value: string; utc: string }[] = [
  // UTC± offsets
  { value: "Etc/GMT+12",   utc: "UTC−12:00" },
  { value: "Etc/GMT+11",   utc: "UTC−11:00" },
  { value: "Pacific/Pago_Pago", utc: "UTC−11:00 (Pago Pago)" },
  { value: "Pacific/Honolulu",  utc: "UTC−10:00 (Hawaii)" },
  { value: "America/Anchorage", utc: "UTC−09:00 (Alaska)" },
  { value: "America/Los_Angeles", utc: "UTC−08:00 (Pacific)" },
  { value: "America/Denver",  utc: "UTC−07:00 (Mountain)" },
  { value: "America/Chicago", utc: "UTC−06:00 (Central)" },
  { value: "America/New_York", utc: "UTC−05:00 (Eastern)" },
  { value: "America/Caracas", utc: "UTC−04:30 (Caracas)" },
  { value: "America/Halifax", utc: "UTC−04:00 (Atlantic)" },
  { value: "America/St_Johns", utc: "UTC−03:30 (Newfoundland)" },
  { value: "America/Sao_Paulo", utc: "UTC−03:00 (São Paulo)" },
  { value: "America/Argentina/Buenos_Aires", utc: "UTC−03:00 (Buenos Aires)" },
  { value: "America/Noronha", utc: "UTC−02:00 (Fernando de Noronha)" },
  { value: "Atlantic/Azores", utc: "UTC−01:00 (Azores)" },
  { value: "UTC",           utc: "UTC±00:00 (UTC)" },
  { value: "Europe/London", utc: "UTC+00:00 (London)" },
  { value: "Europe/Dublin", utc: "UTC+00:00 (Dublin)" },
  { value: "Africa/Lagos",  utc: "UTC+01:00 (Lagos)" },
  { value: "Europe/Paris",  utc: "UTC+01:00 (Paris)" },
  { value: "Europe/Berlin", utc: "UTC+01:00 (Berlin)" },
  { value: "Europe/Rome",   utc: "UTC+01:00 (Rome)" },
  { value: "Europe/Madrid", utc: "UTC+01:00 (Madrid)" },
  { value: "Africa/Johannesburg", utc: "UTC+02:00 (Johannesburg)" },
  { value: "Europe/Athens", utc: "UTC+02:00 (Athens)" },
  { value: "Europe/Bucharest", utc: "UTC+02:00 (Bucharest)" },
  { value: "Africa/Cairo",  utc: "UTC+02:00 (Cairo)" },
  { value: "Europe/Helsinki", utc: "UTC+02:00 (Helsinki)" },
  { value: "Europe/Istanbul", utc: "UTC+03:00 (Istanbul)" },
  { value: "Europe/Moscow", utc: "UTC+03:00 (Moscow)" },
  { value: "Asia/Riyadh",   utc: "UTC+03:00 (Riyadh)" },
  { value: "Asia/Dubai",    utc: "UTC+04:00 (Dubai)" },
  { value: "Asia/Tehran",   utc: "UTC+03:30 (Tehran)" },
  { value: "Asia/Karachi",  utc: "UTC+05:00 (Karachi)" },
  { value: "Asia/Kolkata",  utc: "UTC+05:30 (India)" },
  { value: "Asia/Dhaka",    utc: "UTC+06:00 (Dhaka)" },
  { value: "Asia/Almaty",   utc: "UTC+06:00 (Almaty)" },
  { value: "Asia/Bangkok",  utc: "UTC+07:00 (Bangkok)" },
  { value: "Asia/Ho_Chi_Minh", utc: "UTC+07:00 (Ho Chi Minh)" },
  { value: "Asia/Jakarta",  utc: "UTC+07:00 (Jakarta)" },
  { value: "Asia/Shanghai", utc: "UTC+08:00 (Shanghai)" },
  { value: "Asia/Singapore", utc: "UTC+08:00 (Singapore)" },
  { value: "Asia/Hong_Kong", utc: "UTC+08:00 (Hong Kong)" },
  { value: "Asia/Taipei",   utc: "UTC+08:00 (Taipei)" },
  { value: "Asia/Perth",    utc: "UTC+08:00 (Perth)" },
  { value: "Asia/Seoul",    utc: "UTC+09:00 (Seoul)" },
  { value: "Asia/Tokyo",    utc: "UTC+09:00 (Tokyo)" },
  { value: "Australia/Adelaide", utc: "UTC+09:30 (Adelaide)" },
  { value: "Australia/Sydney", utc: "UTC+10:00 (Sydney)" },
  { value: "Australia/Melbourne", utc: "UTC+10:00 (Melbourne)" },
  { value: "Pacific/Auckland", utc: "UTC+12:00 (Auckland)" },
  { value: "Pacific/Fiji",  utc: "UTC+12:00 (Fiji)" },
  { value: "Pacific/Tongatapu", utc: "UTC+13:00 (Tonga)" },
];

const TIMEZONE_OPTIONS = TIMEZONE_ENTRIES.map((tz) => ({
  value: tz.value,
  label: `${tz.utc}  –  ${tz.value.replace(/_/g, " ")}`,
}));

const DEFAULT_FORM = {
  salonName: "",
  businessType: "Hair Salon",
  email: "",
  phone: "",
  address: "",
};

const BusinessProfileSection = () => {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [timezone, setTimezone] = useState("UTC");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsService.getSalonSettings().then((s) => {
      setForm({
        salonName:    s.salonName   || "",
        businessType: s.businessType || "Hair Salon",
        email:        s.email       || "",
        phone:        s.phone       || "",
        address:      s.address     || "",
      });
      setTimezone(s.timezone || "UTC");
    });
  }, []);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.updateSalonSettings({
        ...form,
        timezone,
      });
    } finally {
      setSaving(false);
    }
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
                    placeholder="e.g. Luxe Mane Studio"
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
                      placeholder="hello@example.com"
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
                      placeholder="(555) 123-4567"
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
                    placeholder="123 Main St, Suite 100, City, State ZIP"
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
            onClick={handleSave}
            disabled={saving}
            className="rounded-[10px] bg-primary px-5 py-2 text-sm font-medium text-white shadow-[0px_1px_3px_0px_#0000001a] hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfileSection;
