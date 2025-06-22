"use client";

import React, { createContext, useContext, useState } from 'react';

const EmailContext = createContext();

export function EmailProvider({ children }) {
  const [isEmailComposerOpen, setIsEmailComposerOpen] = useState(false);
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    body: '',
    cc: '',
    bcc: '',
    attachments: []
  });

  const openEmailComposer = (data = {}) => {
    setEmailData({
      to: data.to || '',
      subject: data.subject || '',
      body: data.body || '',
      cc: data.cc || '',
      bcc: data.bcc || '',
      attachments: data.attachments || []
    });
    setIsEmailComposerOpen(true);
  };

  const closeEmailComposer = () => {
    setIsEmailComposerOpen(false);
    setEmailData({
      to: '',
      subject: '',
      body: '',
      cc: '',
      bcc: '',
      attachments: []
    });
  };

  return (
    <EmailContext.Provider
      value={{
        isEmailComposerOpen,
        emailData,
        openEmailComposer,
        closeEmailComposer
      }}
    >
      {children}
    </EmailContext.Provider>
  );
}

export function useEmail() {
  const context = useContext(EmailContext);
  if (context === undefined) {
    throw new Error('useEmail must be used within an EmailProvider');
  }
  return context;
} 