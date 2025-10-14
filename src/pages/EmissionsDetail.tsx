import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Database, 
  Download,
  TrendingUp,
  TrendingDown,
  Factory,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Filter,
  BarChart3,
  Activity,
  Loader2,
  Search,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const fmt = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 });

export default function EmissionsDetail() {
  const navigate = useNavigate();
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [emissions, setEmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEmissions, setLoadingEmissions] = useState(false);
  
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [quickRange, setQuickRange] = useState('3years');
  const [range, setRange] = useState({ from: 2022, to: 2024 });

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
  const yearNow = new Date().getFullYear();

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (organizations.length > 0 || !selectedOrg) {
      loadEmissions();
    }
  }, [selectedOrg, range]);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/emissions/organizations`);
      setIsApiConnected(response.ok);

      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      }
    } catch (error) {
      console.error('❌ Organization load failed:', error);
      setIsApiConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const loadEmissions = async () => {
    setLoadingEmissions(true);
    try {
      let url = `${API_BASE}/api/emissions?fromYear=${range.from}&toYear=${range.to}`;
      if (selectedOrg) {
        url += `&orgId=${selectedOrg}`;
      }

      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setEmissions(data);
      }
    } catch (error) {
      console.error('❌ Emissions load failed:', error);
    } finally {
      setLoadingEmissions(false);
    }
  };

  const filteredOrganizations = useMemo(() => {
    if (!searchTerm) return [];
    return organizations.filter(org => 
      org.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [organizations, searchTerm]);

  const filteredEmissions = useMemo(() => {
    return emissions.filter(e => 
      e.year >= range.from && e.year <= range.to &&
      (!selectedOrg || e.organizationId === Number(selectedOrg))
    );
  }, [emissions, range, selectedOrg]);

  const totals = useMemo(() => {
    const total = filteredEmissions.reduce((sum, e) => sum + (Number(e.totalEmissions) || 0), 0);
    const verifiedCnt = filteredEmissions.filter(e => e.verificationStatus === '검증완료').length;
    const rate = filteredEmissions.length > 0 
      ? Math.round((verifiedCnt / filteredEmissions.length) * 100) 
      : 0;

    const thisYear = filteredEmissions.filter(e => e.year === yearNow);
    const lastYear = filteredEmissions.filter(e => e.year === yearNow - 1);
    const currTotal = thisYear.reduce((sum, e) => sum + (Number(e.totalEmissions) || 0), 0);
    const prevTotal = lastYear.reduce((sum, e) => sum + (Number(e.totalEmissions) || 0), 0);
    const trend = prevTotal > 0 
      ? Math.round(((currTotal - prevTotal) / prevTotal) * 100) 
      : 0;
    
    return { total, verifiedCnt, rate, trend };
  }, [filteredEmissions, yearNow]);

  const byYear = useMemo(() => {
    const map = new Map();
    for (const e of filteredEmissions) {
      const m = map.get(e.year) ?? { year: e.year, total: 0 };
      m.total += Number(e.totalEmissions) || 0;
      map.set(e.year, m);
    }
    return [...map.values()].sort((a, b) => a.year - b.year);
  }, [filteredEmissions]);

  const handleQuickRange = (rangeType: string) => {
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

  const exportToCSV = () => {
    const headers = ['조직명', '연도', '총배출량', '검증상태'];
    const rows = filteredEmissions.map(e => [
      e.organizationName,
      e.year,
      Number(e.totalEmissions) || 0,
      e.verificationStatus
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `emissions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const selectedOrgName = selectedOrg ? organizations.find(o => o.id === Number(selectedOrg))?.name : '';

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, #f9fafb, #eff6ff)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 style={{ 
            width: '48px', 
            height: '48px', 
            margin: '0 auto 16px auto', 
            display: 'block',
            animation: 'spin 1s linear infinite',
            color: '#2563eb'
          }} />
          <p style={{ color: '#4b5563' }}>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: 'linear-gradient(to bottom right, #f9fafb, #eff6ff)' }}>
      {/* 헤더 */}
      <header style={{ width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')}
              className="rounded-full w-10 h-10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <div style={{ padding: '8px', background: 'linear-gradient(to bottom right, #10b981, #059669)', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <Factory style={{ width: '20px', height: '20px', color: 'white' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', background: 'linear-gradient(to right, #059669, #047857)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  온실가스 배출량 분석
                </h1>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>기업별 온실가스 배출량 추적 및 분석 (단위: tCO₂e)</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Badge variant={isApiConnected ? "default" : "secondary"} className="rounded-full px-4 py-2">
                <Database className="w-4 h-4 mr-2 inline-block" />
                <span>{isApiConnected ? "실시간 데이터" : "연결 대기"}</span>
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportToCSV}
                className="h-10 px-4"
              >
                <Download className="w-4 h-4 mr-2 inline-block" />
                <span className="inline-block">CSV 내보내기</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 필터 섹션 */}
          <Card className="rounded-2xl shadow-md border-0">
            <CardContent className="p-6">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 style={{ fontWeight: 600, color: '#111827' }}>필터 설정</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {/* 조직 검색 */}
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                    조직 검색
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9ca3af', pointerEvents: 'none' }} />
                    <Input
                      placeholder="조직명 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ paddingLeft: '36px', height: '40px' }}
                    />
                  </div>
                  
                  {/* 검색 결과 드롭다운 - 5-6개 높이 + 스크롤 */}
                  {searchTerm && filteredOrganizations.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '4px',
                      background: 'white',
                      border: '2px solid #3b82f6',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      zIndex: 1000,
                      maxHeight: '240px',
                      overflowY: 'auto'
                    }}>
                      {filteredOrganizations.map((org) => (
                        <button
                          key={org.id}
                          onClick={() => {
                            setSelectedOrg(String(org.id));
                            setSearchTerm('');
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '12px 16px',
                            borderBottom: '1px solid #e5e7eb',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            background: 'white'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#eff6ff'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                        >
                          <div style={{ fontWeight: 500, color: '#111827' }}>{org.name}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                            {org.type || '조직'}
                          </div>
                        </button>
                      ))}
                      <div style={{ padding: '8px 16px', background: '#f9fafb', borderTop: '1px solid #e5e7eb', fontSize: '12px', color: '#6b7280' }}>
                        {filteredOrganizations.length}개 검색 결과
                      </div>
                    </div>
                  )}
                  
                  {/* 선택된 조직 표시 */}
                  {selectedOrg && selectedOrgName && (
                    <div style={{ marginTop: '8px' }}>
                      <Badge variant="secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <span>{selectedOrgName}</span>
                        <button
                          onClick={() => setSelectedOrg('')}
                          style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    </div>
                  )}
                </div>

                {/* 기간 선택 */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                    기간 선택
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      variant={quickRange === '1year' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleQuickRange('1year')}
                      style={{ flex: 1, height: '40px' }}
                    >
                      <span>1년</span>
                    </Button>
                    <Button
                      variant={quickRange === '3years' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleQuickRange('3years')}
                      style={{ flex: 1, height: '40px' }}
                    >
                      <span>3년</span>
                    </Button>
                    <Button
                      variant={quickRange === '5years' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleQuickRange('5years')}
                      style={{ flex: 1, height: '40px' }}
                    >
                      <span>5년</span>
                    </Button>
                  </div>
                </div>

                {/* 시작 연도 */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                    시작 연도
                  </label>
                  <select
                    value={range.from}
                    onChange={(e) => setRange(prev => ({ ...prev, from: Number(e.target.value) }))}
                    style={{ width: '100%', height: '40px', padding: '0 12px', background: 'white', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  >
                    {Array.from({ length: 10 }, (_, i) => yearNow - 9 + i).map(y => (
                      <option key={y} value={y}>{y}년</option>
                    ))}
                  </select>
                </div>

                {/* 종료 연도 */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                    종료 연도
                  </label>
                  <select
                    value={range.to}
                    onChange={(e) => setRange(prev => ({ ...prev, to: Number(e.target.value) }))}
                    style={{ width: '100%', height: '40px', padding: '0 12px', background: 'white', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  >
                    {Array.from({ length: 10 }, (_, i) => yearNow - 9 + i).map(y => (
                      <option key={y} value={y}>{y}년</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {loadingEmissions ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <Loader2 style={{ 
                width: '32px', 
                height: '32px', 
                margin: '0 auto 8px auto', 
                display: 'block',
                animation: 'spin 1s linear infinite',
                color: '#2563eb'
              }} />
              <p style={{ fontSize: '14px', color: '#6b7280' }}>배출량 데이터 조회 중...</p>
            </div>
          ) : (
            <>
              {/* 요약 통계 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                <Card className="rounded-2xl shadow-md border-0">
                  <CardContent className="p-6">
                    <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ padding: '12px', background: 'linear-gradient(to bottom right, #10b981, #059669)', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      {totals.trend !== 0 && (
                        <Badge variant={totals.trend < 0 ? "default" : "destructive"} className="rounded-full">
                          {totals.trend < 0 ? <TrendingDown className="w-3 h-3 mr-1.5 inline-block" /> : <TrendingUp className="w-3 h-3 mr-1.5 inline-block" />}
                          <span>{Math.abs(totals.trend)}%</span>
                        </Badge>
                      )}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280', marginBottom: '8px' }}>총 배출량</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{fmt.format(Math.round(totals.total))}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>tCO₂e</div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-md border-0">
                  <CardContent className="p-6">
                    <div style={{ padding: '12px', background: 'linear-gradient(to bottom right, #3b82f6, #2563eb)', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: 'fit-content', marginBottom: '16px' }}>
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280', marginBottom: '8px' }}>데이터 수</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{filteredEmissions.length}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>개 기록</div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-md border-0">
                  <CardContent className="p-6">
                    <div style={{ padding: '12px', background: 'linear-gradient(to bottom right, #8b5cf6, #7c3aed)', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: 'fit-content', marginBottom: '16px' }}>
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280', marginBottom: '8px' }}>검증 완료율</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{totals.rate}%</div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                      {totals.verifiedCnt}/{filteredEmissions.length}개 검증
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-md border-0">
                  <CardContent className="p-6">
                    <div style={{ padding: '12px', background: 'linear-gradient(to bottom right, #f97316, #ea580c)', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: 'fit-content', marginBottom: '16px' }}>
                      <Factory className="w-6 h-6 text-white" />
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280', marginBottom: '8px' }}>참여 조직</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                      {new Set(filteredEmissions.map(e => e.organizationId)).size}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>개 조직</div>
                  </CardContent>
                </Card>
              </div>

              {/* 차트 */}
              <Card className="rounded-2xl shadow-md border-0">
                <CardHeader>
                  <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span>연도별 배출량 추이</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={byYear}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="year" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        name="총 배출량" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 상세 데이터 테이블 */}
              <Card className="rounded-2xl shadow-md border-0">
                <CardHeader>
                  <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Database className="w-5 h-5 text-gray-600" />
                    <span>상세 배출량 데이터</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredEmissions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 0', color: '#6b7280' }}>
                      <AlertCircle style={{ width: '48px', height: '48px', margin: '0 auto 16px auto', color: '#9ca3af' }} />
                      선택한 기간에 배출량 데이터가 없습니다.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#374151' }}>조직명</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#374151' }}>연도</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: '#374151' }}>총배출량</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#374151' }}>검증상태</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEmissions.slice(0, 50).map((emission, idx) => (
                            <tr 
                              key={emission.id} 
                              style={{ 
                                borderBottom: '1px solid #e5e7eb', 
                                background: idx % 2 === 0 ? 'white' : '#f9fafb',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                              onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#f9fafb'}
                            >
                              <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                                <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {emission.organizationName}
                                </div>
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#374151' }}>
                                {emission.year}
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                                {fmt.format(Math.round(Number(emission.totalEmissions) || 0))}
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                <Badge 
                                  variant={emission.verificationStatus === '검증완료' ? 'default' : 'secondary'}
                                  className="rounded-full"
                                >
                                  {emission.verificationStatus === '검증완료' ? (
                                    <CheckCircle2 className="w-3 h-3 mr-1.5 inline-block" />
                                  ) : (
                                    <AlertCircle className="w-3 h-3 mr-1.5 inline-block" />
                                  )}
                                  <span>{emission.verificationStatus}</span>
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredEmissions.length > 50 && (
                        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
                          상위 50개 항목만 표시됩니다. 전체 데이터를 보려면 CSV를 다운로드하세요.
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}