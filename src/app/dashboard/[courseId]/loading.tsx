export default function CourseDetailLoading() {
  return (
    <div className="space-y-4 lg:space-y-6 animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-32" />
      <div className="card p-4 lg:p-6 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-64" />
        <div className="h-4 bg-gray-100 rounded w-96" />
        <div className="h-2 bg-gray-100 rounded-full" />
      </div>
      <div className="card p-4 h-64 bg-gray-100" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
