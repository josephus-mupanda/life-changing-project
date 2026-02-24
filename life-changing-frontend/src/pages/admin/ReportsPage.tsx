import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  FileText,
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Calendar,
  Filter
} from 'lucide-react';
import { mockPrograms, mockBeneficiaries, mockDonors } from '@/lib/mock-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BeneficiaryStatus } from '@/lib/types';

export default function ReportsPage() {
  const activeBeneficiaries = mockBeneficiaries.filter(b => b.status === BeneficiaryStatus.ACTIVE).length;
  const graduatedBeneficiaries = mockBeneficiaries.filter(b => b.status === BeneficiaryStatus.GRADUATED).length;
  const totalDonations = mockDonors.reduce((sum, d) => sum + d.totalDonated, 0);

  const programPerformance = mockPrograms.map(p => ({
    name: p.name.en,
    beneficiaries: mockBeneficiaries.filter(b => b.program.id === p.id).length,
    budget: p.budget,
    utilized: p.fundsUtilized,
    utilization: (p.fundsUtilized / p.budget) * 100,
  }));

  const monthlyBeneficiaries = [
    { month: 'Jan', active: 95, new: 8, graduated: 2 },
    { month: 'Feb', active: 101, new: 10, graduated: 4 },
    { month: 'Mar', active: 107, new: 12, graduated: 6 },
    { month: 'Apr', active: 113, new: 9, graduated: 3 },
    { month: 'May', active: 119, new: 11, graduated: 5 },
    { month: 'Jun', active: 125, new: 10, graduated: 4 },
  ];

  const impactMetrics = [
    { metric: 'Women Empowered', value: 125, target: 150, percentage: 83 },
    { metric: 'Businesses Launched', value: 45, target: 60, percentage: 75 },
    { metric: 'Girls in School', value: 89, target: 100, percentage: 89 },
    { metric: 'Training Sessions', value: 240, target: 300, percentage: 80 },
  ];

  const statusDistribution = [
    { name: 'Active', value: activeBeneficiaries, color: '#4c9789' },
    { name: 'Graduated', value: graduatedBeneficiaries, color: '#6fb3a6' },
    { name: 'Inactive', value: mockBeneficiaries.length - activeBeneficiaries - graduatedBeneficiaries, color: '#eacfa2' },
  ];

  const reports = [
    {
      id: 1,
      title: 'Q2 2024 Impact Report',
      description: 'Comprehensive impact analysis for April-June 2024',
      type: 'Impact',
      period: 'Q2 2024',
      generated: '2024-07-01',
      size: '4.5 MB',
    },
    {
      id: 2,
      title: 'Monthly Program Performance',
      description: 'Detailed program metrics and KPIs for June 2024',
      type: 'Program',
      period: 'June 2024',
      generated: '2024-07-05',
      size: '2.8 MB',
    },
    {
      id: 3,
      title: 'Donor Engagement Report',
      description: 'Donor activity and retention analysis',
      type: 'Donor',
      period: 'Q2 2024',
      generated: '2024-07-03',
      size: '1.9 MB',
    },
    {
      id: 4,
      title: 'Financial Summary',
      description: 'Budget utilization and financial health report',
      type: 'Financial',
      period: 'Q2 2024',
      generated: '2024-07-02',
      size: '3.2 MB',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate insights and download comprehensive reports</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-teal-600 hover:bg-teal-700 flex-1 sm:flex-none">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{mockPrograms.length}</div>
              <Target className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Beneficiaries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-teal-600">{mockBeneficiaries.length}</div>
              <Users className="w-8 h-8 text-teal-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-600">${totalDonations.toLocaleString()}</div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-blue-600">
                {mockBeneficiaries.length > 0
                  ? Math.round((graduatedBeneficiaries / mockBeneficiaries.length) * 100)
                  : 0}%
              </div>
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Beneficiary Trends</CardTitle>
            <CardDescription>Monthly beneficiary statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyBeneficiaries}>
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
                <Legend />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="#4c9789"
                  strokeWidth={2}
                  name="Active"
                />
                <Line
                  type="monotone"
                  dataKey="new"
                  stroke="#6fb3a6"
                  strokeWidth={2}
                  name="New"
                />
                <Line
                  type="monotone"
                  dataKey="graduated"
                  stroke="#eacfa2"
                  strokeWidth={2}
                  name="Graduated"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Beneficiary Status</CardTitle>
            <CardDescription>Current distribution by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="impact" className="space-y-4">
        <TabsList>
          <TabsTrigger value="impact">Impact Metrics</TabsTrigger>
          <TabsTrigger value="program">Program Performance</TabsTrigger>
          <TabsTrigger value="reports">Saved Reports</TabsTrigger>
        </TabsList>

        {/* Impact Metrics Tab */}
        <TabsContent value="impact" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Key Impact Metrics</CardTitle>
                  <CardDescription>Progress towards annual targets</CardDescription>
                </div>
                <Select defaultValue="2024">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">Year 2024</SelectItem>
                    <SelectItem value="2023">Year 2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {impactMetrics.map((metric) => (
                  <div key={metric.metric} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{metric.metric}</h3>
                      <div className="text-right">
                        <p className="font-semibold text-teal-600">
                          {metric.value} / {metric.target}
                        </p>
                        <p className="text-sm text-gray-500">{metric.percentage}% achieved</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-teal-600 h-3 rounded-full transition-all"
                        style={{ width: `${metric.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Program Performance Tab */}
        <TabsContent value="program" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Program Performance Comparison</CardTitle>
              <CardDescription>Budget utilization by program</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={programPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="budget" fill="#eacfa2" name="Budget ($)" />
                  <Bar dataKey="utilized" fill="#4c9789" name="Utilized ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {programPerformance.map((program) => (
              <Card key={program.name}>
                <CardHeader>
                  <CardTitle className="text-base">{program.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Beneficiaries</span>
                    <span className="font-semibold">{program.beneficiaries}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Budget</span>
                    <span className="font-semibold">${program.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Utilized</span>
                    <span className="font-semibold text-teal-600">
                      ${program.utilized.toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Utilization</span>
                      <span className="font-semibold">{program.utilization.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-teal-600 h-2 rounded-full"
                        style={{ width: `${program.utilization}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Saved Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4">
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
                        <CardDescription className="mt-1">{report.description}</CardDescription>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {report.period}
                          </span>
                          <span>Generated: {new Date(report.generated).toLocaleDateString()}</span>
                          <span>{report.size}</span>
                        </div>
                      </div>
                    </div>
                    <Badge>{report.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
