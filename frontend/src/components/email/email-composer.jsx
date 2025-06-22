"use client"

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEmail } from "@/context/email-context";
import { X, Minimize2, Maximize2, Send, Paperclip, Loader2 } from "lucide-react";
import { RichTextEditor } from "./rich-text-editor";

export function EmailComposer() {
  const { isEmailComposerOpen, emailData, closeEmailComposer } = useEmail();
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [showCcBcc, setShowCcBcc] = React.useState(false);
  const [to, setTo] = React.useState(emailData.to);
  const [cc, setCc] = React.useState(emailData.cc);
  const [bcc, setBcc] = React.useState(emailData.bcc);
  const [subject, setSubject] = React.useState(emailData.subject);
  const [message, setMessage] = React.useState(emailData.body);
  const [attachments, setAttachments] = React.useState(emailData.attachments || []);
  const [isSending, setIsSending] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  React.useEffect(() => {
    if (isEmailComposerOpen) {
      setTo(emailData.to);
      setCc(emailData.cc);
      setBcc(emailData.bcc);
      setSubject(emailData.subject);
      setMessage(emailData.body);
      setAttachments(emailData.attachments || []);
    }
  }, [isEmailComposerOpen, emailData]);

  const handleSend = async () => {
    if (!to || !subject || !message) {
      return;
    }

    setIsSending(true);
    try {
      // Here you would typically call your email sending API
      console.log('Sending email:', {
        to,
        cc,
        bcc,
        subject,
        message,
        attachments
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      closeEmailComposer();
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      // Here you would typically upload files to your storage service
      // and get back URLs
      const uploadedFiles = await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file) // This is just for demo
        }))
      );

      setAttachments(prev => [...prev, ...uploadedFiles]);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isEmailComposerOpen} onOpenChange={closeEmailComposer}>
      <DialogContent className={`sm:max-w-[800px] ${isMinimized ? 'h-[200px]' : 'h-[600px]'}`}>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle>New Message</DialogTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeEmailComposer}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label className="w-16">To:</Label>
              <Input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@example.com"
                className="flex-1"
              />
            </div>
            
            {showCcBcc && (
              <>
                <div className="flex items-center space-x-2">
                  <Label className="w-16">Cc:</Label>
                  <Input
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    placeholder="cc@example.com"
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label className="w-16">Bcc:</Label>
                  <Input
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    placeholder="bcc@example.com"
                    className="flex-1"
                  />
                </div>
              </>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => setShowCcBcc(!showCcBcc)}
            >
              {showCcBcc ? 'Hide Cc/Bcc' : 'Show Cc/Bcc'}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Subject:</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject"
            />
          </div>

          <div className="flex-1 space-y-2">
            <Label>Message:</Label>
            <div className="border rounded-md">
              <RichTextEditor
                value={message}
                onChange={setMessage}
              />
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="space-y-2">
              <Label>Attachments:</Label>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 bg-secondary/20 rounded-md px-2 py-1"
                  >
                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Label
                htmlFor="file-upload"
                className="cursor-pointer"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Paperclip className="h-4 w-4 mr-2" />
                  )}
                  {isUploading ? 'Uploading...' : 'Attach Files'}
                </Button>
              </Label>
            </div>
            <Button
              onClick={handleSend}
              disabled={!to || !subject || !message || isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 