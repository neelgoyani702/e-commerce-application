import React from 'react'

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-square bg-gray-100" />
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 bg-gray-100 rounded" />
          <div className="h-3 w-3 bg-gray-100 rounded" />
          <div className="h-3 w-3 bg-gray-100 rounded" />
          <div className="h-3 w-3 bg-gray-100 rounded" />
          <div className="h-3 w-3 bg-gray-100 rounded" />
          <div className="h-3 w-12 bg-gray-100 rounded ml-1" />
        </div>
        {/* Description */}
        <div className="space-y-1.5">
          <div className="h-3 bg-gray-50 rounded-lg w-full" />
          <div className="h-3 bg-gray-50 rounded-lg w-2/3" />
        </div>
        {/* Price row */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="h-5 bg-gray-100 rounded-lg w-20" />
          <div className="h-3 bg-gray-50 rounded-lg w-16" />
        </div>
      </div>
    </div>
  )
}

function SkeletonOrderCard() {
  return (
    <div className="rounded-2xl border border-gray-100 p-5 bg-white animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-100" />
          <div className="space-y-1.5">
            <div className="h-3 bg-gray-100 rounded w-20" />
            <div className="h-2.5 bg-gray-50 rounded w-24" />
          </div>
        </div>
        <div className="h-5 bg-gray-100 rounded-full w-20" />
      </div>
      {/* Items */}
      {[1, 2].map((i) => (
        <div key={i} className="flex gap-3 py-3">
          <div className="h-14 w-14 rounded-xl bg-gray-100" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 bg-gray-100 rounded w-2/3" />
            <div className="h-2.5 bg-gray-50 rounded w-16" />
          </div>
          <div className="h-4 bg-gray-100 rounded w-14" />
        </div>
      ))}
      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-100 mt-3">
        <div className="h-3 bg-gray-50 rounded w-12" />
        <div className="h-4 bg-gray-100 rounded w-20" />
      </div>
    </div>
  )
}

function SkeletonCategoryCard() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-100" />
      <div className="p-4">
        <div className="h-4 bg-gray-100 rounded-lg w-2/3 mx-auto" />
      </div>
    </div>
  )
}

export { SkeletonCard, SkeletonOrderCard, SkeletonCategoryCard }
