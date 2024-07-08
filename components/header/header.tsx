"use client"
import Image from "next/image"
import Link from "next/link"

const Header = () => {
  return (
    <div className="p-6 w-screen flex justify-between items-center pb-4">
      <Link href="/projects" className="bg-black/75 rounded-lg flex items-center gap-2 p-2 text-white text-lg font-semibold cursor-pointer hover:bg-black/90 transition-all">
        <Image src="/imgs/asg-logo.jpg" alt="asg-logo" width={512} height={512} className="w-12 h-12 rounded-lg" />
        Aktionstage
      </Link>
      <div className="">ba</div>
    </div>
  )
}

export default Header
