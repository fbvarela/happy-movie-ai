"use client";

import { MonitorCheck, MonitorDot, MonitorX } from "lucide-react";

const CONFIG = {
  hd: { className: "badge badge-leaf", icon: MonitorCheck, label: "HD" },
  sd: { className: "badge badge-sun", icon: MonitorDot, label: "SD" },
  low: { className: "badge badge-clay", icon: MonitorX, label: "Low" },
};

export default function QualityBadge({ quality, notes = [], size = "default" }) {
  const cfg = CONFIG[quality];
  if (!cfg) return null;

  const Icon = cfg.icon;
  const iconSize = size === "sm" ? 12 : 14;
  const tooltip = notes.length > 0 ? notes.join(", ") : undefined;

  return (
    <span className={`${cfg.className}${size === "sm" ? " badge-sm" : ""}`} title={tooltip}>
      <Icon size={iconSize} style={{ verticalAlign: "middle", marginRight: 3 }} />
      {cfg.label}
    </span>
  );
}
