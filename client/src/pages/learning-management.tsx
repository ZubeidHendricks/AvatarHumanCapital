import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Clock, Award, Play, Search, Filter, Trophy, Star, TrendingUp } from "lucide-react";
import { useTenant } from "@/hooks/useTenant";

export default function LearningManagement() {
  const { tenant } = useTenant();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock data - replace with actual API calls
  const courses = [
    {
      id: "1",
      title: "Workplace Safety & Compliance",
      description: "Essential safety protocols and compliance requirements for all employees",
      category: "compliance",
      difficulty: "beginner",
      duration: 45,
      thumbnailUrl: "/api/placeholder/400/250",
      learningObjectives: ["Understand safety regulations", "Identify hazards", "Follow protocols"],
      tags: ["safety", "compliance", "mandatory"],
      status: "published",
      progress: 60,
    },
    {
      id: "2",
      title: "Leadership Excellence",
      description: "Develop essential leadership skills for managers and team leads",
      category: "leadership",
      difficulty: "intermediate",
      duration: 120,
      thumbnailUrl: "/api/placeholder/400/250",
      learningObjectives: ["Build team culture", "Effective communication", "Decision making"],
      tags: ["leadership", "management", "soft-skills"],
      status: "published",
      progress: 0,
    },
    {
      id: "3",
      title: "Technical Skills: Advanced Excel",
      description: "Master advanced Excel functions and data analysis",
      category: "technical",
      difficulty: "advanced",
      duration: 90,
      thumbnailUrl: "/api/placeholder/400/250",
      learningObjectives: ["Pivot tables", "VLOOKUP & INDEX", "Macros & VBA"],
      tags: ["excel", "technical", "data"],
      status: "published",
      progress: 100,
    },
  ];

  const stats = {
    coursesCompleted: 12,
    hoursLearned: 45,
    badgesEarned: 8,
    currentStreak: 7,
    points: 1250,
    rank: 15,
    level: 5,
  };

  const badges = [
    { id: "1", name: "Quick Learner", icon: "⚡", rarity: "epic" },
    { id: "2", name: "Safety Champion", icon: "🛡️", rarity: "rare" },
    { id: "3", name: "Team Player", icon: "🤝", rarity: "common" },
  ];

  const leaderboard = [
    { rank: 1, name: "Sarah Johnson", points: 2150, avatar: "SJ" },
    { rank: 2, name: "Michael Chen", points: 1980, avatar: "MC" },
    { rank: 3, name: "You", points: 1250, avatar: "YO", isCurrentUser: true },
    { rank: 4, name: "Emma Davis", points: 1120, avatar: "ED" },
    { rank: 5, name: "David Brown", points: 1050, avatar: "DB" },
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: "all", label: "All Courses", count: courses.length },
    { id: "compliance", label: "Compliance", count: courses.filter(c => c.category === "compliance").length },
    { id: "technical", label: "Technical", count: courses.filter(c => c.category === "technical").length },
    { id: "leadership", label: "Leadership", count: courses.filter(c => c.category === "leadership").length },
    { id: "soft_skills", label: "Soft Skills", count: courses.filter(c => c.category === "soft_skills").length },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "intermediate": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "advanced": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "border-gray-500";
      case "rare": return "border-blue-500";
      case "epic": return "border-purple-500";
      case "legendary": return "border-yellow-500";
      default: return "border-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="container mx-auto p-4 md:p-6 space-y-6 pt-20 md:pt-24">
        <BackButton fallbackPath="/hr-dashboard" />

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Learning Management</h1>
          <p className="text-muted-foreground">Develop your skills and advance your career</p>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/40 border border-white/10">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="progress">My Progress</TabsTrigger>
            <TabsTrigger value="gamification">Achievements</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-black/40 border-white/10"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="whitespace-nowrap"
                  >
                    {cat.label} ({cat.count})
                  </Button>
                ))}
              </div>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="bg-black/40 border-white/10 overflow-hidden group hover:border-primary/50 transition-all">
                  <div className="relative h-48 bg-gradient-to-br from-primary/20 to-purple-500/20 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-primary/50" />
                    </div>
                    {course.progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="text-white text-lg line-clamp-2">{course.title}</CardTitle>
                      {course.progress === 100 && (
                        <Award className="w-5 h-5 text-yellow-500 shrink-0" />
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={getDifficultyColor(course.difficulty)}>
                        {course.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{course.duration}min</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {course.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button className="w-full" variant={course.progress > 0 ? "default" : "outline"}>
                      <Play className="w-4 h-4 mr-2" />
                      {course.progress === 0 ? "Start Course" : course.progress === 100 ? "Review" : "Continue"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-black/40 border-white/10">
                <CardHeader className="pb-3">
                  <CardDescription>Courses Completed</CardDescription>
                  <CardTitle className="text-3xl text-white">{stats.coursesCompleted}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-black/40 border-white/10">
                <CardHeader className="pb-3">
                  <CardDescription>Hours Learned</CardDescription>
                  <CardTitle className="text-3xl text-white">{stats.hoursLearned}h</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-black/40 border-white/10">
                <CardHeader className="pb-3">
                  <CardDescription>Current Streak</CardDescription>
                  <CardTitle className="text-3xl text-white">{stats.currentStreak} days</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-black/40 border-white/10">
                <CardHeader className="pb-3">
                  <CardDescription>Badges Earned</CardDescription>
                  <CardTitle className="text-3xl text-white">{stats.badgesEarned}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">In Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {courses.filter(c => c.progress > 0 && c.progress < 100).map((course) => (
                  <div key={course.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-medium">{course.title}</h3>
                      <span className="text-sm text-muted-foreground">{course.progress}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gamification Tab */}
          <TabsContent value="gamification" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-primary/20 to-purple-500/20 border-primary/30">
                <CardHeader>
                  <CardDescription>Total Points</CardDescription>
                  <CardTitle className="text-4xl text-white flex items-center gap-2">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                    {stats.points}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30">
                <CardHeader>
                  <CardDescription>Current Level</CardDescription>
                  <CardTitle className="text-4xl text-white flex items-center gap-2">
                    <Star className="w-8 h-8 text-blue-500" />
                    {stats.level}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
                <CardHeader>
                  <CardDescription>Global Rank</CardDescription>
                  <CardTitle className="text-4xl text-white flex items-center gap-2">
                    <TrendingUp className="w-8 h-8 text-green-500" />
                    #{stats.rank}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Your Badges</CardTitle>
                <CardDescription>Achievements earned through learning excellence</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`p-4 rounded-lg bg-black/40 border-2 ${getRarityColor(badge.rarity)} text-center space-y-2 hover:scale-105 transition-transform cursor-pointer`}
                    >
                      <div className="text-4xl">{badge.icon}</div>
                      <p className="text-sm text-white font-medium">{badge.name}</p>
                      <Badge variant="outline" className="text-xs capitalize">
                        {badge.rarity}
                      </Badge>
                    </div>
                  ))}
                  <div className="p-4 rounded-lg bg-black/20 border-2 border-dashed border-white/10 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">More to earn!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Top Learners</CardTitle>
                <CardDescription>See how you rank against your peers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      className={`flex items-center gap-4 p-4 rounded-lg ${
                        entry.isCurrentUser
                          ? "bg-primary/20 border border-primary/30"
                          : "bg-black/20 border border-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold">
                        {entry.rank}
                      </div>
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 text-white font-semibold">
                        {entry.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {entry.name}
                          {entry.isCurrentUser && (
                            <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-primary font-bold">{entry.points}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
