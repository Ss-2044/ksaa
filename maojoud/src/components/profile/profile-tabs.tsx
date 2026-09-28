"use client";

import { Tabs } from "@base-ui/react/tabs";

export function ProfileTabs({
  tabs,
  defaultTab,
}: {
  tabs: { value: string; label: string; panel: React.ReactNode }[];
  defaultTab: string;
}) {
  return (
    <Tabs.Root defaultValue={defaultTab}>
      <Tabs.List className="relative z-0 mb-5 flex gap-1 overflow-x-auto rounded-2xl bg-slate-100 p-1">
        {tabs.map((t) => (
          <Tabs.Tab
            key={t.value}
            value={t.value}
            className="h-10 shrink-0 rounded-xl px-4 text-sm font-semibold whitespace-nowrap text-slate-600 outline-none hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-brand-500 data-active:text-brand-700"
          >
            {t.label}
          </Tabs.Tab>
        ))}
        <Tabs.Indicator className="absolute top-(--active-tab-top) left-(--active-tab-left) -z-1 h-(--active-tab-height) w-(--active-tab-width) rounded-xl bg-white shadow-sm transition-[left,width] duration-200" />
      </Tabs.List>
      {tabs.map((t) => (
        <Tabs.Panel key={t.value} value={t.value} className="outline-none">
          {t.panel}
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  );
}
