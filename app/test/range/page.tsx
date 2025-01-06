"use client"
import React, { useState } from "react"
import RangeSlider from "react-range-slider-input"
import "react-range-slider-input/dist/style.css"
import "./styles.css"

const RangeSliderPage: React.FC = () => {
  return (
    <div className="w-full max-w-3xl mx-auto h-screen flex items-center justify-center">
      <RangeSlider min={5} max={11} step={1} defaultValue={[5,11]} id="rangeSlider"/>
    </div>
  )
}

export default RangeSliderPage
