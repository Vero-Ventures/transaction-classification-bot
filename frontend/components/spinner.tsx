const Spinner = () => {
  const circleCommonClasses = 'h-5 w-5 bg-blue-500 rounded-full';

  return (
    <div className="flex space-x-2">
      <div
        className={`${circleCommonClasses} animate-bounce`}
        style={{ animationDelay: '0s', animationDuration: '1s' }}></div>
      <div
        className={`${circleCommonClasses} animate-bounce`}
        style={{ animationDelay: '0.1s', animationDuration: '1s' }}></div>
      <div
        className={`${circleCommonClasses} animate-bounce`}
        style={{ animationDelay: '0.2s', animationDuration: '1s' }}></div>
      <div
        className={`${circleCommonClasses} animate-bounce`}
        style={{ animationDelay: '0.3s', animationDuration: '1s' }}></div>
    </div>
  );
};

export default Spinner;
