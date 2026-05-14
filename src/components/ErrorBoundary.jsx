"use client";

import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <AlertTriangle size={48} style={{ color: "var(--clay)", marginBottom: 16 }} />
          <h2 style={{ fontFamily: "var(--font-serif)", marginBottom: 8 }}>
            Something went wrong
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 16, maxWidth: 400, textAlign: "center" }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
