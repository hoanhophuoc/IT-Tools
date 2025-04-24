// Simple Spinner component (replace with your preferred one)
const Spinner = ({ size = "md" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };
  return (
    <div
      className={`animate-spin rounded-full border-2 border-current border-t-transparent ${sizeClasses[size]}`}
      role="status"
      aria-live="polite"
    ></div>
  );
};
export default Spinner;
