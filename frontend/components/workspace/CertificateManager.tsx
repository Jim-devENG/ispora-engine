import React, { useState, useEffect } from "react";
import { workspaceAPI } from "../../src/utils/api";
import { toast } from "sonner";
import { Award, Download, Eye, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { ScrollArea } from "../ui/scroll-area";

interface Certificate {
  id: string;
  title: string;
  type: 'completion' | 'achievement' | 'milestone';
  status: 'draft' | 'ready' | 'issued';
  progress: number;
  requiredSessions: number;
  completedSessions: number;
  requiredTasks: number;
  completedTasks: number;
  issueDate?: Date;
}

interface Mentee {
  id: string;
  name: string;
  avatar?: string;
}

interface CertificateManagerProps {
  mentee: Mentee;
  projectId?: string;
}

// Removed mock data - all certificates now come from the backend API

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  ready: "bg-green-100 text-green-800",
  issued: "bg-blue-100 text-blue-800"
};

export function CertificateManager({ mentee, projectId }: CertificateManagerProps) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch certificates from API
  useEffect(() => {
    const fetchCertificates = async () => {
      if (!projectId) {
        setIsLoading(false);
        setCertificates([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        // Fetch certificates from Supabase
        let data: any[] = [];
        try {
          const { getProjectCertificates } = await import('../../src/utils/supabaseQueries');
          data = await getProjectCertificates(projectId);
        } catch (supabaseError) {
          console.warn('Supabase query failed, trying legacy API:', supabaseError);
          data = await workspaceAPI.getCertificates(projectId);
        }
        
        const transformed: Certificate[] = data.map((c: any) => {
          // Calculate progress based on sessions and tasks
          const sessionProgress = c.requiredSessions > 0 
            ? (c.completedSessions / c.requiredSessions) * 50 
            : 0;
          const taskProgress = c.requiredTasks > 0 
            ? (c.completedTasks / c.requiredTasks) * 50 
            : 0;
          const totalProgress = Math.min(100, Math.round(sessionProgress + taskProgress));
          
          return {
            id: c.id,
            title: c.title,
            type: c.type,
            status: c.status,
            progress: totalProgress,
            requiredSessions: c.requiredSessions || 0,
            completedSessions: c.completedSessions || 0,
            requiredTasks: c.requiredTasks || 0,
            completedTasks: c.completedTasks || 0,
            issueDate: c.issueDate ? new Date(c.issueDate) : undefined,
          };
        });
        
        setCertificates(transformed);
      } catch (err: any) {
        console.error('Failed to fetch certificates:', err);
        setError(err.message || 'Failed to load certificates');
        setCertificates([]);
        toast.error('Failed to load certificates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificates();
  }, [projectId]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="flex-shrink-0 p-6 border-b bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Certificate Manager</h3>
            <p className="text-gray-600">Track and issue certificates for {mentee.name}</p>
          </div>
          <Button 
            className="bg-[#021ff6] hover:bg-[#021ff6]/90"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Certificate
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#021ff6] mx-auto mb-4"></div>
                <p className="text-gray-500">Loading certificates...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-red-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading certificates</h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Retry
                </Button>
              </div>
            ) : !projectId ? (
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Project ID required</h3>
                <p className="text-gray-500">Please select a project to view certificates</p>
              </div>
            ) : certificates.length === 0 ? (
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
                <p className="text-gray-500">Certificates for {mentee.name} will appear here</p>
              </div>
            ) : (
              certificates.map((cert) => (
              <Card key={cert.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{cert.title}</CardTitle>
                      <p className="text-gray-600 capitalize">{cert.type} certificate</p>
                    </div>
                    <Badge className={statusColors[cert.status]}>
                      {cert.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{cert.progress}%</span>
                    </div>
                    <Progress value={cert.progress} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Sessions:</span>
                      <span className="ml-2">{cert.completedSessions}/{cert.requiredSessions}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tasks:</span>
                      <span className="ml-2">{cert.completedTasks}/{cert.requiredTasks}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    {cert.status === 'ready' && (
                      <Button 
                        size="sm" 
                        className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                        onClick={async () => {
                          if (!projectId) {
                            toast.error('Project ID is required');
                            return;
                          }
                          try {
                            await workspaceAPI.updateCertificate(projectId, cert.id, {
                              status: 'issued',
                              issueDate: new Date().toISOString(),
                            });
                            setCertificates(prev => prev.map(c => 
                              c.id === cert.id 
                                ? { ...c, status: 'issued' as const, issueDate: new Date() }
                                : c
                            ));
                            toast.success('Certificate issued successfully');
                          } catch (err: any) {
                            console.error('Failed to issue certificate:', err);
                            toast.error(err.message || 'Failed to issue certificate');
                          }
                        }}
                      >
                        <Award className="h-3 w-3 mr-1" />
                        Issue Certificate
                      </Button>
                    )}
                    {cert.status === 'issued' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // TODO: Implement actual certificate download
                          toast.info('Certificate download feature coming soon');
                        }}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}