"use client";

import { Archive, PlayCircle } from "lucide-react";

const SOURCE_CONFIG = {
  "internet-archive": { icon: Archive, label: "Internet Archive", className: "source-badge source-badge--ia" },
  "youtube": { icon: PlayCircle, label: "YouTube", className: "source-badge source-badge--yt" },
};

export default function SourceBadge({ source, size = "default" }) {
  const cfg = SOURCE_CONFIG[source];
  if (!cfg) return null;

  const Icon = cfg.icon;
  const iconSize = size === "sm" ? 12 : 14;

  return (
    <span className={cfg.className}>
      <Icon size={iconSize} style={{ verticalAlign: "middle", marginRight: 4 }} />
      {size !== "sm" && cfg.label}
    </span>
  );
}
