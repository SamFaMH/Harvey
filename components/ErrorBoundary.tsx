'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
          <p className="text-lg font-medium text-slate-800 dark:text-slate-100">
            Something went wrong. Please refresh.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 min-h-[44px] rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Refresh page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
