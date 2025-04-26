export default function Loading({ size = 'medium', fullPage = false }) {
  // Size class mapping
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4'
  };
  
  const spinnerClass = `${sizeClasses[size] || sizeClasses.medium} border-gray-300 border-t-primary-600 rounded-full animate-spin`;
  
  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        <div className={spinnerClass}></div>
      </div>
    );
  }
  
  return (
    <div className="flex justify-center items-center p-4">
      <div className={spinnerClass}></div>
    </div>
  );
} 