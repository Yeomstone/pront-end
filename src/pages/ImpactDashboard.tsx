import React, { useEffect, useMemo, useState } from "react";
// src/pages/ImpactDashboard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";
import { Loader2, Factory, Building2, Download, Database, AlertCircle } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

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
const API_BASE = typeof window !== 'undefined' && (window as any).VITE_API_BASE as string | undefined;

function sum<T>(arr: T[], f: (x: T) => number) {
  return arr.reduce((acc, x) => acc + (Number(f(x)) || 0), 0);
}

const MOCK_ORGS: Organization[] = [
  { id: 1, name: "테스트 기업 A", type: "상장사" },
  { id: 2, name: "테스트 기업 B", type: "상장사" },
];

const MOCK_EMISSIONS: Emission[] = [
  { id: 1, year: yearNow - 2, scope1: 100, scope2: 200, scope3: 700, totalEmissions: 1000, organizationName: "테스트 기업 A", organization: { id: 1, name: "테스트 기업 A" } },
  { id: 2, year: yearNow - 1, scope1: 120, scope2: 210, scope3: 680, totalEmissions: 1010, organizationName: "테스트 기업 A", organization: { id: 1, name: "테스트 기업 A" } },
  { id: 3, year: yearNow, scope1: 90, scope2: 190, scope3: 660, totalEmissions: 940, organizationName: "테스트 기업 A", organization: { id: 1, name: "테스트 기업 A" } },
  { id: 4, year: yearNow, scope1: 50, scope2: 80, scope3: 220, totalEmissions: 350, organizationName: "테스트 기업 B", organization: { id: 2, name: "테스트 기업 B" } },
];

async function fetchJSON<T>(path: string): Promise<T> {
  if (!API_BASE) throw new Error('NO_API');
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

function useOrganizations() {
  const [data, setData] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromApi, setFromApi] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await fetchJSON<Organization[]>("/api/organizations");
        if (alive) setData(rows);
      } catch (e) {
        setFromApi(false);
        if (alive) setData(MOCK_ORGS);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return { data, loading, fromApi };
}

function useEmissions(orgId?: number, fromYear?: number, toYear?: number) {
  const [data, setData] = useState<Emission[]>([]);
  const [loading, setLoading] = useState(true);
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
        if (alive) setData(rows);
      } catch (e) {
        setFromApi(false);
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

  return { data, loading, fromApi };
}

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

export default function ImpactDashboard() {
  console.log('🔍 API_BASE:', import.meta.env.VITE_API_BASE);
  console.log('🔍 All env:', import.meta.env);
  const { data: orgs, loading: orgsLoading, fromApi: orgsFromApi } = useOrganizations();
  const [selectedOrg, setSelectedOrg] = useState<number | undefined>(undefined);
  const [range, setRange] = useState<{ from: number; to: number }>({ from: yearNow - 2, to: yearNow });

  const { data: emissions, loading: emLoading, fromApi: emFromApi } = useEmissions(selectedOrg, range.from, range.to);

  const totals = useMemo(() => {
    const total = sum(emissions, e => e.totalEmissions);
    const s1 = sum(emissions, e => e.scope1);
    const s2 = sum(emissions, e => e.scope2);
    const s3 = sum(emissions, e => e.scope3);
    const verifiedCnt = emissions.filter(e => (e.verificationStatus ?? "").toLowerCase() === "검증완료").length;
    const rate = emissions.length ? Math.round((verifiedCnt / emissions.length) * 100) : 0;
    return { total, s1, s2, s3, verifiedCnt, rate };
  }, [emissions]);

  const byYear = useMemo(() => {
    const map = new Map<number, { year: number; scope1: number; scope2: number; scope3: number; total: number }>();
    for (const e of emissions) {
      const m = map.get(e.year) ?? { year: e.year, scope1: 0, scope2: 0, scope3: 0, total: 0 };
      m.scope1 += e.scope1 || 0;
      m.scope2 += e.scope2 || 0;
      m.scope3 += e.scope3 || 0;
      m.total += e.totalEmissions || 0;
      map.set(e.year, m);
    }
    return [...map.values()].sort((a, b) => a.year - b.year);
  }, [emissions]);

  const pieData = useMemo(() => (
    [
      { name: "Scope 1", value: totals.s1 || 0 },
      { name: "Scope 2", value: totals.s2 || 0 },
      { name: "Scope 3", value: totals.s3 || 0 },
    ]
  ), [totals]);

  const orgNameOf = (e: Emission) => e.organization?.name || e.organizationName || `#${e.organization?.id ?? "-"}`;

  const isApiConnected = orgsFromApi && emFromApi;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">온실가스 배출량 대시보드</h1>
          <p className="text-sm text-muted-foreground">상장사 온실가스 배출량 추적 시스템 (단위: tCO₂e)</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isApiConnected ? "default" : "secondary"} className="rounded-full">
            <Database className="w-4 h-4 mr-1" /> {isApiConnected ? "API 연결됨" : "모의 데이터"}
          </Badge>
          {!isApiConnected && (
            <Badge variant="outline" className="rounded-full text-amber-600 border-amber-300">
              <AlertCircle className="w-4 h-4 mr-1" /> 백엔드 미연결
            </Badge>
          )}
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" /> CSV 내보내기
          </Button>
        </div>
      </div>

      {/* 필터 */}
      <Card className="rounded-2xl">
        <CardContent className="p-4 grid md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">조직</div>
            <Select value={selectedOrg ? String(selectedOrg) : "all"}
              onValueChange={(v: string) => setSelectedOrg(v === "all" ? undefined : Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="전체 조직" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 조직</SelectItem>
                {orgs.map(o => (
                  <SelectItem key={o.id} value={String(o.id)}>{o.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">시작 연도</div>
            <Input
              type="number"
              value={range.from}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setRange(r => ({ ...r, from: Number(e.target.value) }))
              }
            />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">종료 연도</div>
            <Input
              type="number"
              value={range.to}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setRange(r => ({ ...r, to: Number(e.target.value) }))
              }
            />
          </div>
          <div className="flex items-end">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full"><Building2 className="w-4 h-4 mr-2" />조직 목록</Button>
              </SheetTrigger>
              <SheetContent className="w-[520px] sm:w-[640px]">
                <SheetHeader>
                  <SheetTitle>등록된 조직</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-2 max-h-[70vh] overflow-auto pr-2">
                  {orgsLoading ? (
                    <div className="flex items-center justify-center p-10 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />로딩 중...</div>
                  ) : (
                    orgs.map(o => (
                      <div key={o.id} className="border rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <div className="font-medium">{o.name}</div>
                          <div className="text-xs text-muted-foreground">#{o.id} · {o.type || "상장사"}</div>
                        </div>
                        <Button size="sm" variant="secondary" onClick={() => setSelectedOrg(o.id)}>조회</Button>
                      </div>
                    ))
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardContent>
      </Card>

      {/* KPI 카드 */}
      <div className="grid md:grid-cols-4 gap-4">
        <KpiCard label="총 배출량" value={`${fmt.format(Math.round(totals.total))} tCO₂e`} sub={`${range.from}–${range.to}${selectedOrg ? " · 조직 #" + selectedOrg : " · 전체"}`} />
        <KpiCard label="Scope 1 (직접배출)" value={`${fmt.format(Math.round(totals.s1))} t`} />
        <KpiCard label="Scope 2 (간접배출)" value={`${fmt.format(Math.round(totals.s2))} t`} />
        <KpiCard label="Scope 3 (기타)" value={`${fmt.format(Math.round(totals.s3))} t`} />
      </div>

      {/* 차트 */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>연도별 배출량</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {emLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />로딩 중...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byYear}>
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="scope1" name="Scope 1" stackId="a" fill={COLORS[0]} />
                  <Bar dataKey="scope2" name="Scope 2" stackId="a" fill={COLORS[1]} />
                  <Bar dataKey="scope3" name="Scope 3" stackId="a" fill={COLORS[2]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>배출원별 비중</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                  {pieData.map((_, i) => (<Cell key={i} fill={COLORS[i]} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>데이터 검증</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <div className="grid grid-cols-2 gap-3 h-full">
              <div className="col-span-2">
                <KpiCard label="검증 완료율" value={`${totals.rate}%`} sub={`${totals.verifiedCnt}/${emissions.length} 검증 완료`} />
              </div>
              <div className="col-span-2 text-sm text-muted-foreground">
                <p>검증 상태(verificationStatus) 필드를 기준으로 산출됩니다.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 상세 테이블 */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>배출량 상세 기록 ({emissions.length}건)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 pr-4">연도</th>
                <th className="py-2 pr-4">조직</th>
                <th className="py-2 pr-4">Scope 1</th>
                <th className="py-2 pr-4">Scope 2</th>
                <th className="py-2 pr-4">Scope 3</th>
                <th className="py-2 pr-4">총 배출량</th>
                <th className="py-2 pr-4">검증상태</th>
                <th className="py-2 pr-4">데이터 출처</th>
              </tr>
            </thead>
            <tbody>
              {emLoading ? (
                <tr><td colSpan={8} className="p-6 text-center text-muted-foreground"><Loader2 className="inline mr-2 h-4 w-4 animate-spin" />로딩 중...</td></tr>
              ) : emissions.length === 0 ? (
                <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">데이터가 없습니다</td></tr>
              ) : (
                emissions
                  .sort((a, b) => (a.year - b.year) || ((a.organization?.id ?? 0) - (b.organization?.id ?? 0)))
                  .map(e => (
                    <tr key={e.id} className="border-t">
                      <td className="py-2 pr-4">{e.year}</td>
                      <td className="py-2 pr-4">{orgNameOf(e)}</td>
                      <td className="py-2 pr-4">{fmt.format(Math.round(e.scope1 || 0))}</td>
                      <td className="py-2 pr-4">{fmt.format(Math.round(e.scope2 || 0))}</td>
                      <td className="py-2 pr-4">{fmt.format(Math.round(e.scope3 || 0))}</td>
                      <td className="py-2 pr-4 font-medium">{fmt.format(Math.round(e.totalEmissions || 0))}</td>
                      <td className="py-2 pr-4">
                        <Badge variant={(e.verificationStatus || "").toLowerCase() === "검증완료" ? "default" : "secondary"}>
                          {e.verificationStatus || "-"}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4">{e.dataSource || "-"}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
      

      {/* 하단 상태 표시 */}
      <div className="text-xs text-muted-foreground text-center py-2">
        <div className="flex justify-center items-center gap-2">
          <Factory className="w-3 h-3" />
          {isApiConnected ? (
            <span>백엔드 API 연결됨 (http://localhost:8080/api)</span>
          ) : (
            <span className="text-amber-600">⚠️ 백엔드 미연결 - 모의 데이터 사용 중</span>
          )}
        </div>
        {!isApiConnected && (
          <div className="mt-2 text-amber-600">
            .env.local 파일에 VITE_API_BASE=http://localhost:8080 을 설정하세요
          </div>
        )}
      </div>
    </div>
  );
}
