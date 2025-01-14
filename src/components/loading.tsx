export default function Loading() {
  return (
    <div className="m-4 flex items-center justify-center">
      <div className="loader w-6 h-6 border-4 border-t-transparent border-green-500 rounded-full animate-spin"></div>
      <span className="ml-2 text-gray-500">Loading...</span>
    </div>
  );
}
