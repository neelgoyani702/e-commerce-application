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

function SkeletonProductDetail() {
  return (
    <div className="md:mt-16 mt-32 min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6 py-10 animate-pulse">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <div className="h-3 w-10 bg-gray-200 rounded" />
          <div className="h-3 w-3 bg-gray-100 rounded" />
          <div className="h-3 w-16 bg-gray-200 rounded" />
          <div className="h-3 w-3 bg-gray-100 rounded" />
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </div>
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Image */}
          <div className="lg:w-1/2">
            <div className="aspect-square rounded-3xl bg-gray-100" />
          </div>
          {/* Info */}
          <div className="lg:w-1/2 space-y-5">
            <div className="h-3 w-20 bg-gray-100 rounded-full" />
            <div className="h-8 w-3/4 bg-gray-100 rounded-lg" />
            {/* Rating */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-4 w-4 bg-gray-100 rounded" />)}
              <div className="h-3 w-16 bg-gray-100 rounded" />
            </div>
            {/* Price */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-24 bg-gray-100 rounded-lg" />
              <div className="h-5 w-16 bg-gray-50 rounded" />
              <div className="h-5 w-14 bg-green-50 rounded-full" />
            </div>
            {/* Description */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
            {/* Bullet points */}
            <div className="space-y-2">
              <div className="h-3 bg-gray-50 rounded w-2/3" />
              <div className="h-3 bg-gray-50 rounded w-3/4" />
              <div className="h-3 bg-gray-50 rounded w-1/2" />
            </div>
            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <div className="h-12 bg-gray-100 rounded-xl flex-1" />
              <div className="h-12 w-12 bg-gray-100 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SkeletonCartItem() {
  return (
    <div className="rounded-2xl border border-gray-100 p-5 flex flex-row w-full justify-between bg-white animate-pulse">
      <div className="flex flex-1 gap-5">
        <div className="w-24 h-24 rounded-xl bg-gray-100 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-100 rounded w-2/3" />
          <div className="h-3 bg-gray-50 rounded w-1/4" />
          <div className="h-5 bg-gray-100 rounded w-20 mt-2" />
        </div>
      </div>
      <div className="flex flex-col items-end justify-between">
        <div className="h-4 w-4 bg-gray-100 rounded" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gray-100 rounded-lg" />
          <div className="h-5 w-6 bg-gray-50 rounded" />
          <div className="h-8 w-8 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

function SkeletonCheckout() {
  return (
    <div className="max-w-7xl mx-auto px-6 pb-12 animate-pulse">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left */}
        <div className="flex-1 space-y-6">
          {/* Address section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <div className="h-5 w-40 bg-gray-100 rounded" />
            <div className="space-y-2">
              <div className="h-4 w-3/4 bg-gray-100 rounded" />
              <div className="h-3 w-1/2 bg-gray-50 rounded" />
            </div>
          </div>
          {/* Items */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <div className="h-5 w-28 bg-gray-100 rounded" />
            {[1, 2].map(i => (
              <div key={i} className="flex gap-4 py-3">
                <div className="h-16 w-16 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-50 rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Right - Summary */}
        <div className="lg:w-96">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <div className="h-5 w-32 bg-gray-100 rounded" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-gray-50 rounded" />
                <div className="h-3 w-14 bg-gray-100 rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-3 w-20 bg-gray-50 rounded" />
                <div className="h-3 w-10 bg-gray-100 rounded" />
              </div>
              <div className="border-t border-dashed border-gray-100 pt-3 flex justify-between">
                <div className="h-4 w-12 bg-gray-100 rounded" />
                <div className="h-4 w-16 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="h-12 bg-gray-100 rounded-xl w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

function SkeletonAdminTable({ rows = 5, cols = 5 }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
      {/* Header */}
      <div className="flex gap-4 px-5 py-3 border-b border-gray-100">
        {[...Array(cols)].map((_, i) => (
          <div key={i} className="h-3 bg-gray-100 rounded flex-1" />
        ))}
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, r) => (
        <div key={r} className="flex gap-4 px-5 py-4 border-b border-gray-50">
          {[...Array(cols)].map((_, c) => (
            <div key={c} className={`h-3 rounded flex-1 ${c === 0 ? 'bg-gray-100' : 'bg-gray-50'}`} />
          ))}
        </div>
      ))}
    </div>
  )
}

export { SkeletonCard, SkeletonOrderCard, SkeletonCategoryCard, SkeletonProductDetail, SkeletonCartItem, SkeletonCheckout, SkeletonAdminTable }
