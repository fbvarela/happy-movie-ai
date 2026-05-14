"use client";

import { Archive, PlayCircle, Tv, MonitorPlay, Satellite, Radio } from "lucide-react";

const SOURCE_CONFIG = {
  "internet-archive": { icon: Archive, label: "Internet Archive", className: "source-badge source-badge--ia" },
  "youtube": { icon: PlayCircle, label: "YouTube", className: "source-badge source-badge--yt" },
  "rtve": { icon: Radio, label: "RTVE Play", className: "source-badge source-badge--rtve" },
  "tubi": { icon: Tv, label: "Tubi", className: "source-badge source-badge--tubi" },
  "plex": { icon: MonitorPlay, label: "Plex", className: "source-badge source-badge--plex" },
  "pluto": { icon: Satellite, label: "Pluto TV", className: "source-badge source-badge--pluto" },
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
