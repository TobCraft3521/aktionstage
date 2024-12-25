"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ChevronRight, Smile } from "lucide-react" // Chevron and Smile icon import
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import Picker from "@emoji-mart/react"
import data from "@emoji-mart/data"
import { useTheme } from "next-themes"
import { suggestEmoji } from "@/lib/actions/ai/emoji-sug"

// Define the form schema
const schema = z.object({
  name: z.string().min(1, "Kein Name angegeben"),
  description: z
    .string()
    .min(1, "Beschreibung muss mindestens 10 Zeichen haben"),
  emoji: z.string().min(1, "Emoji ist erforderlich"),
  teachers: z.string().optional(),
  students: z.number().min(1, "Mindestens 1 Schüler ist erforderlich"),
  location: z.string().min(1, "Ort ist erforderlich"),
  price: z.number().min(0, "Preis muss 0 oder mehr sein"),
  time: z.string().min(1, "Zeit ist erforderlich"),
  date: z.string().min(1, "Datum ist erforderlich"),
  image: z.string().min(1, "Bild-URL ist erforderlich"),
})

type FormData = z.infer<typeof schema>

const MultiStepForm = () => {
  const [step, setStep] = useState(0)
  const [validPages, setValidPages] = useState<boolean[]>(
    new Array(5).fill(false)
  ) // Track valid pages

  const steps: { label: string; fields: (keyof FormData)[] }[] = [
    { label: "Titel", fields: ["name"] },
    { label: "Details", fields: ["description", "image"] },
    { label: "Emoji", fields: ["emoji"] },
    { label: "Lehrer", fields: ["teachers"] },
    {
      label: "Daten",
      fields: ["students", "location", "price", "time", "date"],
    },
  ]

  // Dynamically handle forms for each step
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    control,
    trigger,
    getValues,
    setValue,
    watch,
    clearErrors,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
  })

  // Handle Next button click
  const handleNext = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const isValidStep = await trigger(steps[step].fields) // Validate current step fields
    if (step === 0) {
      // Auto suggest emoji
      setTimeout(async () => {
        try {
          setValue("emoji", "⌛") // Clear the emoji field
          const suggestedEmoji = (await suggestEmoji(getValues("name") || ""))
            .emoji
          setValue("emoji", suggestedEmoji)
        } catch (error) {
          console.error("Failed to suggest emoji:", error)
        }
      }, 1)
    }
    if (isValidStep) {
      const updatedValidPages = [...validPages]
      updatedValidPages[step] = true // Mark the current page as valid
      setValidPages(updatedValidPages)
      setStep((prev) => Math.min(prev + 1, steps.length - 1))
    }
  }

  // Handle Previous button click
  const handlePrev = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setStep((prev) => Math.max(prev - 1, 0))
  }

  // Handle clicking step titles to navigate
  const handleStepClick = (index: number) => {
    if (validPages[index]) {
      setStep(index) // You can navigate to any valid step now
    }
  }

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data)
    alert("Form submitted! Check the console.")
  }

  const handleEmojiSelect = (emoji: string) => {
    setValue("emoji", emoji) // Update the form value for the emoji field
    const updatedValidPages = [...validPages]
    updatedValidPages[1] = true // Mark the emoji step as valid
    setValidPages(updatedValidPages)
  }

  // Watch for form changes to keep the button disabled state correct
  const isCurrentStepValid = () => {
    const name = getValues("name") || "" // Default to empty string
    const description = getValues("description") || "" // Default to empty string
    const emoji = getValues("emoji") || "" // Default to empty string
    const students = getValues("students") || 0
    const location = getValues("location") || "" // Default to empty string
    const time = getValues("time") || "" // Default to empty string
    const date = getValues("date") || "" // Default to empty string
    const price = getValues("price") >= 0 ? getValues("price") : 0 // Ensure price is valid
    const image = getValues("image") || "" // Default to empty string

    if (step === 0) {
      return name.length > 0
    }
    if (step === 1) {
      return description.length > 0 && image.length > 0
    }
    if (step === 2) {
      return emoji.length > 0
    }
    if (step === 3) {
      return true // No othe teachers required
    }
    if (step === 4) {
      return true // Banner step has no validation logic
    }
    return false
  }

  // Watch for form changes to keep the button disabled state correct
  const currentStepErrors = watch(steps[step].fields)

  const emoji = watch("emoji")

  return (
    <div className="max-w-3xl mx-auto mt-10 p-5">
      <h1 className="text-xl font-bold mb-4">Projekt erstellen</h1>

      {/* Progress Bar */}
      <div className="mb-6">
        <Progress value={(step / (steps.length - 1)) * 100} />
      </div>

      {/* Step Titles */}
      <div className="flex justify-between text-sm mb-8">
        {steps.map((stepObj, index) => (
          <button
            key={index}
            className={`text-xs ${
              index === step ? "font-bold underline" : "text-gray-500"
            }`}
            onClick={() => handleStepClick(index)}
          >
            {stepObj.label}
          </button>
        ))}
      </div>

      {/* Form Fields for the Current Step */}
      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Name des Projekts</h2>
            <Input
              placeholder="Benenne dein Projekt"
              {...register("name")}
              className="mb-2"
            />
            {errors.name && (
              <p className="text-red-500">{errors.name.message}</p>
            )}
          </div>
        )}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold mt-4 mb-2">
              Projekt Beschreibung
            </h2>
            <Textarea
              placeholder="Description"
              {...register("description")}
              className="mb-2"
            />
            {errors.description && (
              <p className="text-red-500">{errors.description.message}</p>
            )}

            <h2 className="text-lg font-semibold mb-2">Upload Banner</h2>
            <Input placeholder="Image URL" {...register("image")} />
            {errors.image && (
              <p className="text-red-500">{errors.image.message}</p>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Select Emoji</h2>
            <p className="text-gray-500">
              Wait for the ai the suggest an emoji
            </p>
            <div className="relative flex justify-center items-center mb-4">
              <Popover>
                <PopoverTrigger>
                  <div className="cursor-pointer border-2 rounded-xl p-4 flex items-center justify-center bg-gray-100">
                    <span className="text-3xl">{emoji || "⌛"}</span>
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  side="bottom"
                  sideOffset={40}
                  className="bg-transparent border-none shadow-none drop-shadow-none mb-16"
                >
                  <Picker
                    data={data}
                    onEmojiSelect={(emoji: any) =>
                      handleEmojiSelect(emoji.native)
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
            {errors.emoji && (
              <p className="text-red-500">{errors.emoji.message}</p>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold mt-4 mb-2">
              Lehrer Hinzufügen
            </h2>
            <Input
              placeholder="Teachers"
              type="text"
              {...register("teachers")}
              className="mb-2"
            />
            {errors.teachers && (
              <p className="text-red-500">{errors.teachers.message}</p>
            )}
            {/* 
            <h2 className="text-lg font-semibold mt-4 mb-2">Students</h2>
            <Input
              placeholder="Number of Students"
              type="number"
              {...register("students", { valueAsNumber: true })}
              className="mb-2"
            />
            {errors.students && (
              <p className="text-red-500">{errors.students.message}</p>
            )}

            <h2 className="text-lg font-semibold mt-4 mb-2">Location</h2>
            <Input
              placeholder="Location"
              {...register("location")}
              className="mb-2"
            />
            {errors.location && (
              <p className="text-red-500">{errors.location.message}</p>
            )} */}
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Time</h2>
            <Input placeholder="Time" {...register("time")} className="mb-2" />
            {errors.time && (
              <p className="text-red-500">{errors.time.message}</p>
            )}

            <h2 className="text-lg font-semibold mt-4 mb-2">Date</h2>
            <Input
              placeholder="Date"
              type="date"
              {...register("date")}
              className="mb-2"
            />
            {errors.date && (
              <p className="text-red-500">{errors.date.message}</p>
            )}

            <h2 className="text-lg font-semibold mt-4 mb-2">Price</h2>
            <Input
              placeholder="Price"
              type="number"
              {...register("price", { valueAsNumber: true })}
              className="mb-2"
            />
            {errors.price && (
              <p className="text-red-500">{errors.price.message}</p>
            )}
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Image URL</h2>
            <Input
              placeholder="Image URL"
              {...register("image")}
              className="mb-2"
            />
            {errors.image && (
              <p className="text-red-500">{errors.image.message}</p>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {step > 0 ? (
            <Button onClick={handlePrev} variant="secondary" type="button">
              Previous
            </Button>
          ) : (
            <div />
          )}

          {step === steps.length - 1 ? (
            <Button type="submit" disabled={!isValid}>
              Submit
            </Button>
          ) : (
            <Button
              disabled={!isCurrentStepValid()}
              onClick={handleNext}
              type="button"
            >
              Next
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

export default MultiStepForm
