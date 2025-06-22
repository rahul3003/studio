"use client"

import * as React from "react"
import { EmailComposer } from "@/components/email/email-composer"

const EmailContext = React.createContext({
  openEmailComposer: () => {},
})

export function EmailProvider({ children }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [emailData, setEmailData] = React.useState({
    to: "",
    subject: "",
    body: "",
  })

  const openEmailComposer = React.useCallback(({ to = "", subject = "", body = "" } = {}) => {
    setEmailData({ to, subject, body })
    setIsOpen(true)
  }, [])

  const closeEmailComposer = React.useCallback(() => {
    setIsOpen(false)
    setEmailData({ to: "", subject: "", body: "" })
  }, [])

  return (
    <EmailContext.Provider value={{ openEmailComposer }}>
      {children}
      <EmailComposer
        isOpen={isOpen}
        onClose={closeEmailComposer}
        defaultTo={emailData.to}
        defaultSubject={emailData.subject}
        defaultBody={emailData.body}
      />
    </EmailContext.Provider>
  )
}

export const useEmail = () => {
  const context = React.useContext(EmailContext)
  if (!context) {
    throw new Error("useEmail must be used within an EmailProvider")
  }
  return context
} 