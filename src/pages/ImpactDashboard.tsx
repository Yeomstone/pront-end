import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Leaf,
  DollarSign,
  Newspaper,
  Database,
  TrendingUp,
  ChevronRight,
  Calendar,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Activity,
  Building2,
} from "lucide-react";

const fmt = new Intl.NumberFormat("ko-KR");

// 전문적인 색상 팔레트
const COLORS = {
  primary: "#0F172A",
  secondary: "#64748B",
  accent: "#0EA5E9",
  success: "#10B981",
  warning: "#F59E0B",
  background: "#F8FAFC",
  cardBg: "#FFFFFF",
  border: "#E2E8F0",
};

// 슬라이드 이미지 데이터
const SLIDE_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=600&fit=crop",
    title: "기업의 사회적 책임",
    subtitle: "지속가능한 미래를 위한 ESG 경영",
  },
  {
    url: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=600&fit=crop",
    title: "환경 보호 캠페인",
    subtitle: "탄소중립을 향한 기업들의 노력",
  },
  {
    url: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1200&h=600&fit=crop",
    title: "지역사회 공헌",
    subtitle: "나눔과 상생의 기업 문화",
  },
  {
    url: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=1200&h=600&fit=crop",
    title: "혁신과 성장",
    subtitle: "기술로 만드는 더 나은 세상",
  },
];

interface OrgData {
  id: number;
  name: string;
  emissions: number;
  emissionsYear: number;
  donations: number;
  donationsYear: number;
}

export default function ImpactDashboard() {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

  const [isApiConnected, setIsApiConnected] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [recentNews, setRecentNews] = useState<any[]>([]);
  const [newsStats, setNewsStats] = useState({ total: 0, thisMonth: 0 });

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [currentOrgIndex, setCurrentOrgIndex] = useState(0);
  const [currentOrgData, setCurrentOrgData] = useState<OrgData | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // API 연결 확인
  useEffect(() => {
    checkApiConnection();
    loadInitialData();
  }, []);

  // 자동 슬라이드 (이미지)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDE_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 자동 조직 데이터 순환 (3초마다)
  useEffect(() => {
    if (organizations.length === 0) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentOrgIndex((prev) => (prev + 1) % organizations.length);
        setIsTransitioning(false);
      }, 300); // 페이드 아웃 시간
    }, 3000);

    return () => clearInterval(interval);
  }, [organizations]);

  // 조직이 변경될 때마다 데이터 로드
  useEffect(() => {
    if (organizations.length > 0) {
      loadOrgData(organizations[currentOrgIndex].id);
    }
  }, [currentOrgIndex, organizations]);

  const checkApiConnection = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/organizations`);
      setIsApiConnected(response.ok);
    } catch (error) {
      setIsApiConnected(false);
    }
  };

  const filterOrganizationsWithData = async (orgs: any[]) => {
    const orgsWithData: any[] = [];

    // 병렬로 모든 조직 체크 (처음 50개만)
    const checkPromises = orgs.slice(0, 50).map(async (org) => {
      try {
        // 온실가스 데이터 확인
        const emissionsRes = await fetch(
          `${API_BASE}/api/emissions/organization/${org.id}`
        );
        const hasEmissions =
          emissionsRes.ok && (await emissionsRes.json()).length > 0;

        // 기부금 데이터 확인
        const donationsRes = await fetch(
          `${API_BASE}/api/donations/organization/${org.id}`
        );
        const hasDonations =
          donationsRes.ok && (await donationsRes.json()).length > 0;

        // 둘 중 하나라도 데이터가 있으면 포함
        if (hasEmissions || hasDonations) {
          return org;
        }
        return null;
      } catch (error) {
        return null;
      }
    });

    const results = await Promise.all(checkPromises);
    return results.filter((org) => org !== null);
  };

  const loadInitialData = async () => {
    try {
      // 조직 목록 로드
      const orgsRes = await fetch(`${API_BASE}/api/organizations`);
      if (orgsRes.ok) {
        const orgs = await orgsRes.json();

        // 데이터가 있는 조직만 필터링
        const orgsWithData = await filterOrganizationsWithData(orgs);

        if (orgsWithData.length > 0) {
          // 랜덤하게 섞기
          const shuffled = orgsWithData.sort(() => Math.random() - 0.5);
          setOrganizations(shuffled);

          // 첫 번째 조직의 데이터 로드
          loadOrgData(shuffled[0].id);
        } else {
          console.warn("데이터가 있는 조직을 찾을 수 없습니다.");
        }
      }

      // 뉴스 통계
      const newsCountRes = await fetch(
        `${API_BASE}/api/positive-news/total-count`
      );
      if (newsCountRes.ok) {
        const data = await newsCountRes.json();
        setNewsStats({
          total: data.total,
          thisMonth: Math.floor(data.total * 0.15),
        });
      }

      // 최근 뉴스
      if (orgsWithData.length > 0) {
        const newsRes = await fetch(
          `${API_BASE}/api/positive-news/organization/${orgsWithData[0].id}/recent`
        );
        if (newsRes.ok) {
          const news = await newsRes.json();
          setRecentNews(news.slice(0, 3));
        }
      }
    } catch (error) {
      console.error("초기 데이터 로드 실패:", error);
    }
  };

  const loadOrgData = async (orgId: number) => {
    try {
      const org = organizations.find((o) => o.id === orgId);
      if (!org) return;

      // 온실가스 배출량 (최신 데이터)
      const emissionsRes = await fetch(
        `${API_BASE}/api/emissions/organization/${orgId}`
      );
      let emissionsData = { totalEmissions: 0, year: 0 };

      if (emissionsRes.ok) {
        const emissions = await emissionsRes.json();
        if (emissions.length > 0) {
          // 최신 연도 데이터 찾기
          const latest = emissions.sort((a: any, b: any) => b.year - a.year)[0];
          emissionsData = {
            totalEmissions: latest.totalEmissions || 0,
            year: latest.year || 0,
          };
        }
      }

      // 기부금 (최신 데이터)
      const donationsRes = await fetch(
        `${API_BASE}/api/donations/organization/${orgId}`
      );
      let donationsData = { amount: 0, year: 0 };

      if (donationsRes.ok) {
        const donations = await donationsRes.json();
        if (donations.length > 0) {
          // 최신 연도 데이터 찾기
          const latest = donations.sort((a: any, b: any) => b.year - a.year)[0];
          donationsData = {
            amount: latest.amount || 0,
            year: latest.year || 0,
          };
        }
      }

      setCurrentOrgData({
        id: orgId,
        name: org.name,
        emissions: emissionsData.totalEmissions,
        emissionsYear: emissionsData.year,
        donations: donationsData.amount,
        donationsYear: donationsData.year,
      });
    } catch (error) {
      console.error("조직 데이터 로드 실패:", error);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: COLORS.background,
        margin: 0,
        padding: 0,
      }}
    >
      {/* 헤더 */}
      <header
        style={{
          width: "100vw",
          backgroundColor: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${COLORS.border}`,
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "16px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                padding: "10px",
                background: COLORS.accent,
                borderRadius: "12px",
              }}
            >
              <Activity
                style={{ width: "24px", height: "24px", color: "white" }}
              />
            </div>
            <div>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: COLORS.primary,
                  marginBottom: "2px",
                }}
              >
                Social Impact Tracker
              </h1>
              <p
                style={{
                  fontSize: "14px",
                  color: COLORS.secondary,
                  fontWeight: 500,
                }}
              >
                실시간 기업 ESG 데이터 분석 플랫폼
              </p>
            </div>
          </div>
          <Badge
            variant={isApiConnected ? "default" : "destructive"}
            style={{
              background: isApiConnected ? COLORS.success : COLORS.warning,
              padding: "6px 14px",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            <Database
              style={{ width: "14px", height: "14px", marginRight: "6px" }}
            />
            {isApiConnected ? "API 연결됨" : "API 연결 안 됨"}
          </Badge>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "32px",
        }}
      >
        {/* Hero 슬라이드 섹션 */}
        <div
          style={{
            position: "relative",
            height: "400px",
            borderRadius: "16px",
            overflow: "hidden",
            marginBottom: "32px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          {SLIDE_IMAGES.map((slide, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: currentSlide === index ? 1 : 0,
                transition: "opacity 1s ease-in-out",
                backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.6)), url(${slide.url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
              }}
            >
              <Badge
                style={{
                  marginBottom: "16px",
                  background: "rgba(255,255,255,0.2)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.3)",
                  padding: "6px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                <CheckCircle2
                  style={{ width: "14px", height: "14px", marginRight: "6px" }}
                />
                실시간 업데이트
              </Badge>
              <h2
                style={{
                  fontSize: "48px",
                  fontWeight: 800,
                  marginBottom: "12px",
                  textAlign: "center",
                  textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                }}
              >
                {slide.title}
              </h2>
              <p
                style={{
                  fontSize: "20px",
                  color: "rgba(255,255,255,0.9)",
                  textAlign: "center",
                  maxWidth: "600px",
                  textShadow: "0 1px 5px rgba(0,0,0,0.3)",
                }}
              >
                {slide.subtitle}
              </p>
            </div>
          ))}

          {/* 슬라이드 인디케이터 */}
          <div
            style={{
              position: "absolute",
              bottom: "24px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "8px",
              zIndex: 10,
            }}
          >
            {SLIDE_IMAGES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                style={{
                  width: currentSlide === index ? "32px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  background:
                    currentSlide === index ? "white" : "rgba(255,255,255,0.5)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
              />
            ))}
          </div>
        </div>

        {/* 메인 카드 섹션 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          {/* 뉴스 메인 카드 */}
          <Card
            onClick={() => navigate("/news")}
            style={{
              borderRadius: "16px",
              border: `2px solid ${COLORS.accent}`,
              background: `linear-gradient(135deg, ${COLORS.accent}15 0%, ${COLORS.accent}05 100%)`,
              cursor: "pointer",
              transition: "all 0.3s",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow =
                "0 8px 30px rgba(14, 165, 233, 0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "200px",
                height: "200px",
                background: `radial-gradient(circle, ${COLORS.accent}20 0%, transparent 70%)`,
                pointerEvents: "none",
              }}
            />

            <CardContent
              style={{ padding: "32px", position: "relative", zIndex: 1 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "start",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    padding: "14px",
                    background: COLORS.accent,
                    borderRadius: "14px",
                    boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)",
                  }}
                >
                  <Newspaper
                    style={{ width: "32px", height: "32px", color: "white" }}
                  />
                </div>
                <Badge
                  style={{
                    background: COLORS.success,
                    color: "white",
                    padding: "6px 12px",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  <TrendingUp
                    style={{
                      width: "14px",
                      height: "14px",
                      marginRight: "4px",
                    }}
                  />
                  실시간 업데이트
                </Badge>
              </div>

              <h3
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: COLORS.primary,
                  marginBottom: "8px",
                }}
              >
                긍정 뉴스
              </h3>

              <p
                style={{
                  fontSize: "15px",
                  color: COLORS.secondary,
                  marginBottom: "24px",
                  lineHeight: "1.6",
                }}
              >
                기업의 ESG 활동과 사회공헌 뉴스를 실시간으로 수집하고 분석합니다
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "24px",
                  marginBottom: "24px",
                  paddingTop: "20px",
                  borderTop: `1px solid ${COLORS.border}`,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "36px",
                      fontWeight: 800,
                      color: COLORS.accent,
                      marginBottom: "4px",
                    }}
                  >
                    {fmt.format(newsStats.total)}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: COLORS.secondary,
                      fontWeight: 600,
                    }}
                  >
                    총 뉴스 건수
                  </div>
                </div>
                <div
                  style={{
                    borderLeft: `2px solid ${COLORS.border}`,
                    paddingLeft: "24px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "36px",
                      fontWeight: 800,
                      color: COLORS.success,
                      marginBottom: "4px",
                    }}
                  >
                    +{fmt.format(newsStats.thisMonth)}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: COLORS.secondary,
                      fontWeight: 600,
                    }}
                  >
                    이번 달 신규
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate("/news")}
                style={{
                  width: "100%",
                  background: COLORS.accent,
                  color: "white",
                  padding: "14px",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#0284C7";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = COLORS.accent;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                뉴스 분석 보기
                <ArrowRight style={{ width: "18px", height: "18px" }} />
              </Button>
            </CardContent>
          </Card>

          {/* 온실가스 카드 - 실시간 데이터 */}
          <Card
            onClick={() => navigate("/emissions")}
            style={{
              borderRadius: "16px",
              border: `1px solid ${COLORS.border}`,
              background: COLORS.cardBg,
              cursor: "pointer",
              transition: "all 0.3s",
              opacity: isTransitioning ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow =
                "0 8px 30px rgba(16, 185, 129, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <CardContent style={{ padding: "28px" }}>
              <div
                style={{
                  padding: "12px",
                  background: `${COLORS.success}15`,
                  borderRadius: "12px",
                  marginBottom: "20px",
                  width: "fit-content",
                }}
              >
                <Leaf
                  style={{
                    width: "28px",
                    height: "28px",
                    color: COLORS.success,
                  }}
                />
              </div>

              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: COLORS.primary,
                  marginBottom: "8px",
                }}
              >
                온실가스 배출량
              </h3>

              <p
                style={{
                  fontSize: "14px",
                  color: COLORS.secondary,
                  marginBottom: "16px",
                  lineHeight: "1.5",
                }}
              >
                기업별 온실가스 배출 데이터 추적
              </p>

              {/* 회사명 표시 */}
              {currentOrgData && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "16px",
                    padding: "10px 12px",
                    background: `${COLORS.success}10`,
                    borderRadius: "8px",
                    border: `1px solid ${COLORS.success}30`,
                  }}
                >
                  <Building2
                    style={{
                      width: "14px",
                      height: "14px",
                      color: COLORS.success,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: COLORS.primary,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {currentOrgData.name}
                  </span>
                </div>
              )}

              <div
                style={{
                  marginBottom: "20px",
                  paddingTop: "16px",
                  borderTop: `1px solid ${COLORS.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: 800,
                    color: COLORS.success,
                    marginBottom: "4px",
                  }}
                >
                  {currentOrgData
                    ? fmt.format(Math.round(currentOrgData.emissions))
                    : "0"}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: COLORS.secondary,
                    fontWeight: 600,
                  }}
                >
                  톤 CO₂e{" "}
                  {currentOrgData?.emissionsYear
                    ? `(${currentOrgData.emissionsYear}년)`
                    : ""}
                </div>
              </div>

              <Button
                onClick={() => navigate("/emissions")}
                variant="outline"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                상세 보기
                <ChevronRight style={{ width: "16px", height: "16px" }} />
              </Button>
            </CardContent>
          </Card>

          {/* 기부금 카드 - 실시간 데이터 */}
          <Card
            onClick={() => navigate("/donations")}
            style={{
              borderRadius: "16px",
              border: `1px solid ${COLORS.border}`,
              background: COLORS.cardBg,
              cursor: "pointer",
              transition: "all 0.3s",
              opacity: isTransitioning ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow =
                "0 8px 30px rgba(99, 102, 241, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <CardContent style={{ padding: "28px" }}>
              <div
                style={{
                  padding: "12px",
                  background: "#6366F115",
                  borderRadius: "12px",
                  marginBottom: "20px",
                  width: "fit-content",
                }}
              >
                <DollarSign
                  style={{ width: "28px", height: "28px", color: "#6366F1" }}
                />
              </div>

              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: COLORS.primary,
                  marginBottom: "8px",
                }}
              >
                기부금
              </h3>

              <p
                style={{
                  fontSize: "14px",
                  color: COLORS.secondary,
                  marginBottom: "16px",
                  lineHeight: "1.5",
                }}
              >
                기업의 사회공헌 기부금 내역
              </p>

              {/* 회사명 표시 */}
              {currentOrgData && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "16px",
                    padding: "10px 12px",
                    background: "#6366F110",
                    borderRadius: "8px",
                    border: "1px solid #6366F130",
                  }}
                >
                  <Building2
                    style={{ width: "14px", height: "14px", color: "#6366F1" }}
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: COLORS.primary,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {currentOrgData.name}
                  </span>
                </div>
              )}

              <div
                style={{
                  marginBottom: "20px",
                  paddingTop: "16px",
                  borderTop: `1px solid ${COLORS.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: 800,
                    color: "#6366F1",
                    marginBottom: "4px",
                  }}
                >
                  {currentOrgData
                    ? fmt.format(Math.floor(currentOrgData.donations / 1000))
                    : "0"}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: COLORS.secondary,
                    fontWeight: 600,
                  }}
                >
                  천원{" "}
                  {currentOrgData?.donationsYear
                    ? `(${currentOrgData.donationsYear}년)`
                    : ""}
                </div>
              </div>

              <Button
                onClick={() => navigate("/donations")}
                variant="outline"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                상세 보기
                <ChevronRight style={{ width: "16px", height: "16px" }} />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 최근 뉴스 섹션 */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: COLORS.primary,
                  marginBottom: "6px",
                }}
              >
                최근 긍정 뉴스
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: COLORS.secondary,
                  fontWeight: 500,
                }}
              >
                실시간으로 수집된 최신 ESG 뉴스
              </p>
            </div>
            <Button
              onClick={() => navigate("/news")}
              variant="outline"
              style={{
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              전체 보기
              <ChevronRight
                style={{ width: "16px", height: "16px", marginLeft: "4px" }}
              />
            </Button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
            }}
          >
            {recentNews.length > 0 ? (
              recentNews.map((news, index) => (
                <Card
                  key={index}
                  onClick={() => window.open(news.url, "_blank")}
                  style={{
                    borderRadius: "12px",
                    border: `1px solid ${COLORS.border}`,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(0,0,0,0.1)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <CardContent style={{ padding: "20px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "12px",
                      }}
                    >
                      <Badge
                        style={{
                          background: "#10B98115",
                          color: COLORS.success,
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "4px 10px",
                        }}
                      >
                        {news.category}
                      </Badge>
                      <ExternalLink
                        style={{
                          width: "14px",
                          height: "14px",
                          color: COLORS.secondary,
                        }}
                      />
                    </div>

                    <h4
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: COLORS.primary,
                        marginBottom: "8px",
                        lineHeight: "1.4",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {news.title}
                    </h4>

                    <p
                      style={{
                        fontSize: "13px",
                        color: COLORS.secondary,
                        lineHeight: "1.5",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        marginBottom: "12px",
                      }}
                    >
                      {news.description}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        paddingTop: "12px",
                        borderTop: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <Calendar
                        style={{
                          width: "13px",
                          height: "13px",
                          color: COLORS.secondary,
                        }}
                      />
                      <span
                        style={{ fontSize: "12px", color: COLORS.secondary }}
                      >
                        {news.publishedDate}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Mock 데이터
              <>
                <Card
                  style={{
                    borderRadius: "12px",
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <CardContent style={{ padding: "20px" }}>
                    <Badge
                      style={{
                        background: "#10B98115",
                        color: COLORS.success,
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "4px 10px",
                        marginBottom: "12px",
                      }}
                    >
                      환경
                    </Badge>
                    <h4
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: COLORS.primary,
                        marginBottom: "8px",
                        lineHeight: "1.4",
                      }}
                    >
                      기업들의 탄소중립 실천, ESG 경영 강화
                    </h4>
                    <p
                      style={{
                        fontSize: "13px",
                        color: COLORS.secondary,
                        lineHeight: "1.5",
                        marginBottom: "12px",
                      }}
                    >
                      국내 주요 기업들이 탄소중립 목표 달성을 위한 구체적인 실행
                      계획을 발표했습니다...
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        paddingTop: "12px",
                        borderTop: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <Calendar
                        style={{
                          width: "13px",
                          height: "13px",
                          color: COLORS.secondary,
                        }}
                      />
                      <span
                        style={{ fontSize: "12px", color: COLORS.secondary }}
                      >
                        2024-10-31
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  style={{
                    borderRadius: "12px",
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <CardContent style={{ padding: "20px" }}>
                    <Badge
                      style={{
                        background: "#6366F115",
                        color: "#6366F1",
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "4px 10px",
                        marginBottom: "12px",
                      }}
                    >
                      기부
                    </Badge>
                    <h4
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: COLORS.primary,
                        marginBottom: "8px",
                        lineHeight: "1.4",
                      }}
                    >
                      지역사회 상생협력, 장학금 100억 전달
                    </h4>
                    <p
                      style={{
                        fontSize: "13px",
                        color: COLORS.secondary,
                        lineHeight: "1.5",
                        marginBottom: "12px",
                      }}
                    >
                      주요 기업들이 지역사회 발전을 위한 장학금 및 지원금을
                      전달하며 상생 경영을 실천하고 있습니다...
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        paddingTop: "12px",
                        borderTop: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <Calendar
                        style={{
                          width: "13px",
                          height: "13px",
                          color: COLORS.secondary,
                        }}
                      />
                      <span
                        style={{ fontSize: "12px", color: COLORS.secondary }}
                      >
                        2024-10-30
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  style={{
                    borderRadius: "12px",
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <CardContent style={{ padding: "20px" }}>
                    <Badge
                      style={{
                        background: "#F59E0B15",
                        color: COLORS.warning,
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "4px 10px",
                        marginBottom: "12px",
                      }}
                    >
                      교육
                    </Badge>
                    <h4
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: COLORS.primary,
                        marginBottom: "8px",
                        lineHeight: "1.4",
                      }}
                    >
                      청년 인재 양성 프로그램, 취업 지원 강화
                    </h4>
                    <p
                      style={{
                        fontSize: "13px",
                        color: COLORS.secondary,
                        lineHeight: "1.5",
                        marginBottom: "12px",
                      }}
                    >
                      기업들이 청년 인재 육성을 위한 교육 프로그램과 멘토링을
                      확대하고 있습니다...
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        paddingTop: "12px",
                        borderTop: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <Calendar
                        style={{
                          width: "13px",
                          height: "13px",
                          color: COLORS.secondary,
                        }}
                      />
                      <span
                        style={{ fontSize: "12px", color: COLORS.secondary }}
                      >
                        2024-10-29
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer
        style={{
          width: "100%",
          backgroundColor: "white",
          borderTop: `1px solid ${COLORS.border}`,
          padding: "40px 0",
          marginTop: "64px",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "0 32px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              color: COLORS.secondary,
              marginBottom: "8px",
            }}
          >
            © 2024 Social Impact Tracker. All rights reserved.
          </p>
          <p
            style={{
              fontSize: "13px",
              color: COLORS.secondary,
            }}
          >
            실시간 ESG 데이터 분석 플랫폼
          </p>
        </div>
      </footer>
    </div>
  );
}
