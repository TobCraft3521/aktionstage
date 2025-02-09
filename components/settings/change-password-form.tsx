"use client"
import { ChangePasswordSchema } from "@/lib/form-schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Loader2 } from "lucide-react"
import Loader from "../global/loader"
import { changePassword } from "@/lib/actions/updates/password"
import { confetti } from "@tsparticles/confetti"
import "./particles.css"

type Props = {}

const ChangePasswordForm = (props: Props) => {
  const [submitError, setSubmitError] = useState("")
  const [success, setSuccess] = useState(false)

  const form = useForm<z.infer<typeof ChangePasswordSchema>>({
    mode: "onChange",
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      newPasswordRepeat: "",
    },
  })

  const formInputs: {
    label: string
    name: "oldPassword" | "newPassword" | "newPasswordRepeat"
    placeholder: string
    type: string
  }[] = [
    {
      label: "Altes Passwort",
      name: "oldPassword",
      placeholder: "Altes Passwort",
      type: "password",
    },
    {
      label: "Neues Passwort",
      name: "newPassword",
      placeholder: "Neues Passwort",
      type: "password",
    },
    {
      label: "Neues Passwort wiederholen",
      name: "newPasswordRepeat",
      placeholder: "Neues Passwort wiederholen",
      type: "password",
    },
  ]

  const isLoading = form.formState.isSubmitting
  const onSubmit: SubmitHandler<z.infer<typeof ChangePasswordSchema>> = async (
    formData
  ) => {
    const { error } = await changePassword(
      formData.oldPassword,
      formData.newPassword
    )
    if (error) {
      setSubmitError(error)
    } else {
      form.reset()
      setSubmitError("")
      setSuccess(true)
    }
  }

  if (success) {
    const end = Date.now() + 500
    const colors = ["#40ff00", "#caff38"]
    setTimeout(async function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 75,
        origin: { x: 0.1 },
        colors: colors,
      })

      confetti({
        particleCount: 2,
        angle: 120,
        spread: 75,
        origin: { x: 0.9 },
        colors: colors,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      } else {
      }
    }, 200)
    return (
      <div className="text-green-500">
        Dein Passwort wurde erfolgreich geändert. 🎉
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {formInputs.map((input, i) => (
          <FormField
            key={i}
            control={form.control}
            name={input.name}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    type={input.type}
                    placeholder={input.placeholder}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        {submitError && <FormMessage>{submitError}</FormMessage>}
        <Button type="submit" disabled={isLoading} size={"lg"}>
          {!isLoading ? "Bestätigen" : <Loader />}
        </Button>
      </form>
    </Form>
  )
}

export default ChangePasswordForm
