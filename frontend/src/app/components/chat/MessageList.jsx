import MessageBubble from "./MessageBubble";

const MessageList = ({ messages = [], currentUserId, loadMore, hasMore }) => {
  return (
    <div className="relative flex-1 min-h-0 overflow-y-scroll  h-[60vh] overflow-x-hidden bg-[color:var(--background)] px-3 sm:px-4 md:px-6 pt-4 sm:pt-6 pb-10 no-scrollbar">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-6 left-2 sm:left-10 w-40 h-40 sm:w-56 sm:h-56 lg:w-72 lg:h-72 rounded-full bg-[color:var(--primary)]/5 blur-3xl"></div>

        <div className="absolute bottom-0 right-0 w-44 h-44 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-full bg-[color:var(--accent)]/5 blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mb-6">
            <button
              onClick={loadMore}
              className="px-4 py-1.5 rounded-full bg-neutral-900/60 hover:bg-neutral-800 border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition active:scale-95 shadow-md cursor-pointer"
            >
              Load Older Messages
            </button>
          </div>
        )}

        {/* Date Divider */}
        <div className="flex items-center justify-center mb-5 sm:mb-8">
          <div className="px-4 py-1.5 rounded-full bg-[color:var(--card)] border border-[color:var(--border)] text-xs text-[color:var(--muted-foreground)] shadow-lg backdrop-blur-xl transition-all duration-300">
            Today
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-2 sm:space-y-3">
          {messages.length > 0 ? (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} currentUserId={currentUserId} />
            ))
          ) : (
            <div className="h-50 flex items-center justify-center ">
              <div className="text-center w-full max-w-xs sm:max-w-md px-4">
                {/* Icon */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl sm:rounded-3xl bg-[color:var(--card)] border border-[color:var(--border)] flex items-center justify-center mx-auto text-3xl sm:text-4xl lg:text-5xl shadow-lg backdrop-blur-xl transition-all duration-300 text-[color:var(--foreground)]">
                  💬
                </div>

                {/* Heading */}
                <h2 className="text-[color:var(--foreground)] text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight mt-5 sm:mt-7">
                  No messages yet
                </h2>

                {/* Description */}
                <p className="text-[color:var(--muted-foreground)] mt-3 sm:mt-4 text-sm sm:text-base max-w-sm leading-6 sm:leading-8 mx-auto">
                  Start the conversation by sending your first message to this
                  chat workspace.
                </p>


              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageList;
