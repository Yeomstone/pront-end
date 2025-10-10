import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Loader2, Factory, Building2, Download, Database } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";


/**
 * ImpactDashboard — FULL VERSION (aligned to your backend)
 *
 * Backend endpoints expected (your controllers):
 *   GET  /api/organizations
 *   GET  /api/emissions?orgId=&fromYear=&toYear=&year=
 *
 * Entity notes:
 * - Emission has relation Organization (organization) which might be @JsonIgnore.
 * - Denormalized fields exist: organizationName, girCompanyName.
 * - We therefore tolerate missing organization object on the wire.
 */

type Organization = {
  id: number;
  name: string;
  type?: string | null;
  createdAt?: string; // server may return createdAt
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
  organization?: { id: number; name?: string } | null; // may be absent due to @JsonIgnore
  organizationName?: string | null; // fallback
  girCompanyName?: string | null;
};

// --- helpers ---
const fmt = new Intl.NumberFormat();
const yearNow = new Date().getFullYear();
const API_BASE = import.meta.env.VITE_API_BASE as string | undefined;

function sum<T>(arr: T[], f: (x: T) => number) {
  return arr.reduce((acc, x) => acc + (Number(f(x)) || 0), 0);
}

function uniqBy<T, K extends keyof any>(arr: T[], key: (x: T) => K): K[] {
  return Array.from(new Set(arr.map(key)));
}

const MOCK_ORGS: Organization[] = [
  { id: 1, name: "Mock Corp A", type: "listed" },
  { id: 2, name: "Mock Corp B", type: "listed" },
];

const MOCK_EMISSIONS: Emission[] = [
  { id: 1, year: yearNow - 2, scope1: 100, scope2: 200, scope3: 700, totalEmissions: 1000, organizationName: "Mock Corp A", organization: { id: 1, name: "Mock Corp A" } },
  { id: 2, year: yearNow - 1, scope1: 120, scope2: 210, scope3: 680, totalEmissions: 1010, organizationName: "Mock Corp A", organization: { id: 1, name: "Mock Corp A" } },
  { id: 3, year: yearNow,     scope1: 90,  scope2: 190, scope3: 660, totalEmissions: 940,  organizationName: "Mock Corp A", organization: { id: 1, name: "Mock Corp A" } },
  { id: 4, year: yearNow,     scope1: 50,  scope2: 80,  scope3: 220, totalEmissions: 350,  organizationName: "Mock Corp B", organization: { id: 2, name: "Mock Corp B" } },
];

async function fetchJSON<T>(path: string): Promise<T> {
  if (!API_BASE) throw new Error('NO_API');       // 백엔드가 없으면 호출 막기 → 모의데이터 사용
  const res = await fetch(`${API_BASE}${path}`);  // 있을 때만 실제 호출
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
        // fallback to mock
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

export default function ImpactDashboard() {
  const { data: orgs, loading: orgsLoading, fromApi: orgsFromApi } = useOrganizations();
  const [selectedOrg, setSelectedOrg] = useState<number | undefined>(undefined);
  const [range, setRange] = useState<{ from: number; to: number }>({ from: yearNow - 2, to: yearNow });

  const { data: emissions, loading: emLoading, fromApi: emFromApi } = useEmissions(selectedOrg, range.from, range.to);

  const totals = useMemo(() => {
    const total = sum(emissions, e => e.totalEmissions);
    const s1 = sum(emissions, e => e.scope1);
    const s2 = sum(emissions, e => e.scope2);
    const s3 = sum(emissions, e => e.scope3);
    const verifiedCnt = emissions.filter(e => (e.verificationStatus ?? "").toLowerCase() === "approved").length;
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
      m.total  += e.totalEmissions || 0;
      map.set(e.year, m);
    }
    return [...map.values()].sort((a,b) => a.year - b.year);
  }, [emissions]);

  const pieData = useMemo(() => (
    [
      { name: "Scope 1", value: totals.s1 || 0 },
      { name: "Scope 2", value: totals.s2 || 0 },
      { name: "Scope 3", value: totals.s3 || 0 },
    ]
  ), [totals]);

  const orgNameOf = (e: Emission) => e.organization?.name || e.organizationName || `#${e.organization?.id ?? "-"}`;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Impact Tracker</h1>
          <p className="text-sm text-muted-foreground">Organizations & Greenhouse Gas Emissions (tCO₂e)</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            <Database className="w-4 h-4 mr-1" /> {orgsFromApi && emFromApi ? "API" : "Mock"}
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl">
        <CardContent className="p-4 grid md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">조직</div>
        <Select value={selectedOrg ? String(selectedOrg) : "all"}
        onValueChange={(v: string) => setSelectedOrg(v === "all" ? undefined : Number(v))}>    
                  <SelectTrigger>
                <SelectValue placeholder="All organizations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All organizations</SelectItem>
                {orgs.map(o => (
                  <SelectItem key={o.id} value={String(o.id)}>{o.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">From Year</div>
<Input
  type="number"
  value={range.from}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
    setRange(r => ({ ...r, from: Number(e.target.value) }))
  }
/>          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">To Year</div>
<Input
  type="number"
  value={range.to}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
    setRange(r => ({ ...r, to: Number(e.target.value) }))
  }
/>          </div>
          <div className="flex items-end">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full"><Building2 className="w-4 h-4 mr-2"/>조직 목록</Button>
              </SheetTrigger>
              <SheetContent className="w-[520px] sm:w-[640px]">
                <SheetHeader>
                  <SheetTitle>Organizations</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-2 max-h-[70vh] overflow-auto pr-2">
                  {orgsLoading ? (
                    <div className="flex items-center justify-center p-10 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Loading…</div>
                  ) : (
                    orgs.map(o => (
                      <div key={o.id} className="border rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <div className="font-medium">{o.name}</div>
                          <div className="text-xs text-muted-foreground">#{o.id} · {o.type || "listed"}</div>
                        </div>
                        <Button size="sm" variant="secondary" onClick={() => setSelectedOrg(o.id)}>View</Button>
                      </div>
                    ))
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid md:grid-cols-4 gap-4">
        <KpiCard label="Total Emissions" value={`${fmt.format(Math.round(totals.total))} tCO₂e`} sub={`${range.from}–${range.to}${selectedOrg ? " · Org #" + selectedOrg : " · All"}`} />
        <KpiCard label="Scope 1" value={`${fmt.format(Math.round(totals.s1))} t`} />
        <KpiCard label="Scope 2" value={`${fmt.format(Math.round(totals.s2))} t`} />
        <KpiCard label="Scope 3" value={`${fmt.format(Math.round(totals.s3))} t`} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Emissions by Year</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {emLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Loading…</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byYear}>
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="scope1" name="Scope 1" stackId="a" />
                  <Bar dataKey="scope2" name="Scope 2" stackId="a" />
                  <Bar dataKey="scope3" name="Scope 3" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Scope Share</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label />
                {pieData.map((_, i) => (<Cell key={i} />))}
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Verification</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <div className="grid grid-cols-2 gap-3 h-full">
              <div className="col-span-2">
                <KpiCard label="Approval Rate" value={`${totals.rate}%`} sub={`${totals.verifiedCnt}/${emissions.length} approved`} />
              </div>
              <div className="col-span-2 text-sm text-muted-foreground">
                <p>Based on emissions.verificationStatus over the selected range.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail table */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Emissions Records ({emissions.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 pr-4">Year</th>
                <th className="py-2 pr-4">Organization</th>
                <th className="py-2 pr-4">Scope 1</th>
                <th className="py-2 pr-4">Scope 2</th>
                <th className="py-2 pr-4">Scope 3</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Source</th>
              </tr>
            </thead>
            <tbody>
              {emLoading ? (
                <tr><td colSpan={8} className="p-6 text-center text-muted-foreground"><Loader2 className="inline mr-2 h-4 w-4 animate-spin"/>Loading…</td></tr>
              ) : emissions.length === 0 ? (
                <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">No records</td></tr>
              ) : (
                emissions
                  .sort((a,b) => (a.year - b.year) || ((a.organization?.id ?? 0) - (b.organization?.id ?? 0)))
                  .map(e => (
                    <tr key={e.id} className="border-t">
                      <td className="py-2 pr-4">{e.year}</td>
                      <td className="py-2 pr-4">{orgNameOf(e)}</td>
                      <td className="py-2 pr-4">{fmt.format(Math.round(e.scope1 || 0))}</td>
                      <td className="py-2 pr-4">{fmt.format(Math.round(e.scope2 || 0))}</td>
                      <td className="py-2 pr-4">{fmt.format(Math.round(e.scope3 || 0))}</td>
                      <td className="py-2 pr-4 font-medium">{fmt.format(Math.round(e.totalEmissions || 0))}</td>
                      <td className="py-2 pr-4">
                        <Badge variant={(e.verificationStatus || "").toLowerCase() === "approved" ? "default" : "secondary"}>
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

      <div className="text-xs text-muted-foreground text-center py-2">
        <div className="flex justify-center items-center gap-2"><Factory className="w-3 h-3"/> Connected to {orgsFromApi && emFromApi ? "Backend API" : "Mock data"}.</div>
      </div>
    </div>
  );
}
