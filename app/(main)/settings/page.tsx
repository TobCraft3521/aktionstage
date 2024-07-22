import Header from "@/components/header/header"

const Settings = () => {
  return (
    <div className="flex flex-col h-screen">
      <Header variant="main" />
      <div className="flex flex-1">
        <div className="block">
          <div className="w-[260px] h-full bg-black"></div>
        </div>
        <div className="flex-1 bg-green-100"></div>
      </div>
    </div>
  )
}

export default Settings
