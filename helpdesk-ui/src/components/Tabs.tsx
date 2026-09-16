import React, { useState } from 'react';
import './Tabs.css';

interface Tab {
  key: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (key: string) => void;
}

export function Tabs({ tabs, defaultTab, activeTab: controlledTab, onTabChange }: TabsProps) {
  const [internalActive, setInternalActive] = useState(defaultTab ?? tabs[0]?.key ?? '');
  const active = controlledTab ?? internalActive;

  const handleSelect = (key: string) => {
    setInternalActive(key);
    onTabChange?.(key);
  };

  const activeContent = tabs.find(t => t.key === active)?.content;

  return (
    <div className="tabs">
      <div className="tabs__bar" role="tablist">
        {tabs.map(t => (
          <button
            key={t.key}
            role="tab"
            aria-selected={active === t.key}
            aria-controls={`tabpanel-${t.key}`}
            id={`tab-${t.key}`}
            className={`tabs__tab ${active === t.key ? 'tabs__tab--active' : ''}`}
            onClick={() => !t.disabled && handleSelect(t.key)}
            disabled={t.disabled}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        id={`tabpanel-${active}`}
        role="tabpanel"
        aria-labelledby={`tab-${active}`}
        className="tabs__panel"
      >
        {activeContent}
      </div>
    </div>
  );
}
