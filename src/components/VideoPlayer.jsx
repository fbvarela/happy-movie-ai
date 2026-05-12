"use client";

export default function VideoPlayer({ source }) {
  if (!source) return null;

  if (source.source === "internet-archive") {
    return (
      <div className="video-player">
        <iframe
          src={source.embedUrl}
          width="100%"
          height="100%"
          allowFullScreen
          allow="autoplay"
          style={{ border: "none" }}
          title={source.title}
        />
      </div>
    );
  }

  if (source.source === "youtube") {
    return (
      <div className="video-player">
        <iframe
          src={`${source.embedUrl}?autoplay=0&rel=0`}
          width="100%"
          height="100%"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          style={{ border: "none" }}
          title={source.title}
        />
      </div>
    );
  }

  return null;
}
