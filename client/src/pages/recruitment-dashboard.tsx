import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { candidateService } from "@/lib/api";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
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
  Legend
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Briefcase, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter
} from "lucide-react";

// Data from Vianna's Excel file
const monthlyData = [
  { month: "Jan", placements: 5, revenue: 100000, avgRevenue: 20000 },
  { month: "Feb", placements: 6, revenue: 150000, avgRevenue: 25000 },
  { month: "Mar", placements: 3, revenue: 90000, avgRevenue: 30000 },
  { month: "Apr", placements: 2, revenue: 40000, avgRevenue: 20000 },
  { month: "May", placements: 5, revenue: 112500, avgRevenue: 22500 },
  { month: "Jun", placements: 7, revenue: 245000, avgRevenue: 35000 },
  { month: "Jul", placements: 8, revenue: 240000, avgRevenue: 30000 },
  { month: "Aug", placements: 4, revenue: 140000, avgRevenue: 35000 },
  { month: "Sep", placements: 5, revenue: 125000, avgRevenue: 25000 },
  { month: "Oct", placements: 6, revenue: 156000, avgRevenue: 26000 },
  { month: "Nov", placements: 7, revenue: 196000, avgRevenue: 28000 },
  { month: "Dec", placements: 1, revenue: 28000, avgRevenue: 28000 },
];

const jobHealthData = [
  { name: "On Track", value: 90, color: "#10b981" },
  { name: "At Risk", value: 5, color: "#f59e0b" },
  { name: "Lost", value: 24, color: "#ef4444" },
  { name: "Completed", value: 24, color: "#3b82f6" },
];

const talentPipelineData = [
  { stage: "Matching", count: 2, color: "#8b5cf6" },
  { stage: "Screening", count: 3, color: "#6366f1" },
  { stage: "Shortlisted", count: 30, color: "#3b82f6" },
  { stage: "Interview", count: 92, color: "#0ea5e9" },
  { stage: "Offer", count: 152, color: "#10b981" },
  { stage: "Hired", count: 27, color: "#22c55e" },
];

export default function RecruitmentDashboard() {
  const { data: candidates, isLoading: loadingCandidates } = useQuery({
    queryKey: ['candidates'],
    queryFn: candidateService.getAll,
    retry: 1,
  });

  // Calculate real-time pipeline metrics from candidate data
  const livePipelineData = useMemo(() => {
    if (!candidates || candidates.length === 0) {
      return talentPipelineData;
    }

    const matching = candidates.filter(c => c.stage === "Matching").length;
    const screening = candidates.filter(c => c.stage === "Screening").length;
    const shortlisted = candidates.filter(c => c.stage === "Shortlisted").length;
    const interview = candidates.filter(c => c.stage === "Interview").length;
    const offer = candidates.filter(c => c.stage === "Offer").length;
    const hired = candidates.filter(c => c.stage === "Hired").length;

    return [
      { stage: "Matching", count: matching, color: "#8b5cf6" },
      { stage: "Screening", count: screening, color: "#6366f1" },
      { stage: "Shortlisted", count: shortlisted, color: "#3b82f6" },
      { stage: "Interview", count: interview, color: "#0ea5e9" },
      { stage: "Offer", count: offer, color: "#10b981" },
      { stage: "Hired", count: hired, color: "#22c55e" },
    ];
  }, [candidates]);

  const totalPlacements = monthlyData.reduce((sum, m) => sum + m.placements, 0);
  const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
  const avgRevenuePerPlacement = totalRevenue / totalPlacements;

  const totalJobHealth = jobHealthData.reduce((sum, j) => sum + j.value, 0);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="pt-24 pb-12 px-6 container mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <h1 className="text-3xl font-bold tracking-tight">Recruitment Dashboard</h1>
               <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs">
                  Live Data
               </Badge>
            </div>
            <p className="text-gray-400">Comprehensive recruitment performance metrics and pipeline analytics</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/40 border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">Total Placements</CardTitle>
                <Briefcase className="h-4 w-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPlacements}</div>
              <p className="text-xs text-gray-500 mt-1">Year to date</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">R{(totalRevenue / 1000).toFixed(0)}k</div>
              <p className="text-xs text-gray-500 mt-1">Across all placements</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">Avg Revenue/Placement</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">R{(avgRevenuePerPlacement / 1000).toFixed(0)}k</div>
              <p className="text-xs text-gray-500 mt-1">Per successful hire</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">Active Candidates</CardTitle>
                <Users className="h-4 w-4 text-cyan-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{candidates?.length || 0}</div>
              <p className="text-xs text-gray-500 mt-1">In pipeline</p>
            </CardContent>
          </Card>
        </div>

        {/* Vianna's Graphs - Monthly Revenue & Placements Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                Monthly Placements & Revenue
              </CardTitle>
              <CardDescription className="text-gray-400">
                Year-over-year placement and revenue performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis yAxisId="left" stroke="#888" />
                  <YAxis yAxisId="right" orientation="right" stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="placements" 
                    stroke="#a855f7" 
                    strokeWidth={2} 
                    name="Placements"
                    dot={{ fill: "#a855f7", r: 4 }}
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    name="Revenue (R)"
                    dot={{ fill: "#10b981", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-400" />
                Job Search Health
              </CardTitle>
              <CardDescription className="text-gray-400">
                Distribution of job search statuses ({totalJobHealth} total jobs)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={jobHealthData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {jobHealthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Talent Pipeline Funnel */}
        <Card className="bg-black/40 border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              Talent Pipeline (Live Data)
            </CardTitle>
            <CardDescription className="text-gray-400">
              Real-time candidate distribution across recruitment stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={livePipelineData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" stroke="#888" />
                <YAxis type="category" dataKey="stage" stroke="#888" width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px" }}
                  labelStyle={{ color: "#fff" }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {livePipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Job Health Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-300">On Track</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{jobHealthData[0].value}</div>
              <p className="text-xs text-gray-500 mt-1">Jobs progressing well</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-300">At Risk</CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-400">{jobHealthData[1].value}</div>
              <p className="text-xs text-gray-500 mt-1">Require attention</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-300">Lost</CardTitle>
                <XCircle className="h-4 w-4 text-red-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{jobHealthData[2].value}</div>
              <p className="text-xs text-gray-500 mt-1">Opportunities missed</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-300">Completed</CardTitle>
                <Briefcase className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{jobHealthData[3].value}</div>
              <p className="text-xs text-gray-500 mt-1">Successfully filled</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
