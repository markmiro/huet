import { default as React } from 'react';
type ErrorBoundaryProps = {
    children?: React.ReactNode;
    componentName?: string;
};
type ErrorBoundaryState = {
    hasError: boolean;
};
export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState;
    static getDerivedStateFromError(): ErrorBoundaryState;
    componentDidCatch(error: Error, info: React.ErrorInfo): void;
    render(): string | number | boolean | Iterable<React.ReactNode> | React.JSX.Element | null | undefined;
}
export {};
