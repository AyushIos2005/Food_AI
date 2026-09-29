import { Component } from "react";
import { CircleAlert } from "lucide-react";

// Last line of defence: if a page crashes, show a calm message instead of a
// white screen or a stack trace.
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error("UI crashed:", error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="min-h-dvh flex items-center justify-center p-6">
        <div className="card max-w-sm w-full p-8 text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-red-50 text-danger flex items-center justify-center">
            <CircleAlert size={26} aria-hidden="true" />
          </div>
          <h1 className="font-display text-2xl">Something broke on our side</h1>
          <p className="text-sm text-ink-soft">Your data is safe. Refreshing the page usually fixes it.</p>
          <div className="flex gap-3 mt-2">
            <button className="btn-primary btn-sm" onClick={() => window.location.reload()}>
              Refresh
            </button>
            <button className="btn-outline btn-sm" onClick={() => window.location.assign("/home")}>
              Go home
            </button>
          </div>
        </div>
      </div>
    );
  }
}
