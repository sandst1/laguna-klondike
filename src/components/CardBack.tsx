export function CardBack() {
  return (
    <>
      <div className="absolute inset-0 opacity-30">
        <svg
          className="h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="felt-weave"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 0L20 20M20 0L0 20"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.4"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#felt-weave)" />
        </svg>
      </div>
      <div className="relative z-10 flex h-2/3 w-2/3 items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-3/4 w-3/4 rounded-full border-2 border-green-800/50" />
        </div>
      </div>
    </>
  );
}
