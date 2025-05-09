
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OfferLetterForm } from "@/components/document/offer-letter-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateOfferLetter } from "@/ai/flows/generate-offer-letter-flow";
import { Loader2, FileText, Copy, Download, Mail } from "lucide-react";

export default function DocumentsPage() {
  const { toast } = useToast();
  const [generatedLetterHtml, setGeneratedLetterHtml] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("offer-letter");

  const handleOfferLetterSubmit = async (data) => {
    setIsLoading(true);
    setGeneratedLetterHtml("");
    try {
      const result = await generateOfferLetter(data);
      if (result && result.offerLetterText) {
        setGeneratedLetterHtml(result.offerLetterText);
        toast({
          title: "Offer Letter Generated",
          description: "The offer letter has been successfully generated as HTML.",
        });
      } else {
        throw new Error("No content received from AI.");
      }
    } catch (error) {
      console.error("Error generating offer letter:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Could not generate the offer letter. Please try again.",
        variant: "destructive",
      });
      setGeneratedLetterHtml("<p>Error: Could not generate document. Please check the console for details.</p>");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!generatedLetterHtml) return;
    navigator.clipboard.writeText(generatedLetterHtml)
      .then(() => {
        toast({ title: "Copied to Clipboard", description: "Offer letter HTML copied." });
      })
      .catch(err => {
        toast({ title: "Copy Failed", description: "Could not copy HTML.", variant: "destructive" });
      });
  };

  const handleDownloadPdf = () => {
    toast({
      title: "Feature Not Implemented",
      description: "PDF download functionality is coming soon!",
      variant: "default",
    });
  };

  const handleEmailToCandidate = () => {
     toast({
      title: "Feature Not Implemented",
      description: "Emailing functionality is coming soon!",
      variant: "default",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Document Generation</CardTitle>
          </div>
          <CardDescription>
            Generate various HR and office-related documents using AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
              <TabsTrigger value="offer-letter">Offer Letter</TabsTrigger>
              <TabsTrigger value="contract" disabled>Employment Contract (Soon)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="offer-letter" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <h3 className="text-xl font-semibold mb-4">Generate Offer Letter</h3>
                  <OfferLetterForm onSubmit={handleOfferLetterSubmit} isLoading={isLoading} />
                </div>
                <div className="lg:col-span-2">
                  <h3 className="text-xl font-semibold mb-4">Generated Document Preview</h3>
                  {isLoading && (
                    <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)] min-h-[400px] border rounded-md bg-muted/30">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      <p className="ml-2 mt-4 text-lg text-muted-foreground">Generating your document...</p>
                      <p className="text-sm text-muted-foreground">This may take a few moments.</p>
                    </div>
                  )}
                  {!isLoading && generatedLetterHtml && (
                    <div className="space-y-3">
                      <div 
                        className="p-6 border rounded-md bg-white shadow-sm overflow-auto max-h-[70vh] min-h-[400px] prose prose-sm max-w-none dark:bg-slate-900 dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: generatedLetterHtml }}
                      />
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button onClick={handleCopyToClipboard} variant="outline" size="sm" disabled={!generatedLetterHtml || isLoading}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy HTML
                        </Button>
                        <Button onClick={handleDownloadPdf} variant="outline" size="sm" disabled={!generatedLetterHtml || isLoading}>
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </Button>
                        <Button onClick={handleEmailToCandidate} variant="outline" size="sm" disabled={!generatedLetterHtml || isLoading}>
                          <Mail className="mr-2 h-4 w-4" />
                          Email to Candidate
                        </Button>
                      </div>
                    </div>
                  )}
                  {!isLoading && !generatedLetterHtml && (
                    <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)] min-h-[400px] border-2 border-dashed rounded-md bg-muted/20">
                      <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
                      <p className="text-lg text-muted-foreground">Your generated document will appear here.</p>
                      <p className="text-sm text-muted-foreground">Fill out the form on the left to begin.</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contract">
              <div className="flex items-center justify-center h-60 border-2 border-dashed rounded-md bg-muted/20">
                <p className="text-muted-foreground">Employment Contract generation is coming soon!</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
