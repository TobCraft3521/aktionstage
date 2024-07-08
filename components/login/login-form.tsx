"use client"

import { LoginFormSchema } from "@/lib/form-schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import Loader from "../global/loader"

const LoginForm = () => {
  const router = useRouter()
  const [submitError, setSubmitError] = useState("")

  const form = useForm<z.infer<typeof LoginFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      name: "",
      password: "",
    },
  })

  const isLoading = form.formState.isSubmitting
  const onSubmit: SubmitHandler<z.infer<typeof LoginFormSchema>> = async (
    formData
  ) => {
    const response = await signIn("credentials", {
      username: formData.name,
      password: formData.password,
      redirect: false,
    })

    if (response?.ok) {
      router.push("/projects")
    } else {
      setSubmitError("Falscher Benutzername oder Passwort 😒")
    }
  }

  return (
    <div className="w-full h-full flex justify-center items-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onChange={() => setSubmitError("")}
          className="w-[400px] space-y-6"
        >
          <div className="">
            <h1 className="text-2xl font-bold">Endlich Aktionstage 🙌</h1>
            <FormDescription>Hier kannst du dich einloggen</FormDescription>
          </div>

          <FormField
            disabled={isLoading}
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="text" placeholder="Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            disabled={isLoading}
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="password" placeholder="Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {submitError && <FormMessage>{submitError}</FormMessage>}
          <Button
            type="submit"
            className="w-full p-6"
            size="lg"
            disabled={isLoading}
          >
            {!isLoading ? "Login" : <Loader />}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default LoginForm
