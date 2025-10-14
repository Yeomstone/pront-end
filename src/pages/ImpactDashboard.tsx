import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Database, 
  Users, 
  ArrowRight,
  Heart,
  Clock,
  DollarSign,
  Leaf,
  Activity,
  Calendar,
  Building2,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fmt = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 });

function KpiCard({ icon: Icon, title, value, unit, trend, color, onClick }: any) {
  return (
    <Card className="rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-0 bg-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg flex-shrink-0`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend !== 0 && (
            <Badge variant={trend > 0 ? "default" : "secondary"} className="rounded-full px-3 py-1.5">
              <TrendingUp className="w-3 h-3 mr-1.5 inline-block" />
              <span>{trend > 0 ? '+' : ''}{trend}%</span>
            </Badge>
          )}
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-600">{title}</div>
          <div className="text-3xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{unit}</div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClick}
          className="w-full mt-4 group bg-gray-50 hover:bg-blue-50 text-gray-900 hover:text-blue-700 font-medium transition-all h-11 px-4"
        >
          <span className="inline-block">상세보기</span>
          <ArrowRight className="w-4 h-4 ml-2 inline-block group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ImpactDashboard() {
  const navigate = useNavigate();
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [kpiData, setKpiData] = useState({
    emissions: { total: 0, trend: 0 },
    volunteerHours: { total: 38540, trend: 12 },
    donations: { total: 2340000, trend: 8 },
    peopleServed: { total: 953800, trend: 15 }
  });
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [recentEmissions, setRecentEmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const orgsResponse = await fetch(`${API_BASE}/api/organizations`);
      setIsApiConnected(orgsResponse.ok);

      if (!orgsResponse.ok) throw new Error('API 연결 실패');

      const orgsData = await orgsResponse.json();
      setOrganizations(orgsData);

      const currentYear = new Date().getFullYear();
      const emissionsResponse = await fetch(
        `${API_BASE}/api/emissions?fromYear=${currentYear - 2}&toYear=${currentYear}`
      );
      
      if (emissionsResponse.ok) {
        const emissionsData = await emissionsResponse.json();
        setRecentEmissions(emissionsData.slice(0, 5));
        calculateKpiData(emissionsData, currentYear);
      }
    } catch (error) {
      console.error('❌ Dashboard data load failed:', error);
      setIsApiConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const calculateKpiData = (emissions: any[], currentYear: number) => {
    const thisYear = emissions.filter(e => e.year === currentYear);
    const lastYear = emissions.filter(e => e.year === currentYear - 1);

    const thisYearTotal = thisYear.reduce((sum, e) => sum + (Number(e.totalEmissions) || 0), 0);
    const lastYearTotal = lastYear.reduce((sum, e) => sum + (Number(e.totalEmissions) || 0), 0);
    
    const emissionsTrend = lastYearTotal > 0 
      ? Math.round(((thisYearTotal - lastYearTotal) / lastYearTotal) * 100)
      : 0;

    const totalEmissions = emissions.reduce((sum, e) => sum + (Number(e.totalEmissions) || 0), 0);

    setKpiData(prev => ({
      ...prev,
      emissions: { 
        total: Math.round(totalEmissions), 
        trend: emissionsTrend 
      }
    }));
  };

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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', background: 'linear-gradient(to bottom right, #2563eb, #1e40af)', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <Activity style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', background: 'linear-gradient(to right, #2563eb, #1e40af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  소셜 임팩트 트래커
                </h1>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>데이터 기반 사회적 영향 측정 플랫폼</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Badge variant={isApiConnected ? "default" : "secondary"} className="rounded-full px-4 py-2">
                <Database className="w-4 h-4 mr-2 inline-block" />
                <span>{isApiConnected ? "실시간 데이터" : "연결 대기"}</span>
              </Badge>
              <Button variant="outline" className="h-10 px-6">
                <span>대시보드</span>
              </Button>
              <Button variant="ghost" className="h-10 px-6 hidden md:inline-flex">
                <span>프로젝트</span>
              </Button>
              <Button variant="ghost" className="h-10 px-6 hidden md:inline-flex">
                <span>조직</span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full w-10 h-10">
                <Users className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Hero 섹션 */}
          <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(to bottom right, #2563eb, #1e3a8a)', borderRadius: '24px', padding: '40px', color: 'white', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '384px', height: '384px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(80px)', transform: 'translate(50%, -50%)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '384px', height: '384px', background: 'rgba(96,165,250,0.2)', borderRadius: '50%', filter: 'blur(80px)', transform: 'translate(-50%, 50%)' }} />
            
            <div style={{ position: 'relative', zIndex: 10 }}>
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                <CheckCircle2 className="w-3 h-3 mr-1.5 inline-block" />
                <span>{organizations.length}개 조직 데이터 연동</span>
              </Badge>
              <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>실시간 임팩트 측정</h2>
              <p style={{ fontSize: '18px', color: '#bfdbfe', marginBottom: '32px' }}>투명하고 검증 가능한 사회적 가치 추적 시스템</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{fmt.format(kpiData.emissions.total)}</div>
                  <div style={{ fontSize: '14px', color: '#bfdbfe', marginTop: '4px' }}>톤 CO₂e 관리</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{fmt.format(kpiData.volunteerHours.total)}</div>
                  <div style={{ fontSize: '14px', color: '#bfdbfe', marginTop: '4px' }}>봉사 시간</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold' }}>₩{fmt.format(Math.round(kpiData.donations.total / 10000))}만</div>
                  <div style={{ fontSize: '14px', color: '#bfdbfe', marginTop: '4px' }}>기부금</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{fmt.format(kpiData.peopleServed.total)}</div>
                  <div style={{ fontSize: '14px', color: '#bfdbfe', marginTop: '4px' }}>수혜 인원</div>
                </div>
              </div>
            </div>
          </div>

          {/* KPI 카드 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>핵심 성과 지표</h2>
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>실시간으로 추적되는 주요 임팩트 데이터</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
                <Calendar className="w-4 h-4" />
                <span>최근 12개월</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              <KpiCard
                icon={Leaf}
                title="온실가스 배출량"
                value={fmt.format(kpiData.emissions.total)}
                unit="톤 CO₂e"
                trend={kpiData.emissions.trend}
                color="from-green-500 to-emerald-600"
                onClick={() => navigate('/emissions')}
              />
              <KpiCard
                icon={Clock}
                title="자원봉사 시간"
                value={fmt.format(kpiData.volunteerHours.total)}
                unit="시간"
                trend={kpiData.volunteerHours.trend}
                color="from-blue-500 to-blue-600"
                onClick={() => {}}
              />
              <KpiCard
                icon={DollarSign}
                title="기부금"
                value={`₩${fmt.format(Math.round(kpiData.donations.total / 10000))}만`}
                unit="총 기부액"
                trend={kpiData.donations.trend}
                color="from-purple-500 to-purple-600"
                onClick={() => {}}
              />
              <KpiCard
                icon={Heart}
                title="수혜 인원"
                value={fmt.format(kpiData.peopleServed.total)}
                unit="명"
                trend={kpiData.peopleServed.trend}
                color="from-pink-500 to-rose-600"
                onClick={() => {}}
              />
            </div>
          </div>

          {/* 최근 활동 */}
          <Card className="rounded-2xl shadow-md border-0">
            <CardHeader>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <CardTitle className="text-xl font-bold">최근 등록된 배출량 데이터</CardTitle>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>검증된 온실가스 배출 정보</p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/emissions')}
                  className="h-10 px-6"
                >
                  <span className="inline-block">전체보기</span>
                  <ArrowRight className="w-4 h-4 ml-2 inline-block" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentEmissions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7280' }}>등록된 배출량 데이터가 없습니다.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recentEmissions.map((emission) => (
                    <div 
                      key={emission.id}
                      onClick={() => navigate('/emissions')}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f9fafb', borderRadius: '12px', cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                        <div style={{ padding: '12px', background: '#d1fae5', borderRadius: '8px' }}>
                          <Building2 style={{ width: '20px', height: '20px', color: '#059669' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {emission.organizationName}
                          </div>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>
                            {emission.year}년 • {fmt.format(Math.round(Number(emission.totalEmissions) || 0))} tCO₂e
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={emission.verificationStatus === '검증완료' ? 'default' : 'secondary'}
                        className="rounded-full"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1.5 inline-block" />
                        <span>{emission.verificationStatus}</span>
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 조직 현황 */}
          <Card className="rounded-2xl shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-xl font-bold">등록된 조직 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ textAlign: 'center', padding: '24px', background: 'linear-gradient(to bottom right, #dbeafe, #bfdbfe)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#1e40af' }}>{organizations.length}</div>
                  <div style={{ fontSize: '14px', color: '#1e3a8a', marginTop: '8px' }}>총 등록 조직</div>
                </div>
                <div style={{ textAlign: 'center', padding: '24px', background: 'linear-gradient(to bottom right, #d1fae5, #a7f3d0)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#047857' }}>
                    {organizations.filter(o => o.type === '상장사').length}
                  </div>
                  <div style={{ fontSize: '14px', color: '#065f46', marginTop: '8px' }}>상장 기업</div>
                </div>
                <div style={{ textAlign: 'center', padding: '24px', background: 'linear-gradient(to bottom right, #e9d5ff, #d8b4fe)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#7c3aed' }}>{recentEmissions.length}</div>
                  <div style={{ fontSize: '14px', color: '#6b21a8', marginTop: '8px' }}>최근 배출량 기록</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 푸터 */}
      <footer style={{ width: '100%', background: 'white', borderTop: '1px solid #e5e7eb', marginTop: '64px' }}>
        <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>© 2025 소셜 임팩트 트래커. All rights reserved.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
              <a href="#" style={{ transition: 'color 0.2s' }}>개인정보처리방침</a>
              <a href="#" style={{ transition: 'color 0.2s' }}>이용약관</a>
              <a href="#" style={{ transition: 'color 0.2s' }}>고객지원</a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}