import Image from "next/image"
import { Button } from "../ui/button"

const FeatureTutorial = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black opacity-50 pointer-events-none z-[99]"></div>

      {/* Modal Content */}
      <div className="relative bg-white shadow-lg rounded-xl p-8 w-[95vw] max-h-[90vh] max-w-3xl mx-auto z-[100] pointer-events-auto">
        <h1 className="text-2xl font-semibold drop-shadow-lg">
          Die neue Aktionstage Webseite ist da!
        </h1>
        <p className="text-slate-400 mb-8 max-w-lg">
          Entdecke die durch viel Arbeit entstandenen neuen Features und
          Verbesserungen, wie zum Beispiel:
        </p>
        <div className="flex mb-8 flex-col">
          <div className="flex flex-col md:flex-row w-full justify-center gap-4 md:gap-8">
            <span className="ml-4 md:ml-0 text-xl font-bold text-slate-700 relative md:drop-shadow-lg inline-block">
              ⚡ Next level UI
              <Image
                src="/underline.svg"
                alt="Underline"
                width={126}
                height={14}
                className="absolute left-[15%] md:left-[25%] top-[85%] md:top-[95%] w-[40%] md:w-[70%]"
              />
            </span>
            <span className="ml-4 md:ml-0 text-xl font-bold text-slate-700 relative drop-shadow-lg">
              🔍 Live Suchen
            </span>
            <span className="ml-4 md:ml-0 text-xl font-bold text-slate-700 relative drop-shadow-lg">
              ⌨️ Neueste Technologien
            </span>
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8 w-full mt-4">
            <span className="ml-4 md:ml-0 text-xl font-bold text-slate-700 relative drop-shadow-lg">
              🌴 Flüssiges Gefühl
            </span>
            <span className="ml-4 md:ml-0 text-xl font-bold text-slate-700 relative drop-shadow-lg">
              🫅🏻 Features for teachers
            </span>
            <span className="ml-4 md:ml-0 text-xl font-bold text-slate-700 relative drop-shadow-lg">
              🌚 Dark Mode
            </span>
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8 w-full md:mt-4">
            <span className="ml-4 md:ml-0 text-xl font-bold text-slate-700 relative drop-shadow-lg hidden md:block">
              📦 Behind the scenes
            </span>
            <span className="ml-4 md:ml-0 text-xl font-bold text-slate-700 relative drop-shadow-lg hidden md:block">
              🪴 Customizable
            </span>
          </div>
        </div>
        <Button className="p-5 relative before:absolute before:left-0 before:top-0 before:w-[150%] before:h-[40px] before:bg-slate-700 before:skew-x-[-30deg] overflow-hidden before:-translate-x-[110%] hover:before:-translate-x-[10%] before:transition-all before:duration-300">
          <span className="relative">Los geht&apos;s 🔥</span>
        </Button>
        <span className="absolute top-4 right-4 text-5xl text-gray-500 drop-shadow-xl">
          🔥
        </span>
      </div>
    </div>
  )
}

export default FeatureTutorial
