import Header from "@/components/header/header"
import Image from "next/image"

const LoginPage = () => {
  return (
    <div className="w-screen h-screen relative">
      <Image src="/imgs/asg.jpg " alt="asg" fill className="absolute -z-10" />
      <Header />
    </div>
  )
}

export default LoginPage
