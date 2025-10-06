import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  HelpCircle,
  Search,
  MessageCircle,
  Mail,
  Phone,
  ChevronRight,
  Book,
  Video,
  Users,
  Send,
} from 'lucide-react';
import { DashboardHeader } from './DashboardHeader';

export function HelpSupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [supportForm, setSupportForm] = useState({
    subject: '',
    category: '',
    message: '',
    priority: 'medium',
  });

  const [faqs] = useState([
    {
      id: '1',
      question: 'How do I create a new campaign?',
      answer:
        "To create a new campaign, go to the Alma Mater section and click on 'Create Campaign'. Follow the step-by-step wizard to set up your campaign details, goals, and requirements.",
      category: 'Campaigns',
    },
    {
      id: '2',
      question: 'How can I connect with alumni from my university?',
      answer:
        "Use the 'Find Alumni' feature in the Quick Actions panel. You can search by university, graduation year, field of study, or location to find relevant alumni.",
      category: 'Alumni',
    },
    {
      id: '3',
      question: 'What payment methods are accepted?',
      answer:
        'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. You can manage your payment methods in the Billing section.',
      category: 'Billing',
    },
    {
      id: '4',
      question: 'How do I enable two-factor authentication?',
      answer:
        "Go to Settings > Security and click 'Setup' next to Two-Factor Authentication. Follow the instructions to set up 2FA using your preferred authenticator app.",
      category: 'Security',
    },
    {
      id: '5',
      question: 'Can I cancel my subscription at any time?',
      answer:
        'Yes, you can cancel your subscription at any time from the Billing section. Your access will continue until the end of your current billing period.',
      category: 'Billing',
    },
  ]);

  const [supportTickets] = useState([
    {
      id: 'TICK-001',
      subject: 'Unable to upload campaign documents',
      status: 'open',
      priority: 'high',
      created: '2024-01-15',
      lastUpdate: '2024-01-15',
    },
    {
      id: 'TICK-002',
      subject: 'Questions about Pro plan features',
      status: 'resolved',
      priority: 'medium',
      created: '2024-01-10',
      lastUpdate: '2024-01-12',
    },
  ]);

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Support ticket submitted:', supportForm);
    // Handle form submission
  };

  return (
    <div className="h-full">
      <DashboardHeader userName="John" userTitle="Get help and support" />

      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl tracking-tight">Help & Support</h1>
            <p className="text-muted-foreground">
              Find answers to your questions or get in touch with our support team
            </p>
          </div>
        </div>

        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search frequently asked questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Popular Topics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <h3 className="font-medium">Campaigns</h3>
                  <p className="text-sm text-gray-600">Creating and managing campaigns</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardContent className="p-4 text-center">
                  <MessageCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <h3 className="font-medium">Alumni Network</h3>
                  <p className="text-sm text-gray-600">Connecting with alumni</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardContent className="p-4 text-center">
                  <Mail className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <h3 className="font-medium">Account</h3>
                  <p className="text-sm text-gray-600">Profile and settings</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardContent className="p-4 text-center">
                  <Phone className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                  <h3 className="font-medium">Billing</h3>
                  <p className="text-sm text-gray-600">Plans and payments</p>
                </CardContent>
              </Card>
            </div>

            {/* FAQ List */}
            <div className="space-y-4">
              {filteredFaqs.map((faq) => (
                <Card key={faq.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{faq.question}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {faq.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{faq.answer}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Contact Support Tab */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Submit a Support Request</CardTitle>
                  <CardDescription>
                    Can't find what you're looking for? Send us a message
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSupportSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        value={supportForm.subject}
                        onChange={(e) =>
                          setSupportForm({ ...supportForm, subject: e.target.value })
                        }
                        placeholder="Brief description of your issue"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="category" className="text-sm font-medium">
                        Category
                      </label>
                      <select
                        id="category"
                        value={supportForm.category}
                        onChange={(e) =>
                          setSupportForm({ ...supportForm, category: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="">Select a category</option>
                        <option value="technical">Technical Issue</option>
                        <option value="billing">Billing Question</option>
                        <option value="feature">Feature Request</option>
                        <option value="account">Account Issue</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="priority" className="text-sm font-medium">
                        Priority
                      </label>
                      <select
                        id="priority"
                        value={supportForm.priority}
                        onChange={(e) =>
                          setSupportForm({ ...supportForm, priority: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        value={supportForm.message}
                        onChange={(e) =>
                          setSupportForm({ ...supportForm, message: e.target.value })
                        }
                        placeholder="Please describe your issue in detail..."
                        rows={6}
                      />
                    </div>

                    <Button type="submit" className="w-full bg-[#021ff6] hover:bg-[#021ff6]/90">
                      <Send className="h-4 w-4 mr-2" />
                      Submit Request
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Other Ways to Reach Us</CardTitle>
                    <CardDescription>Choose the best way to get in touch</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Email Support</p>
                        <p className="text-sm text-gray-600">support@aspora.co</p>
                        <p className="text-xs text-gray-500">Response within 24 hours</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Live Chat</p>
                        <p className="text-sm text-gray-600">Available Mon-Fri, 9AM-5PM PST</p>
                        <Button size="sm" className="mt-2">
                          Start Chat
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Phone Support</p>
                        <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                        <p className="text-xs text-gray-500">
                          Available for Pro and Enterprise plans
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Response Times</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Free Plan</span>
                      <span className="text-sm text-gray-600">48-72 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Professional Plan</span>
                      <span className="text-sm text-gray-600">24 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Enterprise Plan</span>
                      <span className="text-sm text-gray-600">4 hours</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <Book className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                  <h3 className="font-medium mb-2">Documentation</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Comprehensive guides and API documentation
                  </p>
                  <Button variant="outline" size="sm">
                    Browse Docs
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <Video className="h-12 w-12 mx-auto text-green-600 mb-4" />
                  <h3 className="font-medium mb-2">Video Tutorials</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Step-by-step video guides for common tasks
                  </p>
                  <Button variant="outline" size="sm">
                    Watch Videos
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                  <h3 className="font-medium mb-2">Community</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Connect with other users and share experiences
                  </p>
                  <Button variant="outline" size="sm">
                    Join Community
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Start Guides */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Start Guides</CardTitle>
                <CardDescription>
                  Get up and running quickly with these step-by-step guides
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <div>
                    <p className="font-medium">Setting Up Your First Campaign</p>
                    <p className="text-sm text-gray-600">
                      Learn how to create and launch your first campaign
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <div>
                    <p className="font-medium">Connecting with Alumni</p>
                    <p className="text-sm text-gray-600">
                      Find and connect with alumni from your university
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <div>
                    <p className="font-medium">Managing Your Profile</p>
                    <p className="text-sm text-gray-600">
                      Optimize your profile for better connections
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Support Tickets</h3>
                <p className="text-sm text-gray-600">Track your support requests</p>
              </div>
              <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">New Ticket</Button>
            </div>

            <div className="space-y-4">
              {supportTickets.map((ticket) => (
                <Card key={ticket.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">{ticket.id}</code>
                          <Badge
                            variant={ticket.status === 'open' ? 'destructive' : 'default'}
                            className={
                              ticket.status === 'resolved' ? 'bg-green-100 text-green-800' : ''
                            }
                          >
                            {ticket.status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              ticket.priority === 'high'
                                ? 'text-red-600 border-red-200'
                                : ticket.priority === 'medium'
                                  ? 'text-yellow-600 border-yellow-200'
                                  : 'text-gray-600 border-gray-200'
                            }
                          >
                            {ticket.priority} priority
                          </Badge>
                        </div>
                        <h4 className="font-medium">{ticket.subject}</h4>
                        <p className="text-sm text-gray-600">
                          Created: {ticket.created} • Last update: {ticket.lastUpdate}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
