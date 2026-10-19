import React from "react";

interface LoadingSkeletonProps {
  type?: "list" | "card" | "table" | "text";
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = "list",
  count = 3,
  className = "",
}) => {
  const renderSkeletonItem = (index: number) => {
    switch (type) {
      case "card":
        return (
          <div
            key={index}
            className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 animate-pulse ${className}`}
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="flex gap-2 mt-4">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        );

      case "table":
        return (
          <tr key={index} className="animate-pulse">
            <td className="px-4 py-3">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </td>
            <td className="px-4 py-3">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </td>
            <td className="px-4 py-3">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </td>
            <td className="px-4 py-3">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </td>
          </tr>
        );

      case "text":
        return (
          <div key={index} className={`animate-pulse ${className}`}>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          </div>
        );

      case "list":
      default:
        return (
          <div
            key={index}
            className={`flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 animate-pulse ${className}`}
          >
            <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) =>
        renderSkeletonItem(index),
      )}
    </div>
  );
};

// Specialized skeleton components for common use cases

export const TaskListSkeleton: React.FC<{ count?: number }> = ({
  count = 3,
}) => <LoadingSkeleton type="card" count={count} />;

export const ApplicantListSkeleton: React.FC<{ count?: number }> = ({
  count = 3,
}) => <LoadingSkeleton type="list" count={count} />;

export const MilestoneListSkeleton: React.FC<{ count?: number }> = ({
  count = 4,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 animate-pulse"
      >
        <div className="h-5 bg-gray-200 rounded w-2/3 mb-3"></div>
        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        </div>
      </div>
    ))}
  </div>
);

export const PeerReviewSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 animate-pulse">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>

    <div className="space-y-4 mb-6">
      <div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
      <div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
      <div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
      <div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-24 bg-gray-200 rounded w-full"></div>
      </div>
    </div>

    <div className="flex gap-3">
      <div className="h-10 bg-gray-200 rounded w-32"></div>
      <div className="h-10 bg-gray-200 rounded w-40"></div>
    </div>
  </div>
);
