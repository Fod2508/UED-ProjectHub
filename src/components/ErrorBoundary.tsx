import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Đã xảy ra lỗi
                </h2>
                <p className="text-sm text-gray-600">
                  Ứng dụng gặp sự cố không mong muốn
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="font-mono text-sm text-red-800 break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            {this.state.errorInfo && (
              <details className="mb-6">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 mb-2">
                  Chi tiết kỹ thuật (Stack trace)
                </summary>
                <pre className="bg-gray-100 border border-gray-200 rounded p-3 text-xs overflow-auto max-h-64">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Thử lại
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Tải lại trang
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Về trang chủ
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Mẹo:</strong> Nếu lỗi vẫn tiếp diễn, hãy thử:
              </p>
              <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                <li>Đăng xuất và đăng nhập lại</li>
                <li>Xóa cache trình duyệt</li>
                <li>Kiểm tra kết nối Internet</li>
                <li>Liên hệ hỗ trợ kỹ thuật nếu cần thiết</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specialized Error Boundary for Firestore operations
export class FirestoreErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Firestore operation error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 m-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-1">
                Không thể tải dữ liệu
              </h3>
              <p className="text-sm text-yellow-800 mb-3">
                Đã xảy ra lỗi khi kết nối đến cơ sở dữ liệu. Vui lòng kiểm tra
                kết nối Internet và thử lại.
              </p>
              {this.state.error && (
                <p className="text-xs text-yellow-700 font-mono mb-3">
                  {this.state.error.message}
                </p>
              )}
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
