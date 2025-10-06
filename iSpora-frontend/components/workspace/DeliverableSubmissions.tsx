import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ispora-backend.onrender.com/api';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  'needs-revision': 'bg-red-100 text-red-800',
};

const statusIcons = {
  pending: Clock,
  approved: CheckCircle,
  'needs-revision': AlertCircle,
};

export function DeliverableSubmissions({ mentee }: DeliverableSubmissionsProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const devKey = localStorage.getItem('devKey');
        const token = localStorage.getItem('token');
        if (devKey) headers['X-Dev-Key'] = devKey;
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${API_BASE_URL}/deliverables`, {
          headers,
          signal: controller.signal,
        });
        const json = await res.json();
        const rows = Array.isArray(json.data) ? json.data : [];
        const mapped: Submission[] = rows.map((r: any) => ({
          id: r.id,
          title: r.title,
          description: r.description || '',
          status: r.status || 'pending',
          submittedDate: r.submitted_at
            ? new Date(r.submitted_at)
            : new Date(r.created_at || Date.now()),
          fileName: 'file',
          fileSize: 0,
          feedback: r.feedback || undefined,
        }));
        setSubmissions(mapped);
      } catch (e) {
        setError('Failed to load deliverables');
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 30000);
    return () => {
      controller.abort();
      clearInterval(id);
    };
  }, []);

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
            {!loading && submissions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>No deliverables yet</p>
              </div>
            )}
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
