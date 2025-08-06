const MessageSkeleton = () => {
  const skeletonMessages = Array(8).fill(null);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {skeletonMessages.map((_, idx) => (
        <div
          key={idx}
          className={`flex items-start gap-3 ${
            idx % 2 === 0 ? 'justify-start' : 'justify-end'
          }`}
        >
          {/* Avatar (only on the start side) */}
          {idx % 2 === 0 && (
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <div className="skeleton w-full h-full rounded-full" />
            </div>
          )}

          {/* Message bubble skeleton */}
          <div
            className={`skeleton h-16 w-[200px] rounded-lg ${
              idx % 2 === 0 ? 'bg-muted' : 'bg-muted'
            }`}
          ></div>

          {/* Avatar on the right if it's chat-end */}
          {idx % 2 !== 0 && (
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <div className="skeleton w-full h-full rounded-full" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;
