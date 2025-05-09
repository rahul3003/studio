
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OfferLetterForm } from "@/components/document/offer-letter-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateOfferLetter } from "@/ai/flows/generate-offer-letter-flow";
import { Loader2, FileText, Copy } from "lucide-react";

export default function DocumentsPage() {
  const { toast } = useToast();
  const [generatedLetter, setGeneratedLetter] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("offer-letter");

  const handleOfferLetterSubmit = async (data) => {
    setIsLoading(true);
    setGeneratedLetter("");
    try {
      const result = await generateOfferLetter(data);
      if (result && result.offerLetterText) {
        setGeneratedLetter(result.offerLetterText);
        toast({
          title: "Offer Letter Generated",
          description: "The offer letter has been successfully generated.",
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
      setGeneratedLetter("Error: Could not generate document.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter)
      .then(() => {
        toast({ title: "Copied to Clipboard", description: "Offer letter text copied." });
      })
      .catch(err => {
        toast({ title: "Copy Failed", description: "Could not copy text.", variant: "destructive" });
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
              {/* Add more TabsTriggers for other document types later */}
            </TabsList>
            
            <TabsContent value="offer-letter" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Generate Offer Letter</h3>
                  <OfferLetterForm onSubmit={handleOfferLetterSubmit} isLoading={isLoading} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Generated Document</h3>
                  {isLoading && (
                    <div className="flex items-center justify-center h-60 border rounded-md bg-muted/30">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="ml-2 text-muted-foreground">Generating...</p>
                    </div>
                  )}
                  {!isLoading && generatedLetter && (
                    <div className="space-y-3">
                       <Textarea
                        value={generatedLetter}
                        readOnly
                        className="min-h-[300px] max-h-[60vh] text-sm bg-muted/20 p-4 border rounded-md focus-visible:ring-primary"
                        rows={15}
                      />
                      <Button onClick={handleCopyToClipboard} variant="outline" size="sm">
                        <Copy className="mr-2 h-4 w-4" />
                        Copy to Clipboard
                      </Button>
                    </div>
                  )}
                  {!isLoading && !generatedLetter && (
                    <div className="flex items-center justify-center h-60 border-2 border-dashed rounded-md bg-muted/20">
                      <p className="text-muted-foreground">Fill the form to generate an offer letter.</p>
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
            {/* Add more TabsContent for other document types later */}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
