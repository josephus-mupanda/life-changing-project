import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  Calendar,
  PieChart as PieChartIcon,
  BarChart3,
  FileText
} from 'lucide-react';
import { mockPrograms, mockDonors } from '@/lib/mock-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  Legend,
} from 'recharts';

export default function FinancialPage() {
  const totalBudget = mockPrograms.reduce((sum, p) => sum + p.budget, 0);
  const totalAllocated = mockPrograms.reduce((sum, p) => sum + p.fundsAllocated, 0);
  const totalUtilized = mockPrograms.reduce((sum, p) => sum + p.fundsUtilized, 0);
  const totalDonations = mockDonors.reduce((sum, d) => sum + d.totalDonated, 0);

  const programBudgets = mockPrograms.map(p => ({
    name: p.name.en,
    budget: p.budget,
    allocated: p.fundsAllocated,
    utilized: p.fundsUtilized,
    remaining: p.budget - p.fundsUtilized,
  }));

  const fundUtilization = [
    { name: 'Utilized', value: totalUtilized, color: '#4c9789' },
    { name: 'Allocated', value: totalAllocated - totalUtilized, color: '#6fb3a6' },
    { name: 'Available', value: totalBudget - totalAllocated, color: '#eacfa2' },
  ];

  const monthlyFinancials = [
    { month: 'Jan', income: 25000, expenses: 18000 },
    { month: 'Feb', income: 28000, expenses: 20000 },
    { month: 'Mar', income: 32000, expenses: 22000 },
    { month: 'Apr', income: 30000, expenses: 21000 },
    { month: 'May', income: 35000, expenses: 24000 },
    { month: 'Jun', income: 38000, expenses: 26000 },
  ];

  const expenseCategories = [
    { category: 'Program Delivery', amount: 45000, percentage: 60, color: '#4c9789' },
    { category: 'Staff Salaries', amount: 18000, percentage: 24, color: '#6fb3a6' },
    { category: 'Administration', amount: 7500, percentage: 10, color: '#eacfa2' },
    { category: 'Marketing', amount: 4500, percentage: 6, color: '#3a7369' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-gray-600">Track budgets, donations, and expenses</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-teal-600 hover:bg-teal-700 flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-foreground">${totalBudget.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Fiscal year 2024</p>
              </div>
              <div className="w-14 h-14 rounded-lg bg-green-100 text-green-700 flex items-center justify-center shadow-md">
                <DollarSign className="w-7 h-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Funds Allocated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-foreground">${totalAllocated.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {((totalAllocated / totalBudget) * 100).toFixed(1)}% of budget
                </p>
              </div>
              <div className="w-14 h-14 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shadow-md">
                <TrendingUp className="w-7 h-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-2 border-[#4c9789]/30 bg-gradient-to-br from-[#4c9789]/5 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Funds Utilized</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-foreground">${totalUtilized.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {((totalUtilized / totalBudget) * 100).toFixed(1)}% of budget
                </p>
              </div>
              <div className="w-14 h-14 rounded-lg bg-[#4c9789]/20 text-[#4c9789] flex items-center justify-center shadow-md">
                <BarChart3 className="w-7 h-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-foreground">${totalDonations.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">All time received</p>
              </div>
              <div className="w-14 h-14 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shadow-md">
                <DollarSign className="w-7 h-7" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Income vs Expenses</CardTitle>
            <CardDescription>Financial trends over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyFinancials}>
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
                  dataKey="income"
                  stroke="#4c9789"
                  strokeWidth={2}
                  name="Income"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Expenses"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fund Utilization</CardTitle>
            <CardDescription>Breakdown of budget allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fundUtilization}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {fundUtilization.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="programs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="programs">Program Budgets</TabsTrigger>
          <TabsTrigger value="expenses">Expense Categories</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
        </TabsList>

        {/* Program Budgets Tab */}
        <TabsContent value="programs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Program Budgets</CardTitle>
                  <CardDescription>Budget allocation and utilization by program</CardDescription>
                </div>
                <Select defaultValue="2024">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">Fiscal Year 2024</SelectItem>
                    <SelectItem value="2023">Fiscal Year 2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {programBudgets.map((program) => {
                  const utilizationPercent = (program.utilized / program.budget) * 100;
                  const allocationPercent = (program.allocated / program.budget) * 100;

                  return (
                    <div key={program.name} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{program.name}</h3>
                          <p className="text-sm text-gray-500">
                            Budget: ${program.budget.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-teal-600">
                            ${program.utilized.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {utilizationPercent.toFixed(1)}% utilized
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Utilization</span>
                          <span>{utilizationPercent.toFixed(1)}%</span>
                        </div>
                        <Progress value={utilizationPercent} className="h-2" />

                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Allocation</span>
                          <span>{allocationPercent.toFixed(1)}%</span>
                        </div>
                        <Progress value={allocationPercent} className="h-2 bg-blue-100" />
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-2 border-t text-sm">
                        <div>
                          <p className="text-gray-500">Allocated</p>
                          <p className="font-medium">${program.allocated.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Utilized</p>
                          <p className="font-medium">${program.utilized.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Remaining</p>
                          <p className="font-medium text-green-600">
                            ${program.remaining.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expense Categories Tab */}
        <TabsContent value="expenses">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Spending by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={expenseCategories} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis type="number" stroke="#666" />
                    <YAxis dataKey="category" type="category" stroke="#666" width={150} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="amount" fill="#4c9789" name="Amount ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
                <CardDescription>Detailed breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseCategories.map((expense) => (
                    <div key={expense.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{expense.category}</span>
                        <div className="text-right">
                          <p className="font-semibold">${expense.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">{expense.percentage}%</p>
                        </div>
                      </div>
                      <Progress value={expense.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recent Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest financial activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Jun 15, 2024</TableCell>
                      <TableCell>Donation from John Smith</TableCell>
                      <TableCell>General Fund</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700">Income</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        +$500.00
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700">Completed</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Jun 14, 2024</TableCell>
                      <TableCell>Training materials purchase</TableCell>
                      <TableCell>Program Delivery</TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-700">Expense</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-red-600">
                        -$350.00
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700">Completed</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Jun 13, 2024</TableCell>
                      <TableCell>Monthly recurring donation</TableCell>
                      <TableCell>IkiraroBiz Program</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700">Income</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        +$100.00
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700">Completed</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Jun 12, 2024</TableCell>
                      <TableCell>Staff salaries - June</TableCell>
                      <TableCell>Staff Salaries</TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-700">Expense</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-red-600">
                        -$5,000.00
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700">Completed</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Jun 10, 2024</TableCell>
                      <TableCell>Office rent payment</TableCell>
                      <TableCell>Administration</TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-700">Expense</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-red-600">
                        -$800.00
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700">Completed</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Financial Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Reports</CardTitle>
          <CardDescription>Download comprehensive financial statements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Budget Report</h3>
                  <p className="text-sm text-gray-500">Q2 2024</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>

            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Donation Report</h3>
                  <p className="text-sm text-gray-500">Q2 2024</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>

            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Expense Report</h3>
                  <p className="text-sm text-gray-500">Q2 2024</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}