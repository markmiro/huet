// NOTE: not using huet stuff here because we don't want this to have errors when huet has errors.
import React from "react";
import { reset } from "./useBrowserState";
import __ from "./atoms";

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
        <div
          style={{
            ...__.pa2,
            background: "white",
            color: "black"
          }}
        >
          <h1 style={__.f6.mt0.mb1}>Something went wrong.</h1>
          <button
            onClick={reset}
            style={{
              ...__.f5.pa2,
              background: "black",
              color: "white"
            }}
          >
            Try resetting local storage
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
