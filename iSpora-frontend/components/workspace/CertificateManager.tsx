import React, { useState } from 'react';
import { Award, Download, Eye, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';

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
}

const mockCertificates: Certificate[] = [
  {
    id: '1',
    title: 'Machine Learning Fundamentals',
    type: 'completion',
    status: 'ready',
    progress: 100,
    requiredSessions: 10,
    completedSessions: 10,
    requiredTasks: 8,
    completedTasks: 8,
  },
  {
    id: '2',
    title: 'Career Development Program',
    type: 'milestone',
    status: 'draft',
    progress: 75,
    requiredSessions: 12,
    completedSessions: 9,
    requiredTasks: 10,
    completedTasks: 8,
  },
];

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  ready: 'bg-green-100 text-green-800',
  issued: 'bg-blue-100 text-blue-800',
};

export function CertificateManager({ mentee }: CertificateManagerProps) {
  const [certificates] = useState<Certificate[]>(mockCertificates);

  return (
    <div className="flex flex-col bg-gray-50">
      <div className="flex-shrink-0 p-6 border-b bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Certificate Manager</h3>
            <p className="text-gray-600">Track and issue certificates for {mentee.name}</p>
          </div>
          <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
            <Plus className="h-4 w-4 mr-2" />
            Create Certificate
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-4">
            {certificates.map((cert) => (
              <Card key={cert.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{cert.title}</CardTitle>
                      <p className="text-gray-600 capitalize">{cert.type} certificate</p>
                    </div>
                    <Badge className={statusColors[cert.status]}>{cert.status}</Badge>
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
                      <span className="ml-2">
                        {cert.completedSessions}/{cert.requiredSessions}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tasks:</span>
                      <span className="ml-2">
                        {cert.completedTasks}/{cert.requiredTasks}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    {cert.status === 'ready' && (
                      <Button size="sm" className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                        <Award className="h-3 w-3 mr-1" />
                        Issue Certificate
                      </Button>
                    )}
                    {cert.status === 'issued' && (
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
