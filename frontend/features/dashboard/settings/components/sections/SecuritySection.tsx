"use client";

import { useTranslation } from "react-i18next";

const SecuritySection = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h2 className="text-xl font-semibold text-[#171A21]">
        {t("dashboard.settings.security.title")}
      </h2>
      <p className="mt-1 text-sm text-[#8D95A5]">
        {t("dashboard.settings.security.description")}
      </p>

      <div className="mt-6 flex flex-col gap-6">
        {/* Change Password */}
        <div className="rounded-[14px] border border-[#DEE1E7] bg-white shadow-[0px_2px_4px_0px_#00000012]">
          <div className="p-6">
            <h3 className="text-base font-semibold text-[#171A21]">
              {t("dashboard.settings.security.changePassword")}
            </h3>
            <div className="mt-4 flex flex-col gap-4">
              {[
                { id: "current", key: "currentPassword" },
                { id: "new", key: "newPassword" },
                { id: "confirm", key: "confirmPassword" },
              ].map(({ id, key }) => (
                <div key={id} className="flex flex-col gap-1.5">
                  <label
                    htmlFor={id}
                    className="text-sm font-medium text-[#171A21]"
                  >
                    {t(`dashboard.settings.security.${key}`)}
                  </label>
                  <input
                    id={id}
                    type="password"
                    className="rounded-[10px] border border-[#DEE1E7] px-3 py-2 text-sm text-[#171A21] shadow-[0px_2px_4px_0px_#00000012] outline-none focus:border-primary"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end border-t border-[#DEE1E7] bg-[#F3F4F7]/30 px-6 py-3">
            <button className="rounded-[10px] bg-primary px-5 py-2 text-sm font-medium text-white shadow-[0px_1px_3px_0px_#0000001a] hover:opacity-90">
              {t("dashboard.settings.security.updatePassword")}
            </button>
          </div>
        </div>

        {/* Staff Access Roles */}
        <div className="rounded-[14px] border border-[#DEE1E7] bg-white shadow-[0px_2px_4px_0px_#00000012]">
          <div className="p-6">
            <h3 className="text-base font-semibold text-[#171A21]">
              {t("dashboard.settings.security.staffAccess")}
            </h3>
            <p className="mt-1 text-sm text-[#8D95A5]">
              {t("dashboard.settings.security.staffAccessDescription")}
            </p>
            <div className="mt-4 divide-y divide-[#DEE1E7]">
              {[
                {
                  key: "owner",
                  badge: "bg-primary/10 text-primary",
                },
                {
                  key: "manager",
                  badge: "bg-[#A17DE8]/10 text-[#A17DE8]",
                },
                {
                  key: "stylist",
                  badge: "bg-[#3B9FF7]/10 text-[#3B9FF7]",
                },
              ].map((role) => (
                <div
                  key={role.key}
                  className="flex items-center justify-between py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-[#171A21]">
                      {t(`dashboard.settings.security.roles.${role.key}.name`)}
                    </p>
                    <p className="text-xs text-[#8D95A5]">
                      {t(`dashboard.settings.security.roles.${role.key}.desc`)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${role.badge}`}
                  >
                    {t(`dashboard.settings.security.roles.${role.key}.name`)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;
