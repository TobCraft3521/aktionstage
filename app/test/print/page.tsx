"use client"
import { useReactToPrint } from "react-to-print"
import React, { useRef } from "react"

const CustomComponent = React.forwardRef<HTMLDivElement, {}>((props, ref) => {
  return (
    <div ref={ref} className="w-screen h-screen bg-slate-300">
      Content to print
    </div>
  )
})
CustomComponent.displayName = "CustomComponent"

const PrintPage = () => {
  const contentRef = useRef<HTMLDivElement>(null)
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: "Print Page Title",
  })

  return (
    <div>
      <div className="hidden">
        <CustomComponent ref={contentRef} />
      </div>
      <button onClick={() => reactToPrintFn()}>Print</button>
      <div className="">Content to print (preview)</div>
    </div>
  )
}

export default PrintPage
