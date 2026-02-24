import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Eye, 
  FileText,
  TrendingUp,
  Users,
  Heart,
  Target,
  Calendar,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { mockDonors, mockPrograms } from '@/lib/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

export default function ImpactReportsPage() {
  const { user } = useAuth();
  const currentDonor = mockDonors.find(d => d.user.id === user?.id) || mockDonors[0];

  const impactData = {
    beneficiariesSupported: 5,
    programsContributed: 3,
    totalImpact: currentDonor.totalDonated,
    livesChanged: 12, // Including indirect beneficiaries
  };

  const programImpact = [
    { name: 'Education', value: 40, color: '#4c9789' },
    { name: 'Entrepreneurship', value: 35, color: '#eacfa2' },
    { name: 'Health', value: 25, color: '#6fb3a6' },
  ];

  const monthlyImpact = [
    { month: 'Jan', beneficiaries: 3 },
    { month: 'Feb', beneficiaries: 3 },
    { month: 'Mar', beneficiaries: 4 },
    { month: 'Apr', beneficiaries: 4 },
    { month: 'May', beneficiaries: 5 },
    { month: 'Jun', beneficiaries: 5 },
  ];

  const reports = [
    {
      id: 1,
      title: 'Q2 2024 Impact Report',
      period: 'April - June 2024',
      releaseDate: '2024-07-15',
      type: 'Quarterly',
      highlights: [
        '15 new beneficiaries enrolled',
        '3 businesses launched',
        '95% program retention rate',
      ],
      fileSize: '3.2 MB',
    },
    {
      id: 2,
      title: 'Q1 2024 Impact Report',
      period: 'January - March 2024',
      releaseDate: '2024-04-15',
      type: 'Quarterly',
      highlights: [
        '12 beneficiaries graduated',
        '$50,000 in total capital deployed',
        '8 emergency health interventions',
      ],
      fileSize: '2.8 MB',
    },
    {
      id: 3,
      title: 'Annual Report 2023',
      period: 'Full Year 2023',
      releaseDate: '2024-01-30',
      type: 'Annual',
      highlights: [
        '120 young women empowered',
        '45 businesses established',
        '98% satisfaction rate',
      ],
      fileSize: '5.5 MB',
    },
  ];

  const successStories = [
    {
      id: 1,
      name: 'Grace Uwera',
      program: 'IkiraroBiz Entrepreneurship',
      achievement: 'Launched successful tailoring business',
      impact: 'Now employs 3 other young women',
      date: '2024-05-20',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    },
    {
      id: 2,
      name: 'Divine Mukamana',
      program: 'Girls Education Support',
      achievement: 'Graduated top of her class',
      impact: 'Now pursuing university education',
      date: '2024-04-15',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Impact Reports</h1>
        <p className="text-gray-600">See the real-world impact of your contributions</p>
      </div>

      {/* Impact Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-teal-50 text-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-teal-700">Beneficiaries Supported</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{impactData.beneficiariesSupported}</div>
              <Users className="w-8 h-8 text-teal-600" />
            </div>
            <p className="text-xs text-teal-700 mt-1">Direct support</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 text-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Lives Changed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{impactData.livesChanged}</div>
              <Heart className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-xs text-blue-700 mt-1">Including families</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 text-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Programs Supported</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{impactData.programsContributed}</div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-xs text-purple-700 mt-1">Active programs</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 text-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Total Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">${impactData.totalImpact.toLocaleString()}</div>
              <TrendingUp className="w-8 h-8 text-amber-600" />
            </div>
            <p className="text-xs text-amber-700 mt-1">Lifetime giving</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Impact Distribution</CardTitle>
            <CardDescription>How your donations are allocated</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={programImpact}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {programImpact.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Beneficiaries Over Time</CardTitle>
            <CardDescription>Growth in people you've supported</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyImpact}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="beneficiaries" 
                  stroke="#4c9789" 
                  strokeWidth={2}
                  name="Beneficiaries"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Impact Reports</TabsTrigger>
          <TabsTrigger value="stories">Success Stories</TabsTrigger>
          <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
        </TabsList>

        {/* Impact Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-teal-100 rounded-lg">
                      <FileText className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription className="mt-1">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {report.period}
                          </span>
                          <span>Released: {new Date(report.releaseDate).toLocaleDateString()}</span>
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge>{report.type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Key Highlights:</h4>
                    <ul className="space-y-1">
                      {report.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 flex-shrink-0" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                      <Download className="w-4 h-4 mr-2" />
                      Download ({report.fileSize})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Success Stories Tab */}
        <TabsContent value="stories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Success Stories</CardTitle>
              <CardDescription>
                Real stories from beneficiaries your donations have supported
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {successStories.map((story) => (
                  <div 
                    key={story.id} 
                    className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <img 
                      src={story.image} 
                      alt={story.name}
                      className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{story.name}</h3>
                          <p className="text-sm text-gray-500">{story.program}</p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(story.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-1">
                        <strong>Achievement:</strong> {story.achievement}
                      </p>
                      <p className="text-gray-700 mb-3">
                        <strong>Impact:</strong> {story.impact}
                      </p>
                      <Button variant="link" className="p-0 h-auto text-teal-600">
                        Read Full Story →
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Key Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Education Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Girls kept in school</span>
                  <span className="font-bold text-2xl text-teal-600">15</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">School supplies provided</span>
                  <span className="font-bold text-2xl text-teal-600">45</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tutoring hours</span>
                  <span className="font-bold text-2xl text-teal-600">120</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Entrepreneurship Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Businesses launched</span>
                  <span className="font-bold text-2xl text-blue-600">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Capital deployed</span>
                  <span className="font-bold text-2xl text-blue-600">$2,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Jobs created</span>
                  <span className="font-bold text-2xl text-blue-600">12</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Health & Wellbeing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Health interventions</span>
                  <span className="font-bold text-2xl text-purple-600">25</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Counseling sessions</span>
                  <span className="font-bold text-2xl text-purple-600">60</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Hygiene kits distributed</span>
                  <span className="font-bold text-2xl text-purple-600">180</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Community Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Families reached</span>
                  <span className="font-bold text-2xl text-green-600">35</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Communities served</span>
                  <span className="font-bold text-2xl text-green-600">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Volunteer hours</span>
                  <span className="font-bold text-2xl text-green-600">450</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Geographic Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Impact</CardTitle>
          <CardDescription>Communities where your support is making a difference</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="font-medium">Kigali City</p>
                  <p className="text-sm text-gray-500">3 beneficiaries</p>
                </div>
              </div>
              <Badge>Primary</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="font-medium">Huye District</p>
                  <p className="text-sm text-gray-500">1 beneficiary</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="font-medium">Musanze District</p>
                  <p className="text-sm text-gray-500">1 beneficiary</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
