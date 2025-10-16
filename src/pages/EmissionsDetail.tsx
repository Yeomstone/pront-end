import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  X,
  ChevronLeft,
  ChevronRight
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
  const [range, setRange] = useState({ from: 2022, to: 2024 });
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  // 초기 로드 시 전체 데이터의 연도 범위 설정
  useEffect(() => {
    if (emissions.length > 0 && !selectedOrg) {
      const years = emissions.map(e => e.year).sort((a, b) => a - b);
      if (years.length > 0) {
        const minYear = years[0];
        const maxYear = years[years.length - 1];
        setRange({ from: minYear, to: maxYear });
      }
    }
  }, [emissions.length]);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/emissions/organizations`);
      setIsApiConnected(response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Organizations loaded:', data.length);
        setOrganizations(data);
      } else {
        console.warn('⚠️ Organizations API returned:', response.status);
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
        console.log('✅ Emissions loaded:', data.length, 'records');
        setEmissions(data);
      } else {
        console.warn('⚠️ Emissions API returned:', response.status);
        setEmissions([]);
      }
    } catch (error) {
      console.error('❌ Emissions load failed:', error);
      setEmissions([]);
    } finally {
      setLoadingEmissions(false);
    }
  };

  const filteredOrganizations = useMemo(() => {
    if (searchTerm) {
      return organizations.filter(org => 
        org.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return organizations;
  }, [organizations, searchTerm]);

  const paginatedOrganizations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrganizations.slice(startIndex, endIndex);
  }, [filteredOrganizations, currentPage]);

  const totalPages = Math.ceil(filteredOrganizations.length / itemsPerPage);

  const exportToCSV = () => {
    const headers = ['조직명', '연도', '총배출량(tCO₂e)', '검증상태'];
    const rows = filteredEmissions.map(e => [
      e.organizationName,
      e.year,
      e.totalEmissions,
      e.verificationStatus
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `emissions_${Date.now()}.csv`;
    link.click();
  };

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
      const m = map.get(e.year) ?? 0;
      map.set(e.year, m + (Number(e.totalEmissions) || 0));
    }
    return Array.from(map.entries())
      .map(([year, total]) => ({ year, total }))
      .sort((a, b) => a.year - b.year);
  }, [filteredEmissions]);

  const selectedOrgName = selectedOrg 
    ? organizations.find(o => o.id === Number(selectedOrg))?.name 
    : '';

  // 선택된 조직의 사용 가능한 연도 목록
  const availableYears = useMemo(() => {
    if (!selectedOrg) {
      // 조직이 선택되지 않았으면 최근 20년
      return Array.from({ length: 20 }, (_, i) => yearNow - i);
    }
    
    // 선택된 조직의 배출량 데이터에서 연도 추출
    const orgEmissions = emissions.filter(e => e.organizationId === Number(selectedOrg));
    const years = [...new Set(orgEmissions.map(e => e.year))].sort((a, b) => b - a);
    
    // 데이터가 있으면 해당 연도들, 없으면 전체 연도
    return years.length > 0 ? years : Array.from({ length: 20 }, (_, i) => yearNow - i);
  }, [selectedOrg, emissions, yearNow]);

  const handleOrgSelect = (orgId: number, orgName: string) => {
    setSelectedOrg(String(orgId));
    setSearchTerm('');
    setShowDropdown(false);
    setCurrentPage(1);
    
    // 선택된 조직의 데이터가 있는 연도 범위로 자동 조정
    const orgEmissions = emissions.filter(e => e.organizationId === orgId);
    if (orgEmissions.length > 0) {
      const years = orgEmissions.map(e => e.year).sort((a, b) => a - b);
      const minYear = years[0];
      const maxYear = years[years.length - 1];
      setRange({ from: minYear, to: maxYear });
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 style={{ 
            width: '56px', 
            height: '56px', 
            margin: '0 auto 24px auto', 
            display: 'block',
            animation: 'spin 1s linear infinite',
            color: 'white'
          }} />
          <p style={{ color: 'white', fontSize: '18px', fontWeight: 500 }}>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box'
    }}>
      {/* 헤더 */}
      <header style={{ 
        width: '100vw', 
        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(12px)', 
        borderBottom: '1px solid #e5e7eb', 
        position: 'sticky', 
        top: 0, 
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        margin: 0,
        padding: 0
      }}>
        <div style={{ 
          width: '100%',
          padding: '16px 24px',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')}
              style={{ 
                borderRadius: '50%', 
                width: '48px', 
                height: '48px',
                transition: 'all 0.2s'
              }}
            >
              <ArrowLeft style={{ width: '24px', height: '24px' }} />
            </Button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
              <div style={{ 
                padding: '12px', 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                borderRadius: '16px', 
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' 
              }}>
                <Factory style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '28px', 
                  fontWeight: 'bold', 
                  background: 'linear-gradient(135deg, #059669, #047857)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '4px'
                }}>
                  온실가스 배출량 분석
                </h1>
                <p style={{ fontSize: '15px', color: '#6b7280' }}>기업별 온실가스 배출량 추적 및 분석 (단위: tCO₂e)</p>
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
                <span>{isApiConnected ? "실시간 연결" : "연결 대기"}</span>
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportToCSV}
                style={{ 
                  height: '40px', 
                  padding: '0 20px',
                  borderRadius: '10px',
                  fontWeight: 500
                }}
              >
                <Download style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                <span>CSV 내보내기</span>
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
          {/* 필터 섹션 - 개선된 UI */}
          <Card style={{ 
            borderRadius: '20px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
            border: 'none',
            background: 'white',
            width: '100%'
          }}>
            <CardContent style={{ padding: '28px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: '24px' 
              }}>
                <Filter style={{ width: '28px', height: '28px', color: '#059669' }} />
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#111827' 
                }}>필터 설정</h3>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '16px' 
              }}>
                {/* 조직 검색 - 개선된 드롭다운 */}
                <div style={{ position: 'relative', flex: 1 }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '16px', 
                    fontWeight: 700, 
                    color: '#111827', 
                    marginBottom: '14px' 
                  }}>
                    조직 검색
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Search style={{ 
                      position: 'absolute', 
                      left: '16px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      width: '20px', 
                      height: '20px', 
                      color: '#9ca3af', 
                      pointerEvents: 'none',
                      zIndex: 1
                    }} />
                    <Input
                      placeholder="조직명을 검색하거나 클릭하세요..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowDropdown(true);
                        setCurrentPage(1);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      style={{ 
                        paddingLeft: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        fontSize: '15px',
                        transition: 'all 0.2s'
                      }}
                    />
                  </div>
                  
                  {/* 드롭다운 */}
                  {showDropdown && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '100%', 
                      left: 0, 
                      right: 0, 
                      marginTop: '8px',
                      background: 'white', 
                      borderRadius: '12px', 
                      boxShadow: '0 10px 40px rgba(0,0,0,0.15)', 
                      zIndex: 50,
                      maxHeight: '400px',
                      overflow: 'hidden',
                      border: '1px solid #e5e7eb'
                    }}>
                      {paginatedOrganizations.length === 0 ? (
                        <div style={{ 
                          padding: '32px 16px', 
                          textAlign: 'center', 
                          color: '#6b7280' 
                        }}>
                          <AlertCircle style={{ 
                            width: '48px', 
                            height: '48px', 
                            margin: '0 auto 12px auto', 
                            color: '#9ca3af' 
                          }} />
                          <p style={{ fontSize: '15px', fontWeight: 500, marginBottom: '8px' }}>
                            {organizations.length === 0 
                              ? '배출량 데이터가 있는 조직이 없습니다' 
                              : '검색 결과가 없습니다'}
                          </p>
                          <p style={{ fontSize: '13px', color: '#9ca3af' }}>
                            {organizations.length === 0 
                              ? 'GIR 엑셀 파일을 업로드하여 데이터를 추가하세요' 
                              : '다른 검색어를 입력해보세요'}
                          </p>
                        </div>
                      ) : (
                        <React.Fragment>
                          <div style={{ 
                            maxHeight: '300px', 
                            overflowY: 'auto',
                            padding: '8px'
                          }}>
                            {paginatedOrganizations.map((org, idx) => (
                              <button
                                key={org.id}
                                onClick={() => handleOrgSelect(org.id, org.name)}
                                style={{ 
                                  width: '100%', 
                                  padding: '16px 18px', 
                                  textAlign: 'left', 
                                  border: 'none',
                                  background: idx % 2 === 0 ? 'white' : '#f9fafb',
                                  cursor: 'pointer',
                                  borderRadius: '10px',
                                  marginBottom: '6px',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#f0fdf4';
                                  e.currentTarget.style.transform = 'translateX(4px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#f9fafb';
                                  e.currentTarget.style.transform = 'translateX(0)';
                                }}
                              >
                                <div style={{ fontWeight: 600, color: '#111827', marginBottom: '6px', fontSize: '15px' }}>
                                  {org.name}
                                </div>
                                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                  {org.type || '조직'}
                                </div>
                              </button>
                            ))}
                          </div>
                          
                          {/* 페이지네이션 */}
                          {totalPages > 1 && (
                            <div style={{ 
                              padding: '12px 16px', 
                              background: '#f9fafb', 
                              borderTop: '1px solid #e5e7eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}>
                              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                {filteredOrganizations.length}개 중 {((currentPage - 1) * itemsPerPage) + 1}-
                                {Math.min(currentPage * itemsPerPage, filteredOrganizations.length)}번째
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                  disabled={currentPage === 1}
                                  style={{ 
                                    height: '32px', 
                                    width: '32px', 
                                    padding: 0,
                                    borderRadius: '8px'
                                  }}
                                >
                                  <ChevronLeft style={{ width: '16px', height: '16px' }} />
                                </Button>
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  padding: '0 12px',
                                  fontSize: '13px',
                                  fontWeight: 500
                                }}>
                                  {currentPage} / {totalPages}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                  disabled={currentPage === totalPages}
                                  style={{ 
                                    height: '32px', 
                                    width: '32px', 
                                    padding: 0,
                                    borderRadius: '8px'
                                  }}
                                >
                                  <ChevronRight style={{ width: '16px', height: '16px' }} />
                                </Button>
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      )}
                    </div>
                  )}
                  
                  {/* 선택된 조직 표시 */}
                  {selectedOrg && selectedOrgName && (
                    <div style={{ marginTop: '16px' }}>
                      <Badge 
                        variant="secondary" 
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '10px',
                          padding: '10px 16px',
                          borderRadius: '10px',
                          background: '#f0fdf4',
                          color: '#059669',
                          border: '2px solid #d1fae5',
                          fontSize: '15px',
                          fontWeight: 600
                        }}
                      >
                        <span>{selectedOrgName}</span>
                        <button
                          onClick={() => {
                            setSelectedOrg('');
                            setSearchTerm('');
                            // 전체 조직으로 돌아갈 때 기본 3년 범위로 복구
                            setRange({ from: yearNow - 3, to: yearNow });
                          }}
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            cursor: 'pointer',
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            color: '#059669'
                          }}
                        >
                          <X style={{ width: '18px', height: '18px' }} />
                        </button>
                      </Badge>
                    </div>
                  )}
                </div>

                {/* 기간 선택 */}
                <div style={{ flex: 1 }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '16px', 
                    fontWeight: 700, 
                    color: '#111827', 
                    marginBottom: '14px' 
                  }}>
                    기간 선택
                  </label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <Select 
                        value={String(range.from)}
                        onValueChange={(value) => {
                          const newFrom = parseInt(value);
                          setRange(prev => {
                            // from이 to보다 크면 to도 조정
                            if (newFrom > prev.to) {
                              return { from: newFrom, to: newFrom };
                            }
                            return { ...prev, from: newFrom };
                          });
                        }}
                      >
                        <SelectTrigger style={{ height: '48px', borderRadius: '12px', fontSize: '15px' }}>
                          <SelectValue>{range.from}년</SelectValue>
                        </SelectTrigger>
                        <SelectContent style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          {availableYears.map(year => (
                            <SelectItem key={year} value={String(year)}>
                              {year}년
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <span style={{ color: '#6b7280', fontWeight: 500 }}>~</span>
                    <div style={{ flex: 1 }}>
                      <Select 
                        value={String(range.to)}
                        onValueChange={(value) => {
                          const newTo = parseInt(value);
                          setRange(prev => {
                            // to가 from보다 작으면 from도 조정
                            if (newTo < prev.from) {
                              return { from: newTo, to: newTo };
                            }
                            return { ...prev, to: newTo };
                          });
                        }}
                      >
                        <SelectTrigger style={{ height: '48px', borderRadius: '12px', fontSize: '15px' }}>
                          <SelectValue>{range.to}년</SelectValue>
                        </SelectTrigger>
                        <SelectContent style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          {availableYears.map(year => (
                            <SelectItem key={year} value={String(year)}>
                              {year}년
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 통계 카드들 */}
          {loadingEmissions ? (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <Loader2 style={{ 
                width: '48px', 
                height: '48px', 
                margin: '0 auto 16px auto', 
                display: 'block',
                animation: 'spin 1s linear infinite',
                color: '#059669'
              }} />
              <p style={{ fontSize: '16px', color: '#6b7280', fontWeight: 500 }}>배출량 데이터 조회 중...</p>
            </div>
          ) : (
            <React.Fragment>
              {/* 요약 통계 */}
              <div style={{ 
                display: 'flex',
                gap: '24px',
                width: '100%'
              }}>
                <Card style={{ 
                  borderRadius: '20px', 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
                  border: 'none',
                  background: 'white',
                  flex: 1
                }}>
                  <CardContent style={{ padding: '32px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'start', 
                      justifyContent: 'space-between', 
                      marginBottom: '16px' 
                    }}>
                      <div style={{ 
                        padding: '16px', 
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                        borderRadius: '16px', 
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' 
                      }}>
                        <Activity style={{ width: '28px', height: '28px', color: 'white' }} />
                      </div>
                      {totals.trend !== 0 && (
                        <Badge 
                          variant={totals.trend < 0 ? "default" : "destructive"} 
                          style={{ 
                            borderRadius: '9999px',
                            padding: '6px 12px',
                            fontSize: '13px'
                          }}
                        >
                          {totals.trend < 0 ? 
                            <TrendingDown style={{ width: '14px', height: '14px', marginRight: '4px' }} /> : 
                            <TrendingUp style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                          }
                          <span>{Math.abs(totals.trend)}%</span>
                        </Badge>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: 600, 
                      color: '#6b7280', 
                      marginBottom: '14px' 
                    }}>총 배출량</div>
                    <div style={{ 
                      fontSize: '40px', 
                      fontWeight: 'bold',
                      color: '#111827',
                      marginBottom: '10px'
                    }}>{fmt.format(Math.round(totals.total))}</div>
                    <div style={{ fontSize: '16px', color: '#6b7280' }}>tCO₂e</div>
                  </CardContent>
                </Card>

                <Card style={{ 
                  borderRadius: '20px', 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
                  border: 'none',
                  background: 'white',
                  flex: 1
                }}>
                  <CardContent style={{ padding: '32px' }}>
                    <div style={{ 
                      padding: '16px', 
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                      borderRadius: '16px', 
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                      width: 'fit-content',
                      marginBottom: '16px'
                    }}>
                      <BarChart3 style={{ width: '28px', height: '28px', color: 'white' }} />
                    </div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: 600, 
                      color: '#6b7280', 
                      marginBottom: '14px' 
                    }}>데이터 수</div>
                    <div style={{ 
                      fontSize: '40px', 
                      fontWeight: 'bold',
                      color: '#111827',
                      marginBottom: '10px'
                    }}>{filteredEmissions.length}</div>
                    <div style={{ fontSize: '16px', color: '#6b7280' }}>개 기록</div>
                  </CardContent>
                </Card>

                <Card style={{ 
                  borderRadius: '20px', 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
                  border: 'none',
                  background: 'white',
                  flex: 1
                }}>
                  <CardContent style={{ padding: '32px' }}>
                    <div style={{ 
                      padding: '16px', 
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', 
                      borderRadius: '16px', 
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                      width: 'fit-content',
                      marginBottom: '16px'
                    }}>
                      <CheckCircle2 style={{ width: '28px', height: '28px', color: 'white' }} />
                    </div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: 600, 
                      color: '#6b7280', 
                      marginBottom: '14px' 
                    }}>검증 완료율</div>
                    <div style={{ 
                      fontSize: '40px', 
                      fontWeight: 'bold',
                      color: '#111827',
                      marginBottom: '10px'
                    }}>{totals.rate}%</div>
                    <div style={{ fontSize: '16px', color: '#6b7280' }}>
                      {totals.verifiedCnt} / {filteredEmissions.length}개
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 차트 */}
              {byYear.length > 0 && (
                <Card style={{ 
                  borderRadius: '20px', 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
                  border: 'none',
                  background: 'white',
                  width: '100%'
                }}>
                  <CardHeader style={{ padding: '28px 28px 0 28px' }}>
                    <CardTitle style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      연도별 배출량 추이
                    </CardTitle>
                  </CardHeader>
                  <CardContent style={{ padding: '28px' }}>
                    <ResponsiveContainer width="100%" height={450}>
                      <LineChart data={byYear}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="year" 
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
                        <Legend wrapperStyle={{ fontSize: '15px', fontWeight: 500 }} />
                        <Line 
                          type="monotone" 
                          dataKey="total" 
                          stroke="#059669" 
                          strokeWidth={4}
                          name="총 배출량 (tCO₂e)" 
                          dot={{ fill: '#059669', r: 7 }}
                          activeDot={{ r: 9 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* 데이터 테이블 */}
              <Card style={{ 
                borderRadius: '20px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
                border: 'none',
                background: 'white',
                width: '100%'
              }}>
                <CardHeader style={{ padding: '28px 28px 24px 28px' }}>
                  <CardTitle style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    배출량 상세 데이터
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: '0 28px 28px 28px' }}>
                  {filteredEmissions.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '64px 0', 
                      color: '#6b7280' 
                    }}>
                      <AlertCircle style={{ 
                        width: '56px', 
                        height: '56px', 
                        margin: '0 auto 20px auto', 
                        color: '#9ca3af' 
                      }} />
                      <p style={{ fontSize: '16px', fontWeight: 500 }}>
                        선택한 기간에 배출량 데이터가 없습니다.
                      </p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                      <table style={{ width: '100%' }}>
                        <thead>
                          <tr style={{ 
                            borderBottom: '2px solid #e5e7eb', 
                            background: '#f9fafb' 
                          }}>
                            <th style={{ 
                              padding: '18px 24px', 
                              textAlign: 'left', 
                              fontSize: '15px', 
                              fontWeight: 700, 
                              color: '#374151' 
                            }}>조직명</th>
                            <th style={{ 
                              padding: '18px 24px', 
                              textAlign: 'center', 
                              fontSize: '15px', 
                              fontWeight: 700, 
                              color: '#374151' 
                            }}>연도</th>
                            <th style={{ 
                              padding: '18px 24px', 
                              textAlign: 'right', 
                              fontSize: '15px', 
                              fontWeight: 700, 
                              color: '#374151' 
                            }}>총배출량</th>
                            <th style={{ 
                              padding: '18px 24px', 
                              textAlign: 'center', 
                              fontSize: '15px', 
                              fontWeight: 700, 
                              color: '#374151' 
                            }}>검증상태</th>
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
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                              onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#f9fafb'}
                            >
                              <td style={{ 
                                padding: '18px 24px', 
                                fontWeight: 500, 
                                color: '#111827',
                                fontSize: '15px'
                              }}>{emission.organizationName}</td>
                              <td style={{ 
                                padding: '18px 24px', 
                                textAlign: 'center', 
                                color: '#6b7280',
                                fontSize: '15px'
                              }}>{emission.year}</td>
                              <td style={{ 
                                padding: '18px 24px', 
                                textAlign: 'right', 
                                fontWeight: 600, 
                                color: '#111827',
                                fontSize: '15px'
                              }}>{fmt.format(Math.round(emission.totalEmissions))}</td>
                              <td style={{ 
                                padding: '18px 24px', 
                                textAlign: 'center' 
                              }}>
                                <Badge 
                                  variant={emission.verificationStatus === '검증완료' ? 'default' : 'secondary'}
                                  style={{ 
                                    borderRadius: '8px',
                                    padding: '4px 12px',
                                    fontSize: '13px'
                                  }}
                                >
                                  {emission.verificationStatus}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </React.Fragment>
          )}
        </div>
      </main>
    </div>
  );
}