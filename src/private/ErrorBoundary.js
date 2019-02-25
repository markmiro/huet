// NOTE: not using huet stuff here because we don't want this to have errors when huet has errors.
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
      return (
        <div
          style={{
            fontFamily: "sans-serif",
            textAlign: "center",
            padding: "1em",
            background: "white",
            color: "black"
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
