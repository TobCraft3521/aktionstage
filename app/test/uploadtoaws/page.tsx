"use client"
import { CreateOrgFormSchema } from "@/lib/types"
import { z } from "zod"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { useState } from "react"
import { Loader, UmbrellaOff, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getPresignedUploadURL } from "@/lib/actions/aws/upload"
import { error } from "console"
import { useRouter } from "next/navigation"
import Compressor from "compressorjs"

const Upload = () => {
  const [submitError, setSubmitError] = useState<string>("")
  const router = useRouter()
  const form = useForm<z.infer<typeof CreateOrgFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(CreateOrgFormSchema),
    defaultValues: {
      img: undefined,
    },
  })
  const isLoading = form.formState.isSubmitting
  const onSubmit: SubmitHandler<z.infer<typeof CreateOrgFormSchema>> = async (
    formData
  ) => {
    new Compressor(formData.img[0], {
      quality: 0.6,
      async success(img) {
        const { url, error, futurePublicURL } = await getPresignedUploadURL(
          img.type
        )
        if (error || !url) return setSubmitError("Failed to get presigned URL")

        // !!! change cors origin on aws on production
        const data = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": img.type,
          },
          body: img,
        })
        console.log(futurePublicURL)
        router.push(futurePublicURL)
      },
      error(err) {
        console.log(err.message)
      },
    })
  }
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Form {...form}>
        <form
          onChange={() => {
            if (submitError) setSubmitError("")
          }}
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col space-y-4 sm:w-[400px] sm:justify-center"
        >
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <UmbrellaOff />
            Create an organization
          </h1>

          <FormField
            disabled={isLoading}
            control={form.control}
            name="img"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <>
                    <label
                      className="mb-2 block text-sm font-medium tracking-wide text-gray-900 dark:text-zinc-400"
                      htmlFor="img"
                    >
                      Image
                    </label>
                    <Input
                      type="file"
                      accept="image/*"
                      placeholder="image"
                      {...form.register("img", {
                        required: "Please select an image",
                      })}
                    />
                  </>
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
            {!isLoading ? "Create" : <Loader />}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default Upload
