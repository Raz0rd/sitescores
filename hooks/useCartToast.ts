"use client"

import { useState } from 'react'

export function useCartToast() {
  const [showToast, setShowToast] = useState(false)
  const [itemName, setItemName] = useState('')

  const showCartToast = (name: string) => {
    setItemName(name)
    setShowToast(true)
  }

  const hideToast = () => {
    setShowToast(false)
  }

  return {
    showToast,
    itemName,
    showCartToast,
    hideToast
  }
}
