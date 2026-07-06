const SearchBar = ({
  placeholder = "Search conversations...",
  value = "",
  onChange,
  className = "",
  styleVars = {}, // optional: { primary: '#...', background: '#...', mutedForeground: '#...' }
}) => {
  // convert styleVars to CSS variables (e.g. { primary: '#f00' } -> { '--primary': '#f00' })
  const cssVars = Object.keys(styleVars).reduce((acc, key) => {
    acc[`--${key}`] = styleVars[key];
    return acc;
  }, {});

  return (
    <div className={`relative w-full ${className}`} style={cssVars}>
      {/* Search Icon */}
      <div
        className="absolute left-4 top-1/2 -translate-y-1/2 text-lg pointer-events-none"
        style={{ color: "var(--muted-foreground, #9ca3af)" }}
      >
        🔍
      </div>

      {/* Input */}
      <input
        type="text"
        value={onChange ? value : undefined}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-14 rounded-2xl bg-[color:var(--background)] border border-[color:var(--border)] pl-12 pr-14 text-[color:var(--foreground)] placeholder:text-[color:var(--muted-foreground)] outline-none transition-all duration-300 focus:border-[color:var(--primary)]/50 focus:shadow-[0_0_20px_var(--primary,rgba(34,197,94,0.08))] hover:border-[color:var(--border)] text-[15px]"
      />

      {/* Shortcut Hint */}
      <div
        className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs"
        style={{ color: "var(--muted-foreground, #9ca3af)" }}
      >
        <span className="px-2 py-1 rounded-md bg-[color:var(--card)] border border-[color:var(--border)] shadow-sm">
          ⌘
        </span>

        <span className="px-2 py-1 rounded-md bg-[color:var(--card)] border border-[color:var(--border)] shadow-sm">
          K
        </span>
      </div>
    </div>
  );
};

export default SearchBar;
