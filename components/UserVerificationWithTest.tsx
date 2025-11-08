'use client'

import UserVerification from './UserVerification'
import GoogleConversionTest from './GoogleConversionTest'

interface UserVerificationProps {
  onVerificationComplete: () => void
}

export default function UserVerificationWithTest({ onVerificationComplete }: UserVerificationProps) {
  return (
    <>
      <GoogleConversionTest />
      <UserVerification onVerificationComplete={onVerificationComplete} />
    </>
  )
}
