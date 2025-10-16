import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity, Leaf, Clock, DollarSign, Users, Database,
  TrendingUp, TrendingDown, Calendar, CheckCircle2,
  BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const fmt = new Intl.NumberFormat('ko-KR');

// 전문적이고 모던한 색상 팔레트
const COLORS = {
  primary: '#0F172A',       // 다크 슬레이트
  secondary: '#64748B',     // 슬레이트 그레이
  accent: '#0EA5E9',        // 스카이 블루
  success: '#10B981',       // 에메랄드
  warning: '#F59E0B',       // 앰버
  info: '#6366F1',          // 인디고
  background: '#F8FAFC',    // 라이트
  cardBg: '#FFFFFF',
  border: '#E2E8F0',
};

const CHART_COLORS = ['#0EA5E9', '#10B981', '#6366F1', '#F59E0B', '#EC4899'];

const KpiCard = ({ icon: Icon, title, value, unit, trend, color, onClick }) => (
  <Card 
    onClick={onClick}
    style={{ 
      borderRadius: '12px', 
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)', 
      border: `1px solid ${COLORS.border}`,
      background: COLORS.cardBg,
      cursor: 'pointer',
      transition: 'all 0.2s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.12)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(15, 23, 42, 0.08)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
  >
    <CardContent style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'start', 
        justifyContent: 'space-between', 
        marginBottom: '14px' 
      }}>
        <div style={{ 
          padding: '10px', 
          background: `${color}10`,
          borderRadius: '10px'
        }}>
          <Icon style={{ width: '20px', height: '20px', color: color }} />
        </div>
        {trend !== 0 && (
          <Badge 
            variant={trend > 0 ? 'default' : 'destructive'}
            style={{ 
              borderRadius: '5px',
              padding: '3px 8px',
              fontSize: '11px',
              fontWeight: 600
            }}
          >
            {trend > 0 ? <TrendingUp size={12} style={{ marginRight: '3px' }} /> 
                      : <TrendingDown size={12} style={{ marginRight: '3px' }} />}
            {Math.abs(trend)}%
          </Badge>
        )}
      </div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: COLORS.secondary, marginBottom: '7px' }}>
        {title}
      </div>
      <div style={{ fontSize: '28px', fontWeight: 700, color: COLORS.primary, marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '13px', color: COLORS.secondary }}>{unit}</div>
    </CardContent>
  </Card>
);

export default function ImpactDashboard() {
  const navigate = useNavigate();
  const [isApiConnected, setIsApiConnected] = useState(false);
  
  const [kpiData] = useState({
    emissions: { total: 125800, trend: -12 },
    volunteerHours: { total: 45200, trend: 18 },
    donations: { total: 8500000, trend: 25 },
    peopleServed: { total: 127500, trend: 15 }
  });

  const projectData = [
    { name: '재생에너지', emissions: 42000, hours: 1200, amount: 3200000 },
    { name: '교육지원', emissions: 15000, hours: 8500, amount: 2100000 },
    { name: '친환경 캠페인', emissions: 28000, hours: 5200, amount: 1800000 },
    { name: '지역사회 봉사', emissions: 18000, hours: 12500, amount: 950000 },
    { name: '환경보호', emissions: 22800, hours: 17800, amount: 450000 }
  ];

  const pieData = [
    { name: '재생에너지', value: 33.4 },
    { name: '교육지원', value: 11.9 },
    { name: '친환경 캠페인', value: 22.3 },
    { name: '지역사회', value: 14.3 },
    { name: '환경보호', value: 18.1 }
  ];

  useEffect(() => {
    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
      const response = await fetch(`${API_BASE}/api/emissions/organizations`);
      setIsApiConnected(response.ok);
    } catch (error) {
      console.error('❌ API 연결 확인 실패:', error);
      setIsApiConnected(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw', 
      background: COLORS.background,
      margin: 0,
      padding: 0,
      boxSizing: 'border-box'
    }}>
      {/* 헤더 */}
      <header style={{ 
        width: '100vw', 
        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(10px)', 
        borderBottom: `1px solid ${COLORS.border}`,
        position: 'sticky', 
        top: 0, 
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
        margin: 0,
        padding: 0
      }}>
        <div style={{ 
          width: '100%',
          padding: '14px 28px',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                padding: '8px', 
                background: COLORS.primary,
                borderRadius: '10px'
              }}>
                <Activity style={{ width: '20px', height: '20px', color: 'white' }} />
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '20px', 
                  fontWeight: 700,
                  color: COLORS.primary,
                  marginBottom: '1px',
                  letterSpacing: '-0.3px'
                }}>
                  Social Impact Tracker
                </h1>
                <p style={{ fontSize: '13px', color: COLORS.secondary, fontWeight: 500 }}>
                  실시간 사회적 임팩트 대시보드
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Badge 
                variant={isApiConnected ? "default" : "secondary"}
                style={{ 
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: isApiConnected ? COLORS.success : COLORS.secondary
                }}
              >
                <Database style={{ width: '13px', height: '13px', marginRight: '5px' }} />
                {isApiConnected ? "연결됨" : "대기"}
              </Badge>
              <Button 
                variant="ghost"
                style={{ 
                  height: '32px',
                  padding: '0 14px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '12px',
                  color: COLORS.primary
                }}
              >
                대시보드
              </Button>
              <Button 
                variant="ghost"
                style={{ 
                  height: '32px',
                  padding: '0 14px',
                  borderRadius: '6px',
                  fontWeight: 500,
                  fontSize: '12px',
                  color: COLORS.secondary
                }}
              >
                프로젝트
              </Button>
              <Button 
                variant="ghost"
                style={{ 
                  height: '32px',
                  padding: '0 14px',
                  borderRadius: '6px',
                  fontWeight: 500,
                  fontSize: '12px',
                  color: COLORS.secondary
                }}
              >
                조직
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main style={{ 
        width: '100vw',
        padding: '24px',
        boxSizing: 'border-box',
        margin: 0
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          {/* Hero 섹션 */}
          <div style={{ 
            position: 'relative', 
            overflow: 'hidden', 
            background: `linear-gradient(135deg, ${COLORS.primary} 0%, #1E293B 100%)`,
            borderRadius: '12px', 
            padding: '40px', 
            color: 'white'
          }}>
            <div style={{ position: 'relative', zIndex: 10 }}>
              <Badge 
                style={{ 
                  marginBottom: '12px',
                  background: 'rgba(255,255,255,0.12)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.15)',
                  padding: '5px 12px',
                  borderRadius: '5px',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                <CheckCircle2 style={{ width: '13px', height: '13px', marginRight: '5px' }} />
                시스템 정상 운영 중
              </Badge>
              <h2 style={{ 
                fontSize: '30px', 
                fontWeight: 700, 
                marginBottom: '10px',
                lineHeight: 1.2,
                letterSpacing: '-0.5px'
              }}>
                데이터 기반 사회적 가치 측정
              </h2>
              <p style={{ 
                fontSize: '15px', 
                color: 'rgba(255,255,255,0.85)', 
                marginBottom: '28px',
                maxWidth: '700px',
                lineHeight: 1.6
              }}>
                실시간 분석을 통해 온실가스 감축, 봉사활동, 기부금액, 수혜 인원을 
                정확하게 추적하고 지속가능한 의사결정을 지원합니다.
              </p>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '16px',
                maxWidth: '100%'
              }}>
                <div style={{ 
                  background: 'rgba(255,255,255,0.08)', 
                  backdropFilter: 'blur(10px)', 
                  borderRadius: '10px', 
                  padding: '20px', 
                  border: '1px solid rgba(255,255,255,0.12)' 
                }}>
                  <div style={{ fontSize: '26px', fontWeight: 700, marginBottom: '5px' }}>
                    {fmt.format(kpiData.emissions.total)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                    온실가스 감축 (tCO₂e)
                  </div>
                </div>
                <div style={{ 
                  background: 'rgba(255,255,255,0.08)', 
                  backdropFilter: 'blur(10px)', 
                  borderRadius: '10px', 
                  padding: '20px', 
                  border: '1px solid rgba(255,255,255,0.12)' 
                }}>
                  <div style={{ fontSize: '26px', fontWeight: 700, marginBottom: '5px' }}>
                    {fmt.format(kpiData.volunteerHours.total)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                    봉사활동 시간
                  </div>
                </div>
                <div style={{ 
                  background: 'rgba(255,255,255,0.08)', 
                  backdropFilter: 'blur(10px)', 
                  borderRadius: '10px', 
                  padding: '20px', 
                  border: '1px solid rgba(255,255,255,0.12)' 
                }}>
                  <div style={{ fontSize: '26px', fontWeight: 700, marginBottom: '5px' }}>
                    {fmt.format(kpiData.donations.total / 1000)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                    기부금액 (천원)
                  </div>
                </div>
                <div style={{ 
                  background: 'rgba(255,255,255,0.08)', 
                  backdropFilter: 'blur(10px)', 
                  borderRadius: '10px', 
                  padding: '20px', 
                  border: '1px solid rgba(255,255,255,0.12)' 
                }}>
                  <div style={{ fontSize: '26px', fontWeight: 700, marginBottom: '5px' }}>
                    {fmt.format(kpiData.peopleServed.total)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                    수혜 인원
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* KPI 카드 섹션 */}
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: '16px' 
            }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: COLORS.primary, marginBottom: '5px' }}>
                  핵심 성과 지표
                </h2>
                <p style={{ fontSize: '13px', color: COLORS.secondary, fontWeight: 500 }}>
                  실시간으로 추적되는 주요 임팩트 데이터
                </p>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '8px 14px',
                background: 'white',
                borderRadius: '8px',
                border: `1px solid ${COLORS.border}`
              }}>
                <Calendar style={{ width: '15px', height: '15px', color: COLORS.secondary }} />
                <span style={{ fontSize: '13px', color: COLORS.secondary, fontWeight: 600 }}>
                  최근 12개월
                </span>
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '16px',
              width: '100%'
            }}>
              <KpiCard
                icon={Leaf}
                title="온실가스 배출량"
                value={fmt.format(kpiData.emissions.total)}
                unit="톤 CO₂e"
                trend={kpiData.emissions.trend}
                color={COLORS.success}
                onClick={() => navigate('/emissions')}
              />
              <KpiCard
                icon={Clock}
                title="자원봉사 시간"
                value={fmt.format(kpiData.volunteerHours.total)}
                unit="시간"
                trend={kpiData.volunteerHours.trend}
                color={COLORS.accent}
                onClick={() => navigate('/volunteer')}
              />
              <KpiCard
                icon={DollarSign}
                title="기부금액"
                value={fmt.format(kpiData.donations.total / 1000)}
                unit="천원"
                trend={kpiData.donations.trend}
                color={COLORS.info}
                onClick={() => navigate('/donations')}
              />
              <KpiCard
                icon={Users}
                title="수혜 인원"
                value={fmt.format(kpiData.peopleServed.total)}
                unit="명"
                trend={kpiData.peopleServed.trend}
                color={COLORS.warning}
                onClick={() => navigate('/people')}
              />
            </div>
          </div>

          {/* 차트 섹션 */}
          <Tabs defaultValue="projects" style={{ width: '100%' }}>
            <TabsList style={{ 
              marginBottom: '16px',
              background: 'white',
              padding: '5px',
              borderRadius: '8px',
              border: `1px solid ${COLORS.border}`
            }}>
              <TabsTrigger 
                value="projects"
                style={{ 
                  borderRadius: '6px',
                  padding: '8px 20px',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                <BarChart3 size={15} style={{ marginRight: '6px' }} />
                프로젝트별 임팩트
              </TabsTrigger>
              <TabsTrigger 
                value="distribution"
                style={{ 
                  borderRadius: '6px',
                  padding: '8px 20px',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                <PieChartIcon size={15} style={{ marginRight: '6px' }} />
                임팩트 분포
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects">
              <Card style={{ 
                borderRadius: '12px', 
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)', 
                border: `1px solid ${COLORS.border}`,
                background: COLORS.cardBg
              }}>
                <CardHeader style={{ padding: '20px 20px 0 20px' }}>
                  <CardTitle style={{ fontSize: '16px', fontWeight: 700, color: COLORS.primary }}>
                    프로젝트별 성과 비교
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: '20px' }}>
                  <ResponsiveContainer width="100%" height={360}>
                    <BarChart data={projectData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                      <XAxis 
                        dataKey="name" 
                        stroke={COLORS.secondary}
                        style={{ fontSize: '12px', fontWeight: 500 }}
                      />
                      <YAxis 
                        stroke={COLORS.secondary}
                        style={{ fontSize: '12px', fontWeight: 500 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '8px', 
                          border: `1px solid ${COLORS.border}`,
                          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)',
                          fontSize: '12px'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '12px', fontWeight: 500 }}
                      />
                      <Bar dataKey="emissions" name="온실가스 감축 (tCO₂e)" fill={COLORS.success} radius={[6, 6, 0, 0]} />
                      <Bar dataKey="hours" name="봉사시간 (시간)" fill={COLORS.accent} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="distribution">
              <Card style={{ 
                borderRadius: '12px', 
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)', 
                border: `1px solid ${COLORS.border}`,
                background: COLORS.cardBg
              }}>
                <CardHeader style={{ padding: '20px 20px 0 20px' }}>
                  <CardTitle style={{ fontSize: '16px', fontWeight: 700, color: COLORS.primary }}>
                    온실가스 감축 분포
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: '20px' }}>
                  <ResponsiveContainer width="100%" height={360}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                        outerRadius={110}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '8px', 
                          border: `1px solid ${COLORS.border}`,
                          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 최근 활동 */}
          <Card style={{ 
            borderRadius: '12px', 
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)', 
            border: `1px solid ${COLORS.border}`,
            background: COLORS.cardBg
          }}>
            <CardHeader style={{ padding: '20px' }}>
              <CardTitle style={{ fontSize: '16px', fontWeight: 700, color: COLORS.primary }}>
                최근 활동
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '0 20px 20px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { 
                    icon: CheckCircle2, 
                    color: COLORS.success,
                    title: '봉사활동 200시간 인증 완료', 
                    desc: '방과후 교육 프로그램',
                    time: '2일 전'
                  },
                  { 
                    icon: CheckCircle2, 
                    color: COLORS.accent,
                    title: '기부금 7,500만원 전달', 
                    desc: '식량지원 이니셔티브',
                    time: '9일 전'
                  },
                  { 
                    icon: CheckCircle2, 
                    color: COLORS.success,
                    title: '재활용률 95% 달성', 
                    desc: '커뮤니티 가든 프로젝트',
                    time: '12일 전'
                  }
                ].map((activity, idx) => (
                  <div 
                    key={idx}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '14px',
                      padding: '14px',
                      background: COLORS.background,
                      borderRadius: '8px',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#F1F5F9';
                      e.currentTarget.style.transform = 'translateX(3px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = COLORS.background;
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div style={{ 
                      padding: '8px', 
                      background: `${activity.color}10`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <activity.icon style={{ width: '18px', height: '18px', color: activity.color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: 600, 
                        color: COLORS.primary,
                        marginBottom: '3px'
                      }}>
                        {activity.title}
                      </div>
                      <div style={{ fontSize: '12px', color: COLORS.secondary, fontWeight: 500 }}>
                        {activity.desc}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      color: COLORS.secondary,
                      fontWeight: 500
                    }}>
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}