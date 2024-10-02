const SomeButton = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-[#4facfe] to-[#00f2fe]">
      {/* Filter for hover effect */}
      <svg width="0" height="0">
        <filter id="filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".02"
            numOctaves="8"
          />
          <feDisplacementMap in="SourceGraphic" scale="100" />
        </filter>
      </svg>

      <div className="relative w-[160px] h-[70px] bg-[#2980b9] flex justify-center items-center cursor-pointer rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl group">
        <span className="text-white text-lg uppercase tracking-wider z-10">
          Hover
        </span>

        {/* The background circle, animated on hover */}
        <div
          className="absolute w-0 h-0 bg-[#27ae60] rounded-full transition-all duration-[2.5s] group-hover:w-[400px] group-hover:h-[400px] left-[-200px] top-[-200px] filter"
          style={{ filter: "url(#filter)" }}
        ></div>
      </div>

      <div className="absolute bottom-10 right-10 flex space-x-8">
        <a
          href="https://twitter.com/DevLoop01"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fab fa-twitter-square text-3xl text-white transition duration-300 hover:text-black"></i>
        </a>
        <a
          href="https://codepen.io/dev_loop/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fab fa-codepen text-3xl text-white transition duration-300 hover:text-black"></i>
        </a>
      </div>
    </div>
  )
}

export default SomeButton
