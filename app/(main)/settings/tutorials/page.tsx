import { Switch } from "@/components/ui/switch"
import { Tutorial } from "@prisma/client"

const TutorialSettings = () => {
  // read all keys in Tutorial
  const tutorials = Object.keys(Tutorial)
  const betterNamesMap = {
    [Tutorial.ABOUT]: "Über die Aktionstage",
    [Tutorial.FEATURES]: "Zu den neuen Features",
  }
  return (
    <div className="relative flex h-full w-full flex-1 items-center justify-center">
      <div className="absolute top-0 h-[30vh] w-full border-b border-zinc-300 bg-[#EDEDF3] dark:border-zinc-800 dark:bg-[#111015]"></div>
      <div className="relative flex w-full max-w-lg flex-col gap-6 rounded-xl border border-gray-200 bg-gray-50 p-6 text-sm shadow-lg shadow-slate-200 dark:border-gray-800 dark:bg-[#111015] md:rounded-xl md:p-10">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Tutorials</h1>
          <p className="text-slate-400">
            Hier kannst du alle Tutorials-states wählen und damit z.B. die
            Tutorials (💡) erneut durchklicken. Aus heißt abgeschlossen, an
            heißt noch nicht abgeschlossen.
          </p>
        </div>
        <div className="space-y-3">
          {tutorials.map((tutorial, index) => (
            <div
              key={index}
              className="flex justify-between items-center font-medium p-4 py-2 rounded-lg bg-slate-100 border border-slate-200"
            >
              {betterNamesMap[tutorial as Tutorial] || tutorial}
              <Switch />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TutorialSettings
