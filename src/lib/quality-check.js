const QUALITY_THRESHOLDS = {
  hd: 720,
  sd: 480,
  low: 240,
};

const MAX_RUNTIME_DRIFT = 0.3;

export function scoreSource(source, tmdbRuntime) {
  const scores = { resolution: 0, audio: 0, duration: 0 };
  const notes = [];

  const height = source.resolution?.height
    || (source.definition === "hd" ? 720 : source.definition === "sd" ? 480 : null);

  if (height) {
    if (height >= QUALITY_THRESHOLDS.hd) {
      scores.resolution = 3;
    } else if (height >= QUALITY_THRESHOLDS.sd) {
      scores.resolution = 2;
    } else if (height >= QUALITY_THRESHOLDS.low) {
      scores.resolution = 1;
      notes.push("low-resolution");
    } else {
      scores.resolution = 0;
      notes.push("very-low-resolution");
    }
  } else {
    scores.resolution = 1;
    notes.push("resolution-unknown");
  }

  if (source.hasAudio !== false) {
    scores.audio = 1;
  } else {
    notes.push("no-audio");
  }

  if (tmdbRuntime && source.duration) {
    const tmdbSeconds = tmdbRuntime * 60;
    const drift = Math.abs(source.duration - tmdbSeconds) / tmdbSeconds;
    if (drift <= 0.1) {
      scores.duration = 3;
    } else if (drift <= MAX_RUNTIME_DRIFT) {
      scores.duration = 2;
      notes.push("runtime-mismatch");
    } else {
      scores.duration = 0;
      notes.push("likely-not-full-movie");
    }
  } else {
    scores.duration = 1;
    notes.push("duration-unknown");
  }

  const total = scores.resolution + scores.audio + scores.duration;

  let quality;
  if (height && height < QUALITY_THRESHOLDS.low) {
    quality = "unwatchable";
  } else if (scores.duration === 0 && tmdbRuntime) {
    quality = "unwatchable";
  } else if (total >= 6) {
    quality = "hd";
  } else if (total >= 4) {
    quality = "sd";
  } else {
    quality = "low";
  }

  return {
    quality,
    total,
    scores,
    notes,
    height,
  };
}

export function rankSources(sources, tmdbRuntime) {
  return sources
    .map((source) => ({
      ...source,
      qualityInfo: scoreSource(source, tmdbRuntime),
    }))
    .filter((s) => s.qualityInfo.quality !== "unwatchable")
    .sort((a, b) => {
      // RTVE is highest priority (official broadcaster, legal, HD)
      if (a.source === "rtve" && b.source !== "rtve") return -1;
      if (b.source === "rtve" && a.source !== "rtve") return 1;
      if (a.source === "internet-archive" && b.source !== "internet-archive") return -1;
      if (b.source === "internet-archive" && a.source !== "internet-archive") return 1;
      if (a.source === "vimeo" && b.source !== "vimeo") return -1;
      if (b.source === "vimeo" && a.source !== "vimeo") return 1;
      if (a.qualityInfo.total !== b.qualityInfo.total) return b.qualityInfo.total - a.qualityInfo.total;
      if ((a.source === "youtube" && b.source === "youtube") || (a.source === "vimeo" && b.source === "vimeo")) {
        if (a.isOfficialChannel && !b.isOfficialChannel) return -1;
        if (!a.isOfficialChannel && b.isOfficialChannel) return 1;
      }
      return 0;
    });
}
