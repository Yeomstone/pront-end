import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Loader2, Factory, Building2, Download, Database, AlertCircle, Search, TrendingUp, Calendar } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, CartesianGrid } from "recharts";

type Organization = {
  id: number;
  name: string;
  type?: string | null;
  createdAt?: string;
};

type Emission = {
  id: number;
  createdAt?: string;
  dataSource?: string | null;
  energyUsage?: number | null;
  industry?: string | null;
  scope1: number;
  scope2: number;
  scope3: number;
  totalEmissions: number;
  verificationStatus?: string | null;
  year: number;
  organization?: { id: number; name?: string } | null;
  organizationName?: string | null;
  girCompanyName?: string | null;
};

const fmt = new Intl.NumberFormat('ko-KR');
const yearNow = new Date().getFullYear();
const API_BASE = import.meta.env.VITE_API_BASE || '';

function sum<T>(arr: T[], f: (x: T) => number) {
  return arr.reduce((acc, x) => acc + (Number(f(x)) || 0), 0);
}

const MOCK_ORGS: Organization[] = [
  { id: 1, name: "Mock Corp A", type: "listed" },
  { id: 2, name: "Mock Corp B", type: "listed" },
];

const MOCK_EMISSIONS: Emission[] = [
  { id: 1, year: yearNow - 2, scope1: 0, scope2: 0, scope3: 0, totalEmissions: 1000, organizationName: "Mock Corp A", organization: { id: 1, name: "Mock Corp A" }, industry: "IT" },
  { id: 2, year: yearNow - 1, scope1: 0, scope2: 0, scope3: 0, totalEmissions: 1010, organizationName: "Mock Corp A", organization: { id: 1, name: "Mock Corp A" }, industry: "IT" },
  { id: 3, year: yearNow, scope1: 0, scope2: 0, scope3: 0, totalEmissions: 940, organizationName: "Mock Corp A", organization: { id: 1, name: "Mock Corp A" }, industry: "IT" },
];

async function fetchJSON<T>(path: string): Promise<T> {
  console.log('🔌 Fetching:', API_BASE + path);
  const res = await fetch(`${API_BASE}${path}`);
  
  if (!res.ok) {
    const text = await res.text();
    console.error('❌ API Error:', res.status, text);
    throw new Error(`HTTP ${res.status}`);
  }
  
  const data = await res.json();
  console.log('✅ Received:', data.length || 'N/A', 'items');
  return data;
}

function useOrganizations() {
  const [data, setData] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromApi, setFromApi] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await fetchJSON<Organization[]>("/api/organizations");
        if (alive) {
          setData(rows);
          setFromApi(true);
          setError(null);
        }
      } catch (e: any) {
        console.warn('⚠️ Falling back to mock data:', e.message);
        setFromApi(false);
        setError(e.message);
        if (alive) setData(MOCK_ORGS);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return { data, loading, fromApi, error };
}

function useEmissions(orgId?: number, fromYear?: number, toYear?: number) {
  const [data, setData] = useState<Emission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromApi, setFromApi] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const q = new URLSearchParams({
          ...(orgId ? { orgId: String(orgId) } : {}),
          ...(fromYear ? { fromYear: String(fromYear) } : {}),
          ...(toYear ? { toYear: String(toYear) } : {}),
        }).toString();
        const rows = await fetchJSON<Emission[]>(`/api/emissions?${q}`);
        if (alive) {
          setData(rows);
          setFromApi(true);
          setError(null);
        }
      } catch (e: any) {
        console.warn('⚠️ Falling back to mock data:', e.message);
        setFromApi(false);
        setError(e.message);
        const rows = MOCK_EMISSIONS.filter(r =>
          (!orgId || r.organization?.id === orgId) &&
          (!fromYear || r.year >= fromYear) &&
          (!toYear || r.year <= toYear)
        );
        if (alive) setData(rows);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [orgId, fromYear, toYear]);

  return { data, loading, fromApi, error };
}

function StatCard({ label, value, sub, trend, icon }: { 
  label: string; 
  value: string; 
  sub?: string; 
  trend?: string;
  icon?: React.ReactNode 
}) {
  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">{label}</div>
          {icon && <div className="text-blue-600 dark:text-blue-400">{icon}</div>}
        </div>
        <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
        {sub && <div className="text-sm text-gray-500 dark:text-gray-400">{sub}</div>}
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ImpactDashboard() {
  const { data: orgs, loading: orgsLoading, fromApi: orgsFromApi, error: orgsError } = useOrganizations();
  const [selectedOrg, setSelectedOrg] = useState<number | undefined>(undefined);
  const [range, setRange] = useState<{ from: number; to: number }>({ from: yearNow - 5, to: yearNow });
  const [orgSearch, setOrgSearch] = useState("");

  const { data: emissions, loading: emLoading, fromApi: emFromApi, error: emError } = useEmissions(selectedOrg, range.from, range.to);

  // 📅 연도 범위 프리셋
  const yearPresets = [
    { label: '최근 1년', from: yearNow - 1, to: yearNow },
    { label: '최근 3년', from: yearNow - 3, to: yearNow },
    { label: '최근 5년', from: yearNow - 5, to: yearNow },
    { label: '최근 10년', from: yearNow - 10, to: yearNow },
    { label: '전체', from: 2015, to: yearNow },
  ];

  // 🔍 조직 검색 필터링
  const filteredOrgs = useMemo(() => {
    if (!orgSearch) return orgs;
    const search = orgSearch.toLowerCase();
    return orgs.filter(o => o.name.toLowerCase().includes(search));
  }, [orgs, orgSearch]);

  const totals = useMemo(() => {
    const total = sum(emissions, e => e.totalEmissions);
    const recordCount = emissions.length;
    const orgCount = new Set(emissions.map(e => e.organization?.id || e.organizationName)).size;
    const latestYear = emissions.length ? Math.max(...emissions.map(e => e.year)) : yearNow;
    const avgPerOrg = orgCount > 0 ? total / orgCount : 0;
    return { total, recordCount, orgCount, latestYear, avgPerOrg };
  }, [emissions]);

  const byYear = useMemo(() => {
    const map = new Map<number, { year: number; total: number; count: number }>();
    for (const e of emissions) {
      const m = map.get(e.year) ?? { year: e.year, total: 0, count: 0 };
      m.total += e.totalEmissions || 0;
      m.count += 1;
      map.set(e.year, m);
    }
    return [...map.values()].sort((a, b) => a.year - b.year);
  }, [emissions]);

  const byIndustry = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of emissions) {
      const ind = e.industry || "기타";
      map.set(ind, (map.get(ind) || 0) + (e.totalEmissions || 0));
    }
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [emissions]);

  const topEmitters = useMemo(() => {
    const map = new Map<string, { name: string; total: number; count: number }>();
    for (const e of emissions) {
      const name = e.organization?.name || e.organizationName || `#${e.organization?.id}`;
      const m = map.get(name) ?? { name, total: 0, count: 0 };
      m.total += e.totalEmissions || 0;
      m.count += 1;
      map.set(name, m);
    }
    return [...map.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 15);
  }, [emissions]);

  const orgNameOf = (e: Emission) => e.organization?.name || e.organizationName || `#${e.organization?.id ?? "-"}`;

  const hasError = orgsError || emError;
  const usingMock = !orgsFromApi || !emFromApi;

  const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d', '#16a34a', '#059669'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Social Impact Tracker</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">조직별 온실가스 배출량 데이터 (tCO₂e)</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={usingMock ? "secondary" : "default"} className="px-3 py-1">
                <Database className="w-3 h-3 mr-1" /> {usingMock ? "Mock Data" : "Live API"}
              </Badge>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Download className="w-4 h-4 mr-2" /> Export Data
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
        {/* Connection Error Alert */}
        {hasError && (
          <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-yellow-900 dark:text-yellow-100">Backend Connection Issue</div>
                <div className="text-sm text-yellow-800 dark:text-yellow-200 mt-1 break-words">{orgsError || emError}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters Section */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="grid lg:grid-cols-5 gap-4">
              {/* Organization Select */}
              <div className="lg:col-span-2 space-y-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">조직 선택</label>
                <Select value={selectedOrg ? String(selectedOrg) : "all"}
                  onValueChange={(v: string) => setSelectedOrg(v === "all" ? undefined : Number(v))}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="전체 조직" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 조직</SelectItem>
                    {orgs.slice(0, 50).map(o => (
                      <SelectItem key={o.id} value={String(o.id)}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Range */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">시작 연도</label>
                <Input type="number" value={range.from} className="h-11"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setRange(r => ({ ...r, from: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">종료 연도</label>
                <Input type="number" value={range.to} className="h-11"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setRange(r => ({ ...r, to: Number(e.target.value) }))} />
              </div>

              {/* Organization Search Button */}
              <div className="flex items-end">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full h-11 border-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                      <Search className="w-4 h-4 mr-2"/>조직 검색
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[600px] sm:w-[700px]">
                    <SheetHeader>
                      <SheetTitle className="text-xl">조직 목록 ({orgs.length.toLocaleString()}개)</SheetTitle>
                    </SheetHeader>
                    
                    <div className="mt-6 mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="조직명으로 검색..."
                          value={orgSearch}
                          onChange={(e) => setOrgSearch(e.target.value)}
                          className="pl-10 h-11"
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {filteredOrgs.length.toLocaleString()}개 조직 표시 중
                      </div>
                    </div>

                    <div className="space-y-2 max-h-[calc(100vh-260px)] overflow-auto pr-2">
                      {orgsLoading ? (
                        <div className="flex items-center justify-center p-10 text-gray-500">
                          <Loader2 className="mr-2 h-5 w-5 animate-spin"/>Loading…
                        </div>
                      ) : filteredOrgs.length === 0 ? (
                        <div className="text-center p-10 text-gray-500">검색 결과 없음</div>
                      ) : (
                        filteredOrgs.map(o => (
                          <div key={o.id} className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 dark:text-white truncate">{o.name}</div>
                              <div className="text-xs text-gray-500 mt-1">ID: {o.id} · {o.type || "상장사"}</div>
                            </div>
                            <Button size="sm" className="ml-4 bg-blue-600 hover:bg-blue-700" onClick={() => {
                              setSelectedOrg(o.id);
                              setOrgSearch("");
                            }}>
                              조회
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Year Range Presets */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 flex-wrap">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">빠른 선택:</span>
                {yearPresets.map((preset) => (
                  <Button
                    key={preset.label}
                    size="sm"
                    variant={range.from === preset.from && range.to === preset.to ? "default" : "outline"}
                    onClick={() => setRange({ from: preset.from, to: preset.to })}
                    className="h-8"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="총 배출량" 
            value={`${fmt.format(Math.round(totals.total))}`}
            sub={`${range.from}–${range.to} · tCO₂e`}
            icon={<Factory className="w-6 h-6" />}
          />
          <StatCard 
            label="참여 조직" 
            value={fmt.format(totals.orgCount)}
            sub="배출량 보고 조직 수"
            icon={<Building2 className="w-6 h-6" />}
          />
          <StatCard 
            label="평균 배출량" 
            value={fmt.format(Math.round(totals.avgPerOrg))}
            sub="조직당 평균 (tCO₂e)"
            icon={<TrendingUp className="w-6 h-6" />}
          />
          <StatCard 
            label="데이터 기록" 
            value={fmt.format(totals.recordCount)}
            sub={`최신: ${totals.latestYear}년`}
            icon={<Database className="w-6 h-6" />}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Bar Chart - Emissions by Year */}
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">연도별 배출량 추이</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Total Emissions by Year (tCO₂e)</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-96">
                {emLoading ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin"/>데이터 로딩 중...
                  </div>
                ) : byYear.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    선택된 기간에 데이터가 없습니다
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byYear} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="year" 
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        axisLine={{ stroke: '#d1d5db' }}
                      />
                      <YAxis 
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        axisLine={{ stroke: '#d1d5db' }}
                        tickFormatter={(value) => fmt.format(value / 1000) + 'K'}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px'
                        }}
                        formatter={(value: number) => [fmt.format(Math.round(value)) + ' tCO₂e', '총 배출량']}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar dataKey="total" name="총 배출량" fill="#2563eb" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart - Industry */}
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">산업별 배출량 분포</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Emissions by Industry (Top 10)</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-96">
                {emLoading ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin"/>데이터 로딩 중...
                  </div>
                ) : byIndustry.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    산업 데이터가 없습니다
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={byIndustry} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={120}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={{ stroke: '#6b7280' }}
                      >
                        {byIndustry.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px'
                        }}
                        formatter={(value: number) => fmt.format(Math.round(value)) + ' tCO₂e'}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Emitters */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">상위 배출 조직</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Top 15 Organizations by Total Emissions</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {topEmitters.map((org, idx) => {
                const percentage = (org.total / topEmitters[0].total) * 100;
                return (
                  <div key={org.name} className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-gray-400 w-10 text-right flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-2">
                        <div className="font-semibold text-gray-900 dark:text-white truncate pr-4">{org.name}</div>
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {fmt.format(Math.round(org.total))} tCO₂e
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 w-12 text-right">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Detail Table */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">배출량 상세 데이터</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Detailed Emissions Records ({emissions.length.toLocaleString()})</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">연도</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[200px]">조직</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">산업</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">배출량 (tCO₂e)</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">출처</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">검증</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {emLoading ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <Loader2 className="inline mr-2 h-5 w-5 animate-spin"/>데이터 로딩 중...
                    </td></tr>
                  ) : emissions.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      선택된 기간에 데이터가 없습니다
                    </td></tr>
                  ) : (
                    emissions
                      .sort((a, b) => (b.year - a.year) || (b.totalEmissions - a.totalEmissions))
                      .slice(0, 100)
                      .map(e => (
                        <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-white">{e.year}</td>
                          <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                            <div className="truncate max-w-xs" title={orgNameOf(e)}>{orgNameOf(e)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{e.industry || "-"}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900 dark:text-white">
                            {fmt.format(Math.round(e.totalEmissions || 0))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="secondary" className="font-normal">{e.dataSource || "GIR"}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant={(e.verificationStatus || "").toLowerCase().includes("approved") ? "default" : "secondary"}
                              className="font-normal"
                            >
                              {e.verificationStatus || "N/A"}
                            </Badge>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
            {emissions.length > 100 && (
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
                상위 100개 레코드 표시 중 (전체 {emissions.length.toLocaleString()}개)
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 mt-12">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Factory className="w-4 h-4"/> 
              Social Impact Tracker © 2025
            </div>
            <div className="flex items-center gap-2">
              {usingMock ? (
                <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500">
                  <AlertCircle className="w-4 h-4" /> Mock 데이터 사용 중
                </span>
              ) : (
                <span className="flex items-center gap-1 text-green-600 dark:text-green-500">
                  <Database className="w-4 h-4" /> 백엔드 API 연결됨
                </span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}