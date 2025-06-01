"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, BriefcaseBusiness, MapPin, CalendarDays, Users2 as Users2Icon, Share2, Mail, Link2, Twitter, Linkedin, MessageCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "../../hooks/use-toast";

export function JobCard({ job, onEdit, onDelete, onViewDetails, onViewApplicants }) {
  const { toast } = useToast();

  const handleShare = async (method) => {
    const jobUrl = window.location.origin + `/jobs/${job.id}`;
    const companyName = "PESU Venture Labs";
    const jobType = job.type.replace(/_/g, ' ').toLowerCase();
    const department = typeof job.department === 'object' ? job.department.name : job.department;
    
    // Create a rich job description for sharing
    const jobDescription = `${job.title}\n\n` +
      `📍 Location: ${job.location}\n` +
      `💼 Department: ${department}\n` +
      `⏰ Type: ${jobType}\n` +
      `🏢 Company: ${companyName}\n\n` +
      `Apply now: ${jobUrl}`;

    try {
      switch (method) {
        case 'copy':
          await navigator.clipboard.writeText(jobDescription);
          toast({
            title: "Job Details Copied",
            description: "Job information has been copied to clipboard.",
          });
          break;

        case 'email':
          const emailSubject = encodeURIComponent(`Job Opening: ${job.title} at ${companyName}`);
          const emailBody = encodeURIComponent(
            `Hello,\n\nI found this interesting job opening that might interest you:\n\n${jobDescription}\n\n` +
            `Best regards,\n[Your Name]`
          );
          window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`;
          break;

        case 'whatsapp':
          const whatsappText = encodeURIComponent(
            `Hey! Check out this job opening:\n\n${jobDescription}`
          );
          window.open(`https://wa.me/?text=${whatsappText}`);
          break;

        case 'twitter':
          const tweetText = encodeURIComponent(
            `🚀 New Job Opening at ${companyName}!\n\n` +
            `📌 ${job.title}\n` +
            `📍 ${job.location}\n` +
            `💼 ${department}\n\n` +
            `Apply now: ${jobUrl}\n\n` +
            `#JobOpening #Hiring #${department.replace(/\s+/g, '')} #${companyName.replace(/\s+/g, '')}`
          );
          window.open(`https://twitter.com/intent/tweet?text=${tweetText}`);
          break;

        case 'linkedin':
          const linkedinText = encodeURIComponent(
            `New Job Opening at ${companyName}!\n\n` +
            `Position: ${job.title}\n` +
            `Location: ${job.location}\n` +
            `Department: ${department}\n` +
            `Type: ${jobType}\n\n` +
            `Apply now: ${jobUrl}`
          );
          const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}&summary=${linkedinText}`;
          window.open(linkedinUrl);
          break;

        default:
          break;
      }
    } catch (error) {
      toast({
        title: "Share Error",
        description: "Failed to share the job posting. Please try again.",
        variant: "destructive",
      });
    }
  };

  const statusVariantMap = {
    Open: "default",
    Closed: "secondary",
    Filled: "outline",
    Draft: "secondary",
  };

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-1">{job.title}</CardTitle>
        <CardDescription className="text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <BriefcaseBusiness className="h-3.5 w-3.5" /> 
                {typeof job.department === 'object' ? job.department.name : job.department}
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <MapPin className="h-3.5 w-3.5" /> {job.location} | {job.type}
          </div>
           <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <CalendarDays className="h-3.5 w-3.5" /> Posted: {new Date(job.postedDate).toLocaleDateString()}
          </div>
        </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
                <span className="sr-only">Share job</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem key="copy" onClick={() => handleShare('copy')}>
                <Link2 className="mr-2 h-4 w-4" />
                Copy Details
              </DropdownMenuItem>
              <DropdownMenuItem key="email" onClick={() => handleShare('email')}>
                <Mail className="mr-2 h-4 w-4" />
                Share via Email
              </DropdownMenuItem>
              <DropdownMenuItem key="whatsapp" onClick={() => handleShare('whatsapp')}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Share on WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem key="twitter" onClick={() => handleShare('twitter')}>
                <Twitter className="mr-2 h-4 w-4" />
                Share on Twitter
              </DropdownMenuItem>
              <DropdownMenuItem key="linkedin" onClick={() => handleShare('linkedin')}>
                <Linkedin className="mr-2 h-4 w-4" />
                Share on LinkedIn
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {job.description}
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-end gap-2 pt-4 mt-auto border-t">
        <Button variant="outline" size="sm" onClick={() => onViewDetails(job)} className="text-primary hover:bg-primary/10">
          <Eye className="mr-1 h-4 w-4" /> Details
        </Button>
        <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewApplicants(job)} 
            className="text-green-600 hover:text-green-700 hover:bg-green-500/10 border-green-500 dark:text-green-400 dark:hover:text-green-300 dark:border-green-600 dark:hover:bg-green-500/20"
        >
          <Users2Icon className="mr-1 h-4 w-4" /> Applicants
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(job)}>
          <Edit className="mr-1 h-4 w-4" /> Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(job)} className="hover:bg-destructive/90">
          <Trash2 className="mr-1 h-4 w-4" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
