import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Factory, 
  Download, 
  Database, 
  AlertCircle,
  ArrowLeft,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line 
} from 'recharts';

const fmt = new Intl.NumberFormat('ko-KR');
const yearNow = new Date().getFullYear();

const MOCK_ORGS = [
  { id: 1, name: "삼성전자", type: "상장사" },
  { id: 2, name: "SK하이닉스", type: "상장사" },
  { id: 3, name: "현대자동차", type: "상장사" }
];

const MOCK_EMISSIONS = [
  { 
    id: 1, 
    year: yearNow - 2, 
    scope1: 1200, 
    scope2: 2100, 
    scope3: 1020, 
    totalEmissions: 4320,
    verificationStatus: "검증완료",
    dataSource: "환경부",
    organization: { id: 1, name: "삼성전자" }
  },
  { 
    id: 2, 
    year: yearNow - 1, 
    scope1: 1100, 
    scope2: 1900, 
    scope3: 980, 
    totalEmissions: 3980,
    verificationStatus: "검증완료",
    dataSource: "환경부",
    organization: { id: 1, name: "삼성전자" }
  },
  { 
    id: 3, 
    year: yearNow, 
    scope1: 980, 
    scope2: 1750, 
    scope3: 920, 
    totalEmissions: 3650,
    verificationStatus: "검증중",
    dataSource: "환경부",
    organization: { id: 1, name: "삼성전자" }
  },
  { 
    id: 4, 
    year: yearNow - 2, 
    scope1: 850, 
    scope2: 1200, 
    scope3: 650, 
    totalEmissions: 2700,
    verificationStatus: "검증완료",
    dataSource: "환경부",
    organization: { id: 2, name: "SK하이닉스" }
  },
  { 
    id: 5, 
    year: yearNow - 1, 
    scope1: 820, 
    scope2: 1150, 
    scope3: 630, 
    totalEmissions: 2600,
    verificationStatus: "검증완료",
    dataSource: "환경부",
    organization: { id: 2, name: "SK하이닉스" }
  },
  { 
    id: 6, 
    year: yearNow, 
    scope1: 780, 
    scope2: 1100, 
    scope3: 600, 
    totalEmissions: 2480,
    verificationStatus: "검증중",
    dataSource: "환경부",
    organization: { id: 2, name: "SK하이닉스" }
  }
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

type KpiCardProps = {
  label: string;
  value: string;
  sub?: string;
  trend?: number;
};

function KpiCard({ label, value, sub, trend }: KpiCardProps) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-semibold tracking-tight">{value}</div>
            {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
          </div>
          {trend !== undefined && (
            <Badge variant={trend < 0 ? "default" : "secondary"} className="rounded-full">
              {trend < 0 ? <TrendingDown className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1" />}
              {Math.abs(trend)}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function sum(arr, f) {
  return arr.reduce((acc, x) => acc + (Number(f(x)) || 0), 0);
}

export default function EmissionsDetailPage() {
  const navigate = useNavigate();
  const [selectedOrg, setSelectedOrg] = useState(undefined);
  const [range, setRange] = useState({ from: yearNow - 2, to: yearNow });
  const [quickRange, setQuickRange] = useState('3years');
  const [isApiConnected, setIsApiConnected] = React.useState(false);

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

  const filteredEmissions = useMemo(() => {
    return MOCK_EMISSIONS.filter(e => 
      (!selectedOrg || e.organization?.id === selectedOrg) &&
      e.year >= range.from &&
      e.year <= range.to
    );
  }, [selectedOrg, range]);

  const totals = useMemo(() => {
    const total = sum(filteredEmissions, e => e.totalEmissions);
    const s1 = sum(filteredEmissions, e => e.scope1);
    const s2 = sum(filteredEmissions, e => e.scope2);
    const s3 = sum(filteredEmissions, e => e.scope3);
    const verifiedCnt = filteredEmissions.filter(e => 
      (e.verificationStatus ?? "").includes("검증완료")
    ).length;
    const rate = filteredEmissions.length ? Math.round((verifiedCnt / filteredEmissions.length) * 100) : 0;
    
    // 추세 계산
    const prevYear = filteredEmissions.filter(e => e.year === yearNow - 1);
    const currYear = filteredEmissions.filter(e => e.year === yearNow);
    const prevTotal = sum(prevYear, e => e.totalEmissions);
    const currTotal = sum(currYear, e => e.totalEmissions);
    const trend = prevTotal > 0 ? Math.round(((currTotal - prevTotal) / prevTotal) * 100) : 0;
    
    return { total, s1, s2, s3, verifiedCnt, rate, trend };
  }, [filteredEmissions]);

  const byYear = useMemo(() => {
    const map = new Map();
    for (const e of filteredEmissions) {
      const m = map.get(e.year) ?? { year: e.year, scope1: 0, scope2: 0, scope3: 0, total: 0 };
      m.scope1 += e.scope1 || 0;
      m.scope2 += e.scope2 || 0;
      m.scope3 += e.scope3 || 0;
      m.total += e.totalEmissions || 0;
      map.set(e.year, m);
    }
    return [...map.values()].sort((a, b) => a.year - b.year);
  }, [filteredEmissions]);

  const pieData = useMemo(() => [
    { name: "Scope 1 (직접배출)", value: totals.s1 || 0 },
    { name: "Scope 2 (간접배출)", value: totals.s2 || 0 },
    { name: "Scope 3 (기타배출)", value: totals.s3 || 0 }
  ], [totals]);

  const handleQuickRange = (rangeType) => {
    setQuickRange(rangeType);
    switch(rangeType) {
      case '1year':
        setRange({ from: yearNow, to: yearNow });
        break;
      case '3years':
        setRange({ from: yearNow - 2, to: yearNow });
        break;
      case '5years':
        setRange({ from: yearNow - 4, to: yearNow });
        break;
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="w-full px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleGoBack} className="hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">온실가스 배출량 상세</h1>
              <p className="text-sm text-muted-foreground">기업별 온실가스 배출량 추적 및 분석 (단위: tCO₂e)</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isApiConnected ? "default" : "secondary"} className="rounded-full">
                <Database className="w-4 h-4 mr-1" /> {isApiConnected ? "API 연결됨" : "Mock 데이터"}
              </Badge>
              <Button variant="outline" size="sm" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50">
                <Download className="w-4 h-4 mr-1" /> CSV 내보내기
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-6 py-8 space-y-6">
        {/* 필터 섹션 */}
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">조직 선택</label>
                <Select 
                  value={selectedOrg ? String(selectedOrg) : "all"}
                  onValueChange={(v) => setSelectedOrg(v === "all" ? undefined : Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="전체 조직" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 조직</SelectItem>
                    {MOCK_ORGS.map(o => (
                      <SelectItem key={o.id} value={String(o.id)}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">시작 연도</label>
                <Input
                  type="number"
                  value={range.from}
                  onChange={(e) => setRange(r => ({ ...r, from: Number(e.target.value) }))}
                  min={2015}
                  max={yearNow}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">종료 연도</label>
                <Input
                  type="number"
                  value={range.to}
                  onChange={(e) => setRange(r => ({ ...r, to: Number(e.target.value) }))}
                  min={2015}
                  max={yearNow}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">빠른 선택</label>
                <div className="flex gap-2">
                  <Button 
                    variant={quickRange === '1year' ? 'default' : 'outline'}
                    size="sm"
                    className={`flex-1 ${quickRange === '1year' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    onClick={() => handleQuickRange('1year')}
                  >
                    올해
                  </Button>
                  <Button 
                    variant={quickRange === '3years' ? 'default' : 'outline'}
                    size="sm"
                    className={`flex-1 ${quickRange === '3years' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    onClick={() => handleQuickRange('3years')}
                  >
                    최근 3년
                  </Button>
                  <Button 
                    variant={quickRange === '5years' ? 'default' : 'outline'}
                    size="sm"
                    className={`flex-1 ${quickRange === '5years' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    onClick={() => handleQuickRange('5years')}
                  >
                    최근 5년
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI 카드 섹션 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard 
            label="총 배출량" 
            value={`${fmt.format(Math.round(totals.total))} t`}
            sub={`${range.from}–${range.to}년${selectedOrg ? " · 선택된 조직" : " · 전체"}`}
            trend={totals.trend}
          />
          <KpiCard 
            label="Scope 1 (직접배출)" 
            value={`${fmt.format(Math.round(totals.s1))} t`}
            sub="연료 연소 등"
          />
          <KpiCard 
            label="Scope 2 (간접배출)" 
            value={`${fmt.format(Math.round(totals.s2))} t`}
            sub="전력 사용 등"
          />
          <KpiCard 
            label="Scope 3 (기타배출)" 
            value={`${fmt.format(Math.round(totals.s3))} t`}
            sub="공급망 등"
          />
        </div>

        {/* 차트 섹션 */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 연도별 배출량 */}
          <Card className="rounded-2xl lg:col-span-2">
            <CardHeader>
              <CardTitle>연도별 배출량 추이</CardTitle>
              <p className="text-xs text-muted-foreground">Scope별 상세 배출량</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={byYear} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value: unknown) => 
                    typeof value === 'number' ? `${fmt.format(value)} t` : `${value} t`
                  } />
                  <Legend />
                  <Bar dataKey="scope1" name="Scope 1" fill={COLORS[0]} stackId="a" />
                  <Bar dataKey="scope2" name="Scope 2" fill={COLORS[1]} stackId="a" />
                  <Bar dataKey="scope3" name="Scope 3" fill={COLORS[2]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Scope별 비율 */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Scope별 비율</CardTitle>
              <p className="text-xs text-muted-foreground">총 배출량 구성</p>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props) => {
                      const { name, percent } = props as { name: string; percent?: number };
                      return `${name.split(' ')[0]} ${(percent ? percent * 100 : 0).toFixed(0)}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${fmt.format(value)} t`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 검증 현황 */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>검증 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">검증 완료율</span>
                  <Badge variant="default" className="text-lg px-4 py-1">{totals.rate}%</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all" 
                    style={{ width: `${totals.rate}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">{totals.verifiedCnt}</div>
                    <div className="text-xs text-muted-foreground">검증 완료</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold">{filteredEmissions.length - totals.verifiedCnt}</div>
                    <div className="text-xs text-muted-foreground">검증 대기</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>데이터 출처</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Factory className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">환경부 온실가스종합정보센터</p>
                      <p className="text-xs text-muted-foreground">공식 배출량 데이터</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">기업 자율 공시</p>
                      <p className="text-xs text-muted-foreground">ESG 보고서</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 상세 데이터 테이블 */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>상세 데이터</CardTitle>
            <p className="text-xs text-muted-foreground">기업별 연도별 배출량 상세 내역</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b-2">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold">연도</th>
                    <th className="py-3 px-4 text-left font-semibold">조직명</th>
                    <th className="py-3 px-4 text-right font-semibold">Scope 1</th>
                    <th className="py-3 px-4 text-right font-semibold">Scope 2</th>
                    <th className="py-3 px-4 text-right font-semibold">Scope 3</th>
                    <th className="py-3 px-4 text-right font-semibold">총 배출량</th>
                    <th className="py-3 px-4 text-center font-semibold">검증 상태</th>
                    <th className="py-3 px-4 text-center font-semibold">데이터 출처</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmissions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground">
                        데이터가 없습니다
                      </td>
                    </tr>
                  ) : (
                    filteredEmissions
                      .sort((a, b) => (b.year - a.year) || a.organization?.id - b.organization?.id)
                      .map(e => (
                        <tr key={e.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{e.year}</td>
                          <td className="py-3 px-4 font-medium">{e.organization?.name || '-'}</td>
                          <td className="py-3 px-4 text-right">{fmt.format(Math.round(e.scope1 || 0))}</td>
                          <td className="py-3 px-4 text-right">{fmt.format(Math.round(e.scope2 || 0))}</td>
                          <td className="py-3 px-4 text-right">{fmt.format(Math.round(e.scope3 || 0))}</td>
                          <td className="py-3 px-4 text-right font-semibold">{fmt.format(Math.round(e.totalEmissions || 0))}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={(e.verificationStatus || "").includes("검증완료") ? "default" : "secondary"}>
                              {e.verificationStatus || "-"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center text-xs">{e.dataSource || "-"}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}