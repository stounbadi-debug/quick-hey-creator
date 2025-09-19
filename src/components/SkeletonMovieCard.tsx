import { Badge } from "@/components/ui/badge";

const SkeletonMovieCard = () => {
  return (
    <div className="movie-card rounded-2xl overflow-hidden group relative animate-scale-in">
      {/* Badge Skeleton */}
      <div className="absolute top-3 left-3 z-10">
        <Badge className="bg-muted/50 text-transparent border-0 shadow-lg font-bold animate-pulse">
          Loading...
        </Badge>
      </div>

      {/* Action Buttons Skeleton */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-full bg-muted/30 backdrop-blur-md animate-pulse"
          />
        ))}
      </div>

      {/* Poster Skeleton */}
      <div className="relative aspect-[2/3] bg-gradient-card overflow-hidden">
        <div className="w-full h-full loading-pulse" />
        
        {/* Overlay Skeleton */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {/* Rating Skeleton */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-muted/40 animate-pulse" />
                <div className="w-8 h-4 bg-muted/40 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-muted/40 animate-pulse" />
                <div className="w-10 h-4 bg-muted/40 rounded animate-pulse" />
              </div>
            </div>
            
            {/* Title Skeleton */}
            <div className="space-y-2 mb-3">
              <div className="h-6 bg-muted/40 rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-muted/40 rounded w-1/2 animate-pulse" />
            </div>
            
            {/* Overview Skeleton */}
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-muted/30 rounded w-full animate-pulse" />
              <div className="h-3 bg-muted/30 rounded w-4/5 animate-pulse" />
              <div className="h-3 bg-muted/30 rounded w-3/4 animate-pulse" />
            </div>
            
            {/* Button Skeleton */}
            <div className="flex gap-2">
              <div className="flex-1 h-10 bg-muted/30 rounded-xl animate-pulse" />
              <div className="flex-1 h-10 bg-primary/20 rounded-xl animate-pulse" />
              <div className="w-10 h-10 bg-muted/30 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonMovieCard;