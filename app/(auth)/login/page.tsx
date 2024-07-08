import Header from "@/components/header/header"
import LoginForm from "@/components/login/login-form"
import { auth } from "@/lib/auth/auth"
import Image from "next/image"
import { redirect } from "next/navigation"

const LoginPage = async () => {
  const user = (await auth())?.user
  if (user) return redirect("/projects")
  return (
    <div className="w-screen h-screen relative">
      <div className="absolute w-screen h-screen">
        <Image
          src="/imgs/asg.jpg "
          alt="asg"
          width={3599}
          height={1928}
          className="hidden -z-10 object-cover pointer-events-none w-full h-full md:block"
        />
      </div>
      <div className="w-full h-32">
        <Image
          src="/imgs/asg-mobile.jpg "
          alt="asg"
          width={3599}
          height={903}
          className="-z-10 block md:hidden w-full h-full object-cover"
        />
      </div>
      <div className="absolute top-0">
        <Header variant="login" />
      </div>
      <div className="md:absolute top-16 right-0 w-full md:w-[700px] drop-shadow-2xl bg-white h-screen md:top-0">
        <LoginForm />
      </div>
    </div>
  )
}

export default LoginPage
