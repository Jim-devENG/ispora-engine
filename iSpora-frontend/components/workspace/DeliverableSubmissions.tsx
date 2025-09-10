import React, { useState } from "react";
import { FileText, Upload, Download, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";

interface Submission {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'needs-revision';
  submittedDate: Date;
  fileName: string;
  fileSize: number;
  feedback?: string;
}

interface Mentee {
  id: string;
  name: string;
  avatar?: string;
}

interface DeliverableSubmissionsProps {
  mentee: Mentee;
}

const mockSubmissions: Submission[] = [
  {
    id: "1",
    title: "Machine Learning Project Report",
    description: "Final report for the classification project including methodology and results",
    status: 'approved',
    submittedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    fileName: "ml_project_report.pdf",
    fileSize: 2456789,
    feedback: "Excellent work! Your methodology is sound and results are well-presented."
  },
  {
    id: "2", 
    title: "Portfolio Website",
    description: "Personal portfolio showcasing recent projects and skills",
    status: 'needs-revision',
    submittedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    fileName: "portfolio_link.txt",
    fileSize: 156,
    feedback: "Great start! Please add more detailed project descriptions and improve the visual design."
  }
];

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  'needs-revision': "bg-red-100 text-red-800"
};

const statusIcons = {
  pending: Clock,
  approved: CheckCircle,
  'needs-revision': AlertCircle
};

export function DeliverableSubmissions({ mentee }: DeliverableSubmissionsProps) {
  const [submissions] = useState<Submission[]>(mockSubmissions);

  const formatFileSize = (bytes: number) => {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col bg-gray-50">
      <div className="flex-shrink-0 p-6 border-b bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Deliverables & Submissions</h3>
            <p className="text-gray-600">Review submissions from {mentee.name}</p>
          </div>
          <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
            <Upload className="h-4 w-4 mr-2" />
            Request Submission
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-4">
            {submissions.map((submission) => {
              const StatusIcon = statusIcons[submission.status];
              
              return (
                <Card key={submission.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{submission.title}</CardTitle>
                        <p className="text-gray-600 mt-1">{submission.description}</p>
                      </div>
                      <Badge className={statusColors[submission.status]}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {submission.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{submission.fileName}</span>
                      </div>
                      <span>{formatFileSize(submission.fileSize)}</span>
                      <span>Submitted {submission.submittedDate.toLocaleDateString()}</span>
                    </div>

                    {submission.feedback && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h5 className="font-medium text-sm mb-1">Feedback</h5>
                        <p className="text-sm text-gray-700">{submission.feedback}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      {submission.status === 'pending' && (
                        <>
                          <Button size="sm" variant="outline">
                            Request Changes
                          </Button>
                          <Button size="sm" className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                            Approve
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
