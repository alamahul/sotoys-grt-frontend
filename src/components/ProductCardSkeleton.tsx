export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-square bg-gray-200"></div>
      
      {/* Content Skeleton */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Category & Rating */}
        <div className="flex justify-between items-center mb-2">
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-10"></div>
        </div>
        
        {/* Title */}
        <div className="h-5 bg-gray-200 rounded w-full mb-1"></div>
        <div className="h-5 bg-gray-200 rounded w-2/3 mb-4"></div>
        
        {/* Price */}
        <div className="mt-auto">
          <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
          
          {/* Button */}
          <div className="w-full h-10 bg-gray-200 rounded text-transparent"></div>
        </div>
      </div>
    </div>
  );
}
