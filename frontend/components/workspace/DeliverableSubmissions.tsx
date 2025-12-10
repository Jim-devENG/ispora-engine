import React, { useState, useEffect } from "react";
import { workspaceAPI } from "../../src/utils/api";
import { toast } from "sonner";
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
  projectId?: string;
}

// Removed mock data - all deliverables now come from the backend API

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

export function DeliverableSubmissions({ mentee, projectId }: DeliverableSubmissionsProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch deliverables from API
  useEffect(() => {
    const fetchDeliverables = async () => {
      if (!projectId) {
        setIsLoading(false);
        setSubmissions([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        // Fetch deliverables from Supabase
        let data: any[] = [];
        try {
          const { getProjectDeliverables } = await import('../../src/utils/supabaseQueries');
          data = await getProjectDeliverables(projectId);
        } catch (supabaseError) {
          console.warn('Supabase query failed, trying legacy API:', supabaseError);
          data = await workspaceAPI.getDeliverables(projectId);
        }
        
        const transformed: Submission[] = (Array.isArray(data) ? data : []).map((d: any) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          status: d.status,
          submittedDate: new Date(d.submittedDate || d.submitted_date),
          fileName: d.fileName || d.file_name,
          fileSize: d.fileSize || d.file_size || 0,
          feedback: d.feedback,
        }));
        
        setSubmissions(transformed);
      } catch (err: any) {
        console.error('Failed to fetch deliverables:', err);
        setError(err.message || 'Failed to load deliverables');
        setSubmissions([]);
        toast.error('Failed to load deliverables');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeliverables();
  }, [projectId]);

  const formatFileSize = (bytes: number) => {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
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
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#021ff6] mx-auto mb-4"></div>
                <p className="text-gray-500">Loading deliverables...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading deliverables</h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Retry
                </Button>
              </div>
            ) : !projectId ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Project ID required</h3>
                <p className="text-gray-500">Please select a project to view deliverables</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                <p className="text-gray-500">Submissions from {mentee.name} will appear here</p>
              </div>
            ) : (
              submissions.map((submission) => {
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
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={async () => {
                              if (!projectId) {
                                toast.error('Project ID is required');
                                return;
                              }
                              try {
                                await workspaceAPI.updateDeliverable(projectId, submission.id, {
                                  status: 'needs-revision',
                                  feedback: 'Please make the requested changes and resubmit.',
                                });
                                setSubmissions(prev => prev.map(s => 
                                  s.id === submission.id 
                                    ? { ...s, status: 'needs-revision' as const, feedback: 'Please make the requested changes and resubmit.' }
                                    : s
                                ));
                                toast.success('Changes requested');
                              } catch (err: any) {
                                console.error('Failed to request changes:', err);
                                toast.error(err.message || 'Failed to request changes');
                              }
                            }}
                          >
                            Request Changes
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                            onClick={async () => {
                              if (!projectId) {
                                toast.error('Project ID is required');
                                return;
                              }
                              try {
                                await workspaceAPI.updateDeliverable(projectId, submission.id, {
                                  status: 'approved',
                                  feedback: 'Great work! This submission meets all requirements.',
                                });
                                setSubmissions(prev => prev.map(s => 
                                  s.id === submission.id 
                                    ? { ...s, status: 'approved' as const, feedback: 'Great work! This submission meets all requirements.' }
                                    : s
                                ));
                                toast.success('Deliverable approved');
                              } catch (err: any) {
                                console.error('Failed to approve:', err);
                                toast.error(err.message || 'Failed to approve deliverable');
                              }
                            }}
                          >
                            Approve
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            }))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}