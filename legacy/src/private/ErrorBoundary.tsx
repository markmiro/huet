import React from "react";

import { reset } from "./useBrowserState";

type ErrorBoundaryProps = {
  children?: React.ReactNode;
  componentName?: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            fontFamily: "sans-serif",
            textAlign: "center",
            padding: "1em",
            background: "white",
            color: "black",
          }}
        >
          <h1 style={{ color: "red", fontSize: "1em", margin: "0" }}>
            {this.props.componentName && this.props.componentName + ": "}
            Something went wrong
          </h1>
          <p style={{ margin: ".5em 0" }}>
            Try clearing local storage:{" "}
            <button onClick={reset}>Reset this Page</button>
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
