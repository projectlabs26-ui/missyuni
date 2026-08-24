export default function AdminLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-48" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="h-10 bg-gray-100 rounded-lg w-10" />
            <div className="h-5 bg-gray-200 rounded w-24" />
            <div className="h-8 bg-gray-100 rounded w-16" />
          </div>
        ))}
      </div>
      <div className="card p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-32" />
        <div className="h-40 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}
