import React from "react";
import { reset } from "./useBrowserState";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, info);
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="pa2 bg-white black">
          <h1 className="f6 mt0 mb1">Something went wrong.</h1>
          <button className="f6 bg-black white pa2" onClick={reset}>
            Try resetting local storage
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
