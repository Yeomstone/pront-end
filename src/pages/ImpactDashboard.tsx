import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Leaf, 
  Clock, 
  DollarSign, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Database,
  CheckCircle2,
  Activity,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const fmt = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 });

interface KpiCardProps {
  icon: any;
  title: string;
  value: string;
  unit: string;
  trend: number;
  color: string;
  onClick?: () => void;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon: Icon, title, value, unit, trend, color, onClick }) => (
  <Card 
    onClick={onClick}
    style={{ 
      borderRadius: '20px', 
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
      border: 'none',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.3s',
      background: 'white'
    }}
    onMouseEnter={(e) => {
      if (onClick) {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
      }
    }}
    onMouseLeave={(e) => {
      if (onClick) {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
      }
    }}
  >
    <CardContent style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
        <div style={{ 
          padding: '16px', 
          background: `linear-gradient(135deg, ${color})`, 
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <Icon style={{ width: '28px', height: '28px', color: 'white' }} />
        </div>
        {trend !== 0 && (
          <Badge 
            variant={trend > 0 ? 'default' : 'destructive'}
            style={{ 
              borderRadius: '9999px',
              padding: '8px 14px',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            {trend > 0 ? <TrendingUp style={{ width: '16px', height: '16px', marginRight: '4px' }} /> 
                      : <TrendingDown style={{ width: '16px', height: '16px', marginRight: '4px' }} />}
            {Math.abs(trend)}%
          </Badge>
        )}
      </div>
      <div style={{ fontSize: '16px', fontWeight: 600, color: '#6b7280', marginBottom: '14px' }}>
        {title}
      </div>
      <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#111827', marginBottom: '10px' }}>
        {value}
      </div>
      <div style={{ fontSize: '16px', color: '#6b7280' }}>{unit}</div>
    </CardContent>
  </Card>
);

export default function ImpactDashboard() {
  const navigate = useNavigate();
  const [isApiConnected, setIsApiConnected] = useState(false);
  
  // Mock KPI 데이터
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
    { name: '재생에너지', value: 33.4, color: '#10b981' },
    { name: '교육지원', value: 11.9, color: '#3b82f6' },
    { name: '친환경 캠페인', value: 22.3, color: '#f59e0b' },
    { name: '지역사회', value: 14.3, color: '#8b5cf6' },
    { name: '환경보호', value: 18.1, color: '#ec4899' }
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
      width: '100%', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      {/* 헤더 */}
      <header style={{ 
        width: '100%', 
        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(12px)', 
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          width: '100%',
          padding: '16px 24px',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                padding: '12px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}>
                <Activity style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '28px', 
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '4px'
                }}>
                  Social Impact Tracker
                </h1>
                <p style={{ fontSize: '15px', color: '#6b7280' }}>
                  실시간 사회적 임팩트 대시보드
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Badge 
                variant={isApiConnected ? "default" : "secondary"}
                style={{ 
                  borderRadius: '9999px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                <Database style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                {isApiConnected ? "실시간 연결" : "연결 대기"}
              </Badge>
              <Button 
                variant="outline"
                style={{ 
                  height: '40px',
                  padding: '0 20px',
                  borderRadius: '10px',
                  fontWeight: 500
                }}
              >
                대시보드
              </Button>
              <Button 
                variant="ghost"
                style={{ 
                  height: '40px',
                  padding: '0 20px',
                  borderRadius: '10px'
                }}
              >
                프로젝트
              </Button>
              <Button 
                variant="ghost"
                style={{ 
                  height: '40px',
                  padding: '0 20px',
                  borderRadius: '10px'
                }}
              >
                조직
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                style={{ 
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px'
                }}
              >
                <Users style={{ width: '20px', height: '20px' }} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main style={{ 
        width: '100%',
        padding: '24px',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          {/* Hero 섹션 */}
          <div style={{ 
            position: 'relative', 
            overflow: 'hidden', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            borderRadius: '24px', 
            padding: '48px', 
            color: 'white',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              right: 0, 
              width: '400px', 
              height: '400px', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '50%', 
              filter: 'blur(100px)', 
              transform: 'translate(50%, -50%)' 
            }} />
            <div style={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              width: '400px', 
              height: '400px', 
              background: 'rgba(118, 75, 162, 0.3)', 
              borderRadius: '50%', 
              filter: 'blur(100px)', 
              transform: 'translate(-50%, 50%)' 
            }} />
            
            <div style={{ position: 'relative', zIndex: 10 }}>
              <Badge 
                style={{ 
                  marginBottom: '16px',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                <CheckCircle2 style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                시스템 정상 운영 중
              </Badge>
              <h2 style={{ 
                fontSize: '42px', 
                fontWeight: 'bold', 
                marginBottom: '16px',
                lineHeight: 1.2
              }}>
                우리의 임팩트를 측정하고 개선합니다
              </h2>
              <p style={{ 
                fontSize: '19px', 
                color: 'rgba(255,255,255,0.9)', 
                marginBottom: '28px',
                maxWidth: '600px',
                lineHeight: 1.6
              }}>
                실시간 데이터 분석을 통해 사회적 가치 창출을 추적하고, 
                지속가능한 미래를 위한 의사결정을 지원합니다.
              </p>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr', 
                gap: '24px',
                maxWidth: '100%'
              }}>
                <div style={{ 
                  background: 'rgba(255,255,255,0.15)', 
                  backdropFilter: 'blur(10px)', 
                  borderRadius: '16px', 
                  padding: '28px', 
                  border: '1px solid rgba(255,255,255,0.2)' 
                }}>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
                    {fmt.format(kpiData.emissions.total)}
                  </div>
                  <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.9)' }}>
                    온실가스 감축 (tCO₂e)
                  </div>
                </div>
                <div style={{ 
                  background: 'rgba(255,255,255,0.15)', 
                  backdropFilter: 'blur(10px)', 
                  borderRadius: '16px', 
                  padding: '24px', 
                  border: '1px solid rgba(255,255,255,0.2)' 
                }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                    {fmt.format(kpiData.volunteerHours.total)}
                  </div>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>
                    봉사활동 시간
                  </div>
                </div>
                <div style={{ 
                  background: 'rgba(255,255,255,0.15)', 
                  backdropFilter: 'blur(10px)', 
                  borderRadius: '16px', 
                  padding: '24px', 
                  border: '1px solid rgba(255,255,255,0.2)' 
                }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
                    {fmt.format(kpiData.peopleServed.total)}
                  </div>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>
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
              marginBottom: '28px' 
            }}>
              <div>
                <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
                  핵심 성과 지표
                </h2>
                <p style={{ fontSize: '16px', color: '#6b7280' }}>
                  실시간으로 추적되는 주요 임팩트 데이터
                </p>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '12px 20px',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <Calendar style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                <span style={{ fontSize: '15px', color: '#6b7280', fontWeight: 500 }}>
                  최근 12개월
                </span>
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr 1fr 1fr', 
              gap: '24px',
              width: '100%'
            }}>
              <KpiCard
                icon={Leaf}
                title="온실가스 배출량"
                value={fmt.format(kpiData.emissions.total)}
                unit="톤 CO₂e"
                trend={kpiData.emissions.trend}
                color="#10b981, #059669"
                onClick={() => navigate('/emissions')}
              />
              <KpiCard
                icon={Clock}
                title="자원봉사 시간"
                value={fmt.format(kpiData.volunteerHours.total)}
                unit="시간"
                trend={kpiData.volunteerHours.trend}
                color="#3b82f6, #2563eb"
                onClick={() => navigate('/volunteer')}
              />
              <KpiCard
                icon={DollarSign}
                title="기부금액"
                value={fmt.format(kpiData.donations.total / 1000)}
                unit="천원"
                trend={kpiData.donations.trend}
                color="#f59e0b, #d97706"
                onClick={() => navigate('/donations')}
              />
              <KpiCard
                icon={Users}
                title="수혜 인원"
                value={fmt.format(kpiData.peopleServed.total)}
                unit="명"
                trend={kpiData.peopleServed.trend}
                color="#8b5cf6, #7c3aed"
                onClick={() => navigate('/people-served')}
              />
            </div>
          </div>

          {/* 차트 섹션 */}
          <Tabs defaultValue="projects" style={{ width: '100%' }}>
            <TabsList style={{ 
              marginBottom: '24px',
              background: 'white',
              padding: '8px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <TabsTrigger 
                value="projects"
                style={{ 
                  borderRadius: '8px',
                  padding: '14px 28px',
                  fontSize: '16px',
                  fontWeight: 600
                }}
              >
                프로젝트별 임팩트
              </TabsTrigger>
              <TabsTrigger 
                value="distribution"
                style={{ 
                  borderRadius: '8px',
                  padding: '14px 28px',
                  fontSize: '16px',
                  fontWeight: 600
                }}
              >
                임팩트 분포
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects">
              <Card style={{ 
                borderRadius: '20px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
                border: 'none',
                background: 'white'
              }}>
                <CardHeader style={{ padding: '32px 32px 0 32px' }}>
                  <CardTitle style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    프로젝트별 성과 비교
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: '32px' }}>
                  <ResponsiveContainer width="100%" height={450}>
                    <BarChart data={projectData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#6b7280"
                        style={{ fontSize: '15px', fontWeight: 500 }}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        style={{ fontSize: '15px', fontWeight: 500 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          fontSize: '15px',
                          padding: '12px'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '15px', fontWeight: 500 }}
                      />
                      <Bar 
                        dataKey="emissions" 
                        fill="#10b981" 
                        name="CO₂ 감축 (톤)" 
                        radius={[10, 10, 0, 0]}
                      />
                      <Bar 
                        dataKey="hours" 
                        fill="#3b82f6" 
                        name="봉사시간" 
                        radius={[10, 10, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="distribution">
              <Card style={{ 
                borderRadius: '20px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
                border: 'none',
                background: 'white'
              }}>
                <CardHeader style={{ padding: '32px 32px 0 32px' }}>
                  <CardTitle style={{ fontSize: '22px', fontWeight: 'bold' }}>
                    임팩트 영역별 분포
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: '32px' }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                    gap: '24px',
                    alignItems: 'center'
                  }}>
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            fontSize: '14px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {pieData.map((item, idx) => (
                        <div 
                          key={idx}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '16px',
                            padding: '16px',
                            background: '#f9fafb',
                            borderRadius: '12px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f0fdf4';
                            e.currentTarget.style.transform = 'translateX(4px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f9fafb';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}
                        >
                          <div 
                            style={{ 
                              width: '16px', 
                              height: '16px', 
                              borderRadius: '4px',
                              background: item.color,
                              flexShrink: 0
                            }} 
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontSize: '16px', 
                              fontWeight: 600, 
                              color: '#111827',
                              marginBottom: '6px'
                            }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                              전체의 {item.value}%
                            </div>
                          </div>
                          <div style={{ 
                            fontSize: '24px', 
                            fontWeight: 'bold', 
                            color: item.color 
                          }}>
                            {item.value}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 최근 활동 */}
          <Card style={{ 
            borderRadius: '20px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
            border: 'none',
            background: 'white'
          }}>
            <CardHeader style={{ padding: '32px 32px 28px 32px' }}>
              <CardTitle style={{ fontSize: '24px', fontWeight: 'bold' }}>
                최근 활동 내역
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '0 32px 32px 32px' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { 
                    icon: CheckCircle2, 
                    color: '#10b981', 
                    title: '온실가스 배출량 200톤 감축', 
                    desc: '재생에너지 프로젝트',
                    time: '2일 전'
                  },
                  { 
                    icon: Users, 
                    color: '#3b82f6', 
                    title: '1,500명 교육 프로그램 완료', 
                    desc: '방과후 학습 지원',
                    time: '5일 전'
                  },
                  { 
                    icon: DollarSign, 
                    color: '#f59e0b', 
                    title: '기부금 75만원 전달', 
                    desc: '식량 지원 이니셔티브',
                    time: '9일 전'
                  },
                  { 
                    icon: Activity, 
                    color: '#8b5cf6', 
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
                      gap: '20px',
                      padding: '20px',
                      background: '#f9fafb',
                      borderRadius: '12px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f0fdf4';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div style={{ 
                      padding: '12px', 
                      background: activity.color, 
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <activity.icon style={{ width: '24px', height: '24px', color: 'white' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '17px', 
                        fontWeight: 600, 
                        color: '#111827',
                        marginBottom: '6px'
                      }}>
                        {activity.title}
                      </div>
                      <div style={{ fontSize: '15px', color: '#6b7280' }}>
                        {activity.desc}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '13px', 
                      color: '#9ca3af',
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