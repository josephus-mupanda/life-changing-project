import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  FileText,
  Video,
  Download,
  Phone,
  Mail,
  AlertCircle,
  Search,
  ExternalLink,
  Play,
  File,
  Image as ImageIcon,
  HelpCircle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { beneficiaryService } from '@/services/beneficiary.service';
import { BeneficiaryDocument, DocumentType } from '@/lib/types'; // DocumentType enum should match backend
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';

export default function ResourcesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<BeneficiaryDocument[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]); // Using any for now if type not imported
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);

  useEffect(() => {
    fetchDocuments();
    fetchEmergencyContacts();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoadingDocs(true);
      const data = await beneficiaryService.getDocuments();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load documents", error);
      // toast.error("Failed to load documents");
    } finally {
      setLoadingDocs(false);
    }
  };

  const fetchEmergencyContacts = async () => {
    try {
      setLoadingContacts(true);
      const data = await beneficiaryService.getEmergencyContacts();
      setEmergencyContacts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load contacts", error);
    } finally {
      setLoadingContacts(false);
    }
  };

  const trainingMaterials = [
    {
      id: 1,
      title: 'Business Planning Fundamentals',
      type: 'PDF',
      category: 'Business',
      size: '2.5 MB',
      icon: FileText,
      description: 'Learn how to create a comprehensive business plan',
    },
    {
      id: 2,
      title: 'Financial Management for Small Business',
      type: 'Video',
      category: 'Finance',
      duration: '45 min',
      icon: Video,
      description: 'Master basic accounting and financial tracking',
    },
    {
      id: 3,
      title: 'Marketing Your Products',
      type: 'PDF',
      category: 'Marketing',
      size: '1.8 MB',
      icon: FileText,
      description: 'Effective strategies to reach your customers',
    },
    {
      id: 4,
      title: 'Customer Service Excellence',
      type: 'Video',
      category: 'Skills',
      duration: '30 min',
      icon: Video,
      description: 'Build lasting relationships with customers',
    },
  ];

  const faqs = [
    {
      question: 'How do I submit my weekly tracking?',
      answer: 'Go to the Weekly Tracking page and fill out the form with your business activities. Submit it before the deadline each week.',
    },
    {
      question: 'What should I do if I miss a training session?',
      answer: 'Contact your program coordinator immediately. They will help you catch up with the missed content.',
    },
    {
      question: 'How can I access my capital?',
      answer: 'Capital disbursements are made according to your program schedule. Contact your coordinator for specific details.',
    },
    {
      question: 'Can I change my business type?',
      answer: 'Yes, but this requires approval from your program coordinator. Please submit a request through the support form.',
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <PageHeader
        title="Resources & Support"
        description="Access training materials, documents, and get help when you need it"
      />

      {/* Emergency Contacts Alert */}
      {emergencyContacts.length > 0 && (
        <Alert className="bg-rose-50 border-rose-200 dark:bg-rose-900/10 dark:border-rose-900/30">
          <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          <AlertTitle className="text-rose-800 dark:text-rose-300 font-semibold">Emergency Support</AlertTitle>
          <AlertDescription className="text-rose-700 dark:text-rose-400">
            <div className="mt-2 space-y-1">
              {emergencyContacts.filter(c => c.isPrimary).map((contact) => (
                <div key={contact.id} className="flex items-center gap-2 font-medium">
                  <Phone className="w-4 h-4" />
                  <span>{contact.name} ({contact.relationship}): {contact.phone}</span>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="training" className="space-y-4">
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <TabsTrigger value="training" className="rounded-lg">Training Materials</TabsTrigger>
          <TabsTrigger value="documents" className="rounded-lg">My Documents</TabsTrigger>
          <TabsTrigger value="support" className="rounded-lg">Get Support</TabsTrigger>
          <TabsTrigger value="faq" className="rounded-lg">FAQ</TabsTrigger>
        </TabsList>

        {/* Training Materials Tab */}
        <TabsContent value="training" className="space-y-4">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search training materials..."
                className="w-full pl-9 rounded-xl border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainingMaterials.map((material) => {
              const Icon = material.icon;
              return (
                <Card key={material.id} className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${material.type === 'Video' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base font-semibold">{material.title}</CardTitle>
                          <CardDescription className="mt-1 line-clamp-1">
                            {material.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-slate-50">{material.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 font-medium">
                        {material.type === 'Video' ? material.duration : material.size}
                      </span>
                      <Button size="sm" variant="secondary" className="font-semibold">
                        {material.type === 'Video' ? (
                          <>
                            <Play className="w-3.5 h-3.5 mr-2" /> Watch
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5 mr-2" /> Download
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* My Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Uploaded Documents</CardTitle>
                  <CardDescription>Your personal documents and certificates</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={fetchDocuments} disabled={loadingDocs}>
                    <RefreshCw className={`h-4 w-4 ${loadingDocs ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                    onClick={() => navigate('/beneficiary/resources/upload')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Upload New
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {loadingDocs ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <File className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>No documents uploaded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          {doc.mimeType?.includes('pdf') ? (
                            <FileText className="w-6 h-6 text-red-500" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {doc.documentType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          </p>
                          <p className="text-sm text-slate-500">
                            Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          className={
                            doc.verified
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none'
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-none'
                          }
                        >
                          {doc.verified ? 'Verified' : 'Pending Review'}
                        </Badge>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Get Support Tab */}
        <TabsContent value="support" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>Program Coordinator</CardTitle>
                <CardDescription>Your primary point of contact</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Sarah Mugisha</p>
                  <p className="text-sm text-slate-500">Senior Program Manager</p>
                </div>
                <Separator />
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start h-auto py-3">
                    <Phone className="w-4 h-4 mr-3 text-slate-500" />
                    +250 780 123 456
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-auto py-3">
                    <Mail className="w-4 h-4 mr-3 text-slate-500" />
                    sarah.mugisha@lceo.org
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Emergency Contacts</CardTitle>
                    <CardDescription>People to contact in case of emergency</CardDescription>
                  </div>
                  {/* Add button could go here */}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {emergencyContacts.length === 0 ? (
                  <p className="text-sm text-slate-500">No emergency contacts added.</p>
                ) : (
                  emergencyContacts.map((contact) => (
                    <div key={contact.id} className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{contact.name}</p>
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{contact.relationship}</p>
                        </div>
                        {contact.isPrimary && (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none h-6">Primary</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Phone className="w-3.5 h-3.5" /> {contact.phone}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Submit Support Request */}
            <Card className="md:col-span-2 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>Submit Support Request</CardTitle>
                <CardDescription>
                  Need help? Fill out this form and we'll get back to you soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Input placeholder="Brief description of your issue" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select className="w-full border border-input bg-background hover:bg-accent hover:text-accent-foreground px-3 py-2 rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option>Select category</option>
                      <option>Technical Issue</option>
                      <option>Program Question</option>
                      <option>Financial Matter</option>
                      <option>Training Request</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <textarea
                      className="w-full border border-input bg-background hover:bg-accent hover:text-accent-foreground px-3 py-2 rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[120px]"
                      placeholder="Please describe your issue or question in detail..."
                    />
                  </div>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                    Submit Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="pb-4 border-b last:border-b-0 border-slate-100 dark:border-slate-800">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-start gap-2">
                    <HelpCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    {faq.question}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 ml-7 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}