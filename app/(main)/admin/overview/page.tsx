import React from "react"

type Props = {}

const Overview = (props: Props) => {
  return (
    <div className="relative h-full w-full flex-1">
      <div className="absolute top-0 left-0 h-[30vh] w-full border-b border-zinc-300 from-[#e7e7eb] to-[#f0f2ff] bg-gradient-to-br dark:border-zinc-800 dark:bg-[#111015]"></div>
      <div className="relative p-16 flex flex-row gap-6 flex-wrap"></div>
    </div>
  )
}

export default Overview
