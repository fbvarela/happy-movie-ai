import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
    }}>
      <Loader2 size={32} className="spin" style={{ color: "var(--leaf)" }} />
    </div>
  );
}
