import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Leaf, 
  DollarSign, 
  Clock, 
  Users,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';

// Mock 데이터
const MOCK_KPI_DATA = {
  emissions: {
    total: 5320,
    trend: -12,
    unit: 'metric tons CO₂',
    period: 'Last 12 months'
  },
  donations: {
    total: 1532800,
    trend: 23,
    unit: 'USD',
    period: 'Last 12 months'
  },
  volunteerHours: {
    total: 23150,
    trend: 8,
    unit: 'hours',
    period: 'Last 12 months'
  },
  peopleServed: {
    total: 953800,
    trend: 15,
    unit: 'people',
    period: 'Last 12 months'
  }
};

const IMPACT_BY_PROJECT = [
  { name: 'Community Gardens', emissions: 32, donations: 80, hours: 1200 },
  { name: 'Renewable Energy', emissions: 60, donations: 150, hours: 500 },
  { name: 'After-School Programs', emissions: 95, donations: 70, hours: 2800 },
  { name: 'Plastic Waste Cleanup', emissions: 78, donations: 45, hours: 900 },
  { name: 'Food Assistance', emissions: 25, donations: 200, hours: 600 }
];

const IMPACT_BY_CATEGORY = [
  { name: '아동', value: 35, color: '#8b5cf6' },
  { name: '환경', value: 45, color: '#10b981' },
  { name: '교육', value: 20, color: '#f59e0b' }
];

const MONTHLY_TREND = [
  { month: 'Jan', value: 420 },
  { month: 'Feb', value: 380 },
  { month: 'Mar', value: 450 },
  { month: 'Apr', value: 480 },
  { month: 'May', value: 520 },
  { month: 'Jun', value: 580 }
];

const RECENT_ACTIVITIES = [
  {
    title: '200시간 봉사활동 검증 완료',
    project: '방과후 프로그램',
    date: '2일 전',
    type: 'verified'
  },
  {
    title: '$75k 기부금 보고됨',
    project: '식량 지원 이니셔티브',
    date: '9일 전',
    type: 'reported'
  },
  {
    title: '재활용률 95% 검증 완료',
    project: '커뮤니티 가든',
    date: '12일 전',
    type: 'verified'
  }
];

const KPI_CARDS = [
  {
    id: 'emissions',
    icon: Leaf,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    route: '/emissions'
  },
  {
    id: 'donations',
    icon: DollarSign,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    route: '/donations'
  },
  {
    id: 'volunteerHours',
    icon: Clock,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    route: '/volunteer'
  },
  {
    id: 'peopleServed',
    icon: Users,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    route: '/people'
  }
];

const fmt = new Intl.NumberFormat('en-US');

function KpiCard({ data, icon: Icon, color, bgColor, onViewDetail }) {
  const { total, trend, unit, period } = data;
  const isPositive = trend > 0;
  
  return (
    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={onViewDetail}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`${bgColor} p-3 rounded-xl`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <Badge variant={isPositive ? "default" : "secondary"} className="rounded-full">
            {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {Math.abs(trend)}%
          </Badge>
        </div>
        <div className="space-y-1">
          <div className="text-3xl font-bold tracking-tight">
            {unit === 'USD' ? '

export default function ImpactDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('12months');
  const [isApiConnected, setIsApiConnected] = useState(false);

  // API 연결 확인
  React.useEffect(() => {
    const checkApi = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
        const response = await fetch(`${API_BASE}/api/organizations`);
        setIsApiConnected(response.ok);
      } catch (error) {
        setIsApiConnected(false);
      }
    };
    checkApi();
  }, []);

  const handleViewDetail = (route) => {
    window.location.href = route;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">소셜 임팩트 트래커</h1>
              <p className="text-sm text-muted-foreground">데이터 기반 사회적 영향 추적 시스템</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isApiConnected ? "default" : "secondary"} className="rounded-full">
                <Database className="w-4 h-4 mr-1" />
                {isApiConnected ? "API 연결됨" : "Mock 데이터"}
              </Badge>
              <Button variant="outline" className="bg-white hover:bg-gray-100 text-gray-900 border-gray-300">대시보드</Button>
              <Button variant="ghost" className="text-gray-700 hover:bg-gray-100">프로젝트</Button>
              <Button variant="ghost" className="text-gray-700 hover:bg-gray-100">조직</Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                <Users className="w-5 h-5 text-gray-700" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-6 py-8 space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold mb-4">데이터 기반 사회적 영향 측정</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                <div>
                  <div className="text-4xl font-bold">{fmt.format(MOCK_KPI_DATA.emissions.total)}</div>
                  <div className="text-sm opacity-90">톤 CO₂ 감축</div>
                </div>
                <div>
                  <div className="text-4xl font-bold">{fmt.format(MOCK_KPI_DATA.volunteerHours.total)}</div>
                  <div className="text-sm opacity-90">봉사 시간</div>
                </div>
                <div>
                  <div className="text-4xl font-bold">${fmt.format(MOCK_KPI_DATA.donations.total / 1000)}k</div>
                  <div className="text-sm opacity-90">기부금</div>
                </div>
                <div>
                  <div className="text-4xl font-bold">{fmt.format(MOCK_KPI_DATA.peopleServed.total)}</div>
                  <div className="text-sm opacity-90">수혜 인원</div>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <Button className="bg-white text-blue-700 hover:bg-gray-100 font-medium" size="lg">
                임팩트 탐색
              </Button>
              <Button className="bg-white/10 border-2 border-white text-white hover:bg-white/20 font-medium" size="lg">
                조직 등록
              </Button>
            </div>
          </div>
        </div>

        {/* Quick KPI Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">주요 지표 (KPI)</h2>
            <div className="flex items-center gap-2">
              <Button 
                variant={selectedPeriod === '12months' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedPeriod('12months')}
                className={selectedPeriod === '12months' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}
              >
                최근 12개월
              </Button>
              <Button 
                variant={selectedPeriod === '6months' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedPeriod('6months')}
                className={selectedPeriod === '6months' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}
              >
                최근 6개월
              </Button>
              <Button 
                variant={selectedPeriod === 'year' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedPeriod('year')}
                className={selectedPeriod === 'year' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}
              >
                올해
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {KPI_CARDS.map((card) => (
              <KpiCard
                key={card.id}
                data={MOCK_KPI_DATA[card.id]}
                icon={card.icon}
                color={card.color}
                bgColor={card.bgColor}
                onViewDetail={() => handleViewDetail(card.route)}
              />
            ))}
          </div>
        </div>

        {/* Impact Snapshot */}
        <div>
          <h2 className="text-2xl font-bold mb-6">임팩트 현황</h2>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Impact by Project */}
            <Card className="rounded-2xl lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">프로젝트별 임팩트</CardTitle>
                <p className="text-xs text-muted-foreground">최근 12개월</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={MONTHLY_TREND}>
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Impact by Category */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">카테고리별 분포</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={IMPACT_BY_CATEGORY}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {IMPACT_BY_CATEGORY.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">최근 활동</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {RECENT_ACTIVITIES.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
                      <div className={`p-2 rounded-lg ${activity.type === 'verified' ? 'bg-green-100' : 'bg-blue-100'}`}>
                        {activity.type === 'verified' ? 
                          <TrendingUp className="w-4 h-4 text-green-600" /> : 
                          <DollarSign className="w-4 h-4 text-blue-600" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.project}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Verification Status */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">검증 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">보고서 승인됨</p>
                      <p className="text-xs text-muted-foreground">승인일: 2024-01-15</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-600 text-white">승인</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">보고서 승인됨 1</p>
                      <p className="text-xs text-muted-foreground">승인일: 2024-01-10</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-600 text-white">승인</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">임팩트 기능</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">감사 추적 활성화</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">100% 증빙 첨부</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">이미지 증빙 지원</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="w-full px-6 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 소셜 임팩트 트래커. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} : ''}{fmt.format(total)}{unit === 'metric tons CO₂' ? 't' : ''}
          </div>
          <div className="text-sm text-muted-foreground">{unit}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {period}
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-4 group bg-gray-50 hover:bg-gray-100 text-gray-900 font-medium"
        >
          상세보기
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ImpactDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('12months');
  const [isApiConnected, setIsApiConnected] = useState(false);

  // API 연결 확인
  React.useEffect(() => {
    const checkApi = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
        const response = await fetch(`${API_BASE}/api/organizations`);
        setIsApiConnected(response.ok);
      } catch (error) {
        setIsApiConnected(false);
      }
    };
    checkApi();
  }, []);

  const handleViewDetail = (route) => {
    window.location.href = route;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">소셜 임팩트 트래커</h1>
              <p className="text-sm text-muted-foreground">데이터 기반 사회적 영향 추적 시스템</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isApiConnected ? "default" : "secondary"} className="rounded-full">
                <Database className="w-4 h-4 mr-1" />
                {isApiConnected ? "API 연결됨" : "Mock 데이터"}
              </Badge>
              <Button variant="outline" className="bg-white hover:bg-gray-100 text-gray-900 border-gray-300">대시보드</Button>
              <Button variant="ghost" className="text-gray-700 hover:bg-gray-100">프로젝트</Button>
              <Button variant="ghost" className="text-gray-700 hover:bg-gray-100">조직</Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                <Users className="w-5 h-5 text-gray-700" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-6 py-8 space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold mb-4">데이터 기반 사회적 영향 측정</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                <div>
                  <div className="text-4xl font-bold">{fmt.format(MOCK_KPI_DATA.emissions.total)}</div>
                  <div className="text-sm opacity-90">톤 CO₂ 감축</div>
                </div>
                <div>
                  <div className="text-4xl font-bold">{fmt.format(MOCK_KPI_DATA.volunteerHours.total)}</div>
                  <div className="text-sm opacity-90">봉사 시간</div>
                </div>
                <div>
                  <div className="text-4xl font-bold">${fmt.format(MOCK_KPI_DATA.donations.total / 1000)}k</div>
                  <div className="text-sm opacity-90">기부금</div>
                </div>
                <div>
                  <div className="text-4xl font-bold">{fmt.format(MOCK_KPI_DATA.peopleServed.total)}</div>
                  <div className="text-sm opacity-90">수혜 인원</div>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <Button className="bg-white text-blue-700 hover:bg-gray-100 font-medium" size="lg">
                임팩트 탐색
              </Button>
              <Button className="bg-white/10 border-2 border-white text-white hover:bg-white/20 font-medium" size="lg">
                조직 등록
              </Button>
            </div>
          </div>
        </div>

        {/* Quick KPI Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">주요 지표 (KPI)</h2>
            <div className="flex items-center gap-2">
              <Button 
                variant={selectedPeriod === '12months' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedPeriod('12months')}
                className={selectedPeriod === '12months' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}
              >
                최근 12개월
              </Button>
              <Button 
                variant={selectedPeriod === '6months' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedPeriod('6months')}
                className={selectedPeriod === '6months' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}
              >
                최근 6개월
              </Button>
              <Button 
                variant={selectedPeriod === 'year' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedPeriod('year')}
                className={selectedPeriod === 'year' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}
              >
                올해
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {KPI_CARDS.map((card) => (
              <KpiCard
                key={card.id}
                data={MOCK_KPI_DATA[card.id]}
                icon={card.icon}
                color={card.color}
                bgColor={card.bgColor}
                onViewDetail={() => handleViewDetail(card.route)}
              />
            ))}
          </div>
        </div>

        {/* Impact Snapshot */}
        <div>
          <h2 className="text-2xl font-bold mb-6">임팩트 현황</h2>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Impact by Project */}
            <Card className="rounded-2xl lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">프로젝트별 임팩트</CardTitle>
                <p className="text-xs text-muted-foreground">최근 12개월</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={MONTHLY_TREND}>
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Impact by Category */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">카테고리별 분포</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={IMPACT_BY_CATEGORY}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {IMPACT_BY_CATEGORY.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">최근 활동</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {RECENT_ACTIVITIES.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
                      <div className={`p-2 rounded-lg ${activity.type === 'verified' ? 'bg-green-100' : 'bg-blue-100'}`}>
                        {activity.type === 'verified' ? 
                          <TrendingUp className="w-4 h-4 text-green-600" /> : 
                          <DollarSign className="w-4 h-4 text-blue-600" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.project}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Verification Status */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">검증 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">보고서 승인됨</p>
                      <p className="text-xs text-muted-foreground">승인일: 2024-01-15</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-600 text-white">승인</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">보고서 승인됨 1</p>
                      <p className="text-xs text-muted-foreground">승인일: 2024-01-10</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-600 text-white">승인</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">임팩트 기능</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">감사 추적 활성화</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">100% 증빙 첨부</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">이미지 증빙 지원</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="w-full px-6 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 소셜 임팩트 트래커. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}