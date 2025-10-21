import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Database,
  AlertCircle,
  Calendar,
  Building2,
  UserCheck,
  UserPlus,
  UserMinus,
} from "lucide-react";
import {
  LineChart,
  Line,
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
  Cell,
} from "recharts";

const COLORS = {
  primary: "#0F172A",
  secondary: "#64748B",
  accent: "#3B82F6",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  purple: "#8B5CF6",
  pink: "#EC4899",
  border: "#E2E8F0",
  cardBg: "#FFFFFF",
  chartColors: [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
  ],
};

export default function EmploymentDetail() {
  const [employments, setEmployments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [selectedYear, setSelectedYear] = useState("all");
  const [availableYears, setAvailableYears] = useState([]);

  // API 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const response = await fetch("http://localhost:8080/api/employments");
        if (!response.ok) throw new Error("API connection failed");

        const data = await response.json();
        setEmployments(data);
        setIsApiConnected(true);

        const yearsResponse = await fetch(
          "http://localhost:8080/api/employments/years"
        );
        const years = await yearsResponse.json();
        setAvailableYears(years.sort((a, b) => b - a));
      } catch (error) {
        console.error("API Error:", error);
        setIsApiConnected(false);
        const mockData = generateMockData();
        setEmployments(mockData);
        setAvailableYears([2024, 2023, 2022, 2021]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Mock 데이터 생성
  const generateMockData = () => {
    const companies = [
      "삼성전자",
      "SK하이닉스",
      "현대자동차",
      "LG전자",
      "네이버",
      "카카오",
      "POSCO",
      "한화",
      "롯데",
      "CJ",
    ];
    const data = [];

    for (let year = 2021; year <= 2024; year++) {
      companies.forEach((company, idx) => {
        const total = Math.floor(Math.random() * 50000) + 10000;
        const female = Math.floor(total * (0.25 + Math.random() * 0.15));
        const male = total - female;
        const regular = Math.floor(total * (0.85 + Math.random() * 0.1));
        const newHires = Math.floor(total * 0.1);
        const resigned = Math.floor(total * 0.08);

        data.push({
          id: data.length + 1,
          organizationName: company,
          stockCode: `00${idx}000`,
          year: year,
          totalEmployees: total,
          maleEmployees: male,
          femaleEmployees: female,
          regularEmployees: regular,
          contractEmployees: total - regular,
          averageServiceYears: 5 + Math.random() * 10,
          newHires: newHires,
          resigned: resigned,
          turnoverRate: (resigned / total) * 100,
          verificationStatus: "자동수집",
          dataSource: "DART_API",
        });
      });
    }

    return data;
  };

  // 필터링된 데이터
  const filteredEmployments = useMemo(() => {
    if (selectedYear === "all") return employments;
    return employments.filter((e) => e.year === parseInt(selectedYear));
  }, [employments, selectedYear]);

  // 통계 계산
  const statistics = useMemo(() => {
    if (filteredEmployments.length === 0) {
      return {
        totalEmployees: 0,
        avgFemaleRatio: 0,
        avgRegularRatio: 0,
        avgServiceYears: 0,
        totalNewHires: 0,
        avgTurnoverRate: 0,
      };
    }

    const total = filteredEmployments.reduce(
      (sum, e) => sum + (e.totalEmployees || 0),
      0
    );
    const totalFemale = filteredEmployments.reduce(
      (sum, e) => sum + (e.femaleEmployees || 0),
      0
    );
    const totalRegular = filteredEmployments.reduce(
      (sum, e) => sum + (e.regularEmployees || 0),
      0
    );
    const totalNewHires = filteredEmployments.reduce(
      (sum, e) => sum + (e.newHires || 0),
      0
    );

    const avgServiceYears =
      filteredEmployments.reduce(
        (sum, e) => sum + (e.averageServiceYears || 0),
        0
      ) / filteredEmployments.length;
    const avgTurnoverRate =
      filteredEmployments.reduce((sum, e) => sum + (e.turnoverRate || 0), 0) /
      filteredEmployments.length;

    return {
      totalEmployees: total,
      avgFemaleRatio: total > 0 ? (totalFemale / total) * 100 : 0,
      avgRegularRatio: total > 0 ? (totalRegular / total) * 100 : 0,
      avgServiceYears: avgServiceYears,
      totalNewHires: totalNewHires,
      avgTurnoverRate: avgTurnoverRate,
    };
  }, [filteredEmployments]);

  // 연도별 트렌드 데이터
  const trendData = useMemo(() => {
    const yearlyData = {};

    employments.forEach((e) => {
      if (!yearlyData[e.year]) {
        yearlyData[e.year] = {
          year: e.year,
          total: 0,
          female: 0,
          newHires: 0,
        };
      }
      yearlyData[e.year].total += e.totalEmployees || 0;
      yearlyData[e.year].female += e.femaleEmployees || 0;
      yearlyData[e.year].newHires += e.newHires || 0;
    });

    return Object.values(yearlyData)
      .sort((a, b) => a.year - b.year)
      .map((d) => ({
        year: d.year,
        total: Math.round(d.total / 1000), // 천명 단위
        femaleRatio: d.total > 0 ? ((d.female / d.total) * 100).toFixed(1) : 0,
        newHires: Math.round(d.newHires / 100), // 백명 단위
      }));
  }, [employments]);

  // 상위 10개 고용 기업
  const topEmployers = useMemo(() => {
    const companyTotals = {};

    filteredEmployments.forEach((e) => {
      if (!companyTotals[e.organizationName]) {
        companyTotals[e.organizationName] = {
          name: e.organizationName,
          total: 0,
          female: 0,
        };
      }
      companyTotals[e.organizationName].total += e.totalEmployees || 0;
      companyTotals[e.organizationName].female += e.femaleEmployees || 0;
    });

    return Object.values(companyTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map((c) => ({
        ...c,
        femaleRatio: c.total > 0 ? ((c.female / c.total) * 100).toFixed(1) : 0,
      }));
  }, [filteredEmployments]);

  // 숫자 포맷팅
  const formatNumber = (num) => {
    return new Intl.NumberFormat("ko-KR").format(Math.round(num));
  };

  const navigate = (path) => {
    window.location.href = path;
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "4px solid #E2E8F0",
            borderTop: "4px solid #3B82F6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <p style={{ color: COLORS.secondary, fontSize: "14px" }}>
          데이터 로딩 중...
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#F8FAFC",
        margin: 0,
        padding: 0,
      }}
    >
      {/* 헤더 */}
      <header
        style={{
          width: "100vw",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${COLORS.border}`,
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
          margin: 0,
          padding: 0,
        }}
      >
        <div
          style={{
            width: "100%",
            padding: "14px 28px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              style={{
                borderRadius: "8px",
                width: "36px",
                height: "36px",
                transition: "all 0.2s",
              }}
            >
              <ArrowLeft style={{ width: "18px", height: "18px" }} />
            </Button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flex: 1,
              }}
            >
              <div
                style={{
                  padding: "8px",
                  background: COLORS.purple,
                  borderRadius: "10px",
                }}
              >
                <Users
                  style={{ width: "20px", height: "20px", color: "white" }}
                />
              </div>
              <div>
                <h1
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: COLORS.primary,
                    marginBottom: "1px",
                    letterSpacing: "-0.3px",
                  }}
                >
                  고용 현황 분석
                </h1>
                <p
                  style={{
                    fontSize: "13px",
                    color: COLORS.secondary,
                    fontWeight: 500,
                  }}
                >
                  기업별 고용 현황 및 일자리 창출 분석 (단위: 명)
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Badge
                variant={isApiConnected ? "default" : "secondary"}
                style={{
                  borderRadius: "6px",
                  padding: "5px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  background: isApiConnected
                    ? COLORS.success
                    : COLORS.secondary,
                }}
              >
                <Database
                  style={{ width: "13px", height: "13px", marginRight: "5px" }}
                />
                <span>{isApiConnected ? "API 연결됨" : "Mock 데이터"}</span>
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main
        style={{
          width: "100%",
          padding: "24px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* 필터 및 통계 카드 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            {/* 연도 필터 */}
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
                border: `1px solid ${COLORS.border}`,
                background: COLORS.cardBg,
              }}
            >
              <CardContent style={{ padding: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <Calendar
                    style={{
                      width: "18px",
                      height: "18px",
                      color: COLORS.purple,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: COLORS.primary,
                    }}
                  >
                    기간 선택
                  </span>
                </div>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: `1px solid ${COLORS.border}`,
                    fontSize: "14px",
                    fontWeight: 500,
                    color: COLORS.primary,
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  <option value="all">전체 기간</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}년
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* 총 고용 인원 */}
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
                border: `1px solid ${COLORS.border}`,
                background: COLORS.cardBg,
              }}
            >
              <CardContent style={{ padding: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <Users
                    style={{
                      width: "18px",
                      height: "18px",
                      color: COLORS.purple,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: COLORS.secondary,
                    }}
                  >
                    총 고용 인원
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: COLORS.primary,
                  }}
                >
                  {formatNumber(statistics.totalEmployees)}명
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: COLORS.secondary,
                    marginTop: "4px",
                  }}
                >
                  {filteredEmployments.length}개 기업
                </p>
              </CardContent>
            </Card>

            {/* 여성 고용 비율 */}
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
                border: `1px solid ${COLORS.border}`,
                background: COLORS.cardBg,
              }}
            >
              <CardContent style={{ padding: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <UserCheck
                    style={{
                      width: "18px",
                      height: "18px",
                      color: COLORS.pink,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: COLORS.secondary,
                    }}
                  >
                    여성 고용 비율
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: COLORS.primary,
                  }}
                >
                  {statistics.avgFemaleRatio.toFixed(1)}%
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: COLORS.secondary,
                    marginTop: "4px",
                  }}
                >
                  성 평등 지표
                </p>
              </CardContent>
            </Card>

            {/* 정규직 비율 */}
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
                border: `1px solid ${COLORS.border}`,
                background: COLORS.cardBg,
              }}
            >
              <CardContent style={{ padding: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <Building2
                    style={{
                      width: "18px",
                      height: "18px",
                      color: COLORS.success,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: COLORS.secondary,
                    }}
                  >
                    정규직 비율
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: COLORS.primary,
                  }}
                >
                  {statistics.avgRegularRatio.toFixed(1)}%
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: COLORS.secondary,
                    marginTop: "4px",
                  }}
                >
                  고용 안정성
                </p>
              </CardContent>
            </Card>

            {/* 평균 근속연수 */}
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
                border: `1px solid ${COLORS.border}`,
                background: COLORS.cardBg,
              }}
            >
              <CardContent style={{ padding: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <TrendingUp
                    style={{
                      width: "18px",
                      height: "18px",
                      color: COLORS.accent,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: COLORS.secondary,
                    }}
                  >
                    평균 근속연수
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: COLORS.primary,
                  }}
                >
                  {statistics.avgServiceYears.toFixed(1)}년
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: COLORS.secondary,
                    marginTop: "4px",
                  }}
                >
                  재직 기간
                </p>
              </CardContent>
            </Card>

            {/* 신규 채용 */}
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
                border: `1px solid ${COLORS.border}`,
                background: COLORS.cardBg,
              }}
            >
              <CardContent style={{ padding: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <UserPlus
                    style={{
                      width: "18px",
                      height: "18px",
                      color: COLORS.success,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: COLORS.secondary,
                    }}
                  >
                    신규 채용
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: COLORS.primary,
                  }}
                >
                  {formatNumber(statistics.totalNewHires)}명
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: COLORS.secondary,
                    marginTop: "4px",
                  }}
                >
                  일자리 창출
                </p>
              </CardContent>
            </Card>

            {/* 평균 이직률 */}
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
                border: `1px solid ${COLORS.border}`,
                background: COLORS.cardBg,
              }}
            >
              <CardContent style={{ padding: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <UserMinus
                    style={{
                      width: "18px",
                      height: "18px",
                      color: COLORS.warning,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: COLORS.secondary,
                    }}
                  >
                    평균 이직률
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: COLORS.primary,
                  }}
                >
                  {statistics.avgTurnoverRate.toFixed(1)}%
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: COLORS.secondary,
                    marginTop: "4px",
                  }}
                >
                  퇴직률 지표
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 연도별 트렌드 차트 */}
          {trendData.length > 0 && (
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
                border: `1px solid ${COLORS.border}`,
                background: COLORS.cardBg,
              }}
            >
              <CardHeader style={{ padding: "20px 20px 16px 20px" }}>
                <CardTitle
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: COLORS.primary,
                  }}
                >
                  연도별 고용 트렌드
                </CardTitle>
                <p
                  style={{
                    fontSize: "12px",
                    color: COLORS.secondary,
                    marginTop: "4px",
                  }}
                >
                  시계열 분석 (단위: 천명)
                </p>
              </CardHeader>
              <CardContent style={{ padding: "0 20px 20px 20px" }}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={COLORS.border}
                    />
                    <XAxis
                      dataKey="year"
                      stroke={COLORS.secondary}
                      style={{ fontSize: "12px", fontWeight: 500 }}
                    />
                    <YAxis
                      stroke={COLORS.secondary}
                      style={{ fontSize: "12px", fontWeight: 500 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: `1px solid ${COLORS.border}`,
                        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.1)",
                        fontSize: "12px",
                        padding: "10px",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "12px", fontWeight: 500 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke={COLORS.purple}
                      strokeWidth={3}
                      name="총 고용 인원 (천명)"
                      dot={{ fill: COLORS.purple, r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="newHires"
                      stroke={COLORS.success}
                      strokeWidth={3}
                      name="신규 채용 (백명)"
                      dot={{ fill: COLORS.success, r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* 상위 10개 고용 기업 */}
          {topEmployers.length > 0 && (
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
                border: `1px solid ${COLORS.border}`,
                background: COLORS.cardBg,
              }}
            >
              <CardHeader style={{ padding: "20px 20px 16px 20px" }}>
                <CardTitle
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: COLORS.primary,
                  }}
                >
                  상위 10개 고용 기업
                </CardTitle>
                <p
                  style={{
                    fontSize: "12px",
                    color: COLORS.secondary,
                    marginTop: "4px",
                  }}
                >
                  고용 인원 기준 순위
                </p>
              </CardHeader>
              <CardContent style={{ padding: "0 20px 20px 20px" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {topEmployers.map((company, idx) => (
                    <div
                      key={company.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "12px",
                        background: idx < 3 ? "#F8FAFC" : "transparent",
                        borderRadius: "8px",
                        border: idx < 3 ? `1px solid ${COLORS.border}` : "none",
                      }}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background:
                            idx === 0
                              ? "#F59E0B"
                              : idx === 1
                              ? "#94A3B8"
                              : idx === 2
                              ? "#CD7F32"
                              : COLORS.border,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          fontWeight: 700,
                          color: idx < 3 ? "white" : COLORS.secondary,
                        }}
                      >
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: COLORS.primary,
                          }}
                        >
                          {company.name}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: COLORS.secondary,
                            marginTop: "2px",
                          }}
                        >
                          {formatNumber(company.total)}명 · 여성{" "}
                          {company.femaleRatio}%
                        </div>
                      </div>
                      <div
                        style={{
                          width: "160px",
                          background: "#E2E8F0",
                          borderRadius: "9999px",
                          height: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: `${
                              (company.total / topEmployers[0].total) * 100
                            }%`,
                            background: COLORS.purple,
                            height: "100%",
                            borderRadius: "9999px",
                            transition: "width 0.3s",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 데이터 테이블 */}
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
              border: `1px solid ${COLORS.border}`,
              background: COLORS.cardBg,
              width: "100%",
            }}
          >
            <CardHeader style={{ padding: "20px 20px 16px 20px" }}>
              <CardTitle
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: COLORS.primary,
                }}
              >
                고용 현황 상세 데이터
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: "0 20px 20px 20px" }}>
              {filteredEmployments.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "50px 0",
                    color: COLORS.secondary,
                  }}
                >
                  <AlertCircle
                    style={{
                      width: "48px",
                      height: "48px",
                      margin: "0 auto 16px auto",
                      color: COLORS.secondary,
                    }}
                  />
                  <p style={{ fontSize: "14px", fontWeight: 600 }}>
                    선택한 기간에 고용 현황 데이터가 없습니다.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    overflowX: "auto",
                    borderRadius: "8px",
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <table style={{ width: "100%" }}>
                    <thead>
                      <tr
                        style={{
                          borderBottom: `2px solid ${COLORS.border}`,
                          background: "#F8FAFC",
                        }}
                      >
                        <th
                          style={{
                            padding: "14px 18px",
                            textAlign: "left",
                            fontSize: "13px",
                            fontWeight: 700,
                            color: COLORS.primary,
                          }}
                        >
                          조직명
                        </th>
                        <th
                          style={{
                            padding: "14px 18px",
                            textAlign: "center",
                            fontSize: "13px",
                            fontWeight: 700,
                            color: COLORS.primary,
                          }}
                        >
                          연도
                        </th>
                        <th
                          style={{
                            padding: "14px 18px",
                            textAlign: "right",
                            fontSize: "13px",
                            fontWeight: 700,
                            color: COLORS.primary,
                          }}
                        >
                          총 인원
                        </th>
                        <th
                          style={{
                            padding: "14px 18px",
                            textAlign: "right",
                            fontSize: "13px",
                            fontWeight: 700,
                            color: COLORS.primary,
                          }}
                        >
                          여성 비율
                        </th>
                        <th
                          style={{
                            padding: "14px 18px",
                            textAlign: "right",
                            fontSize: "13px",
                            fontWeight: 700,
                            color: COLORS.primary,
                          }}
                        >
                          정규직 비율
                        </th>
                        <th
                          style={{
                            padding: "14px 18px",
                            textAlign: "right",
                            fontSize: "13px",
                            fontWeight: 700,
                            color: COLORS.primary,
                          }}
                        >
                          평균 근속
                        </th>
                        <th
                          style={{
                            padding: "14px 18px",
                            textAlign: "center",
                            fontSize: "13px",
                            fontWeight: 700,
                            color: COLORS.primary,
                          }}
                        >
                          검증상태
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployments
                        .slice(0, 50)
                        .map((employment, idx) => {
                          const femaleRatio =
                            employment.totalEmployees > 0
                              ? (
                                  (employment.femaleEmployees /
                                    employment.totalEmployees) *
                                  100
                                ).toFixed(1)
                              : "0.0";
                          const regularRatio =
                            employment.totalEmployees > 0
                              ? (
                                  (employment.regularEmployees /
                                    employment.totalEmployees) *
                                  100
                                ).toFixed(1)
                              : "0.0";

                          return (
                            <tr
                              key={employment.id}
                              style={{
                                borderBottom: `1px solid ${COLORS.border}`,
                                background: idx % 2 === 0 ? "white" : "#FAFAFA",
                                transition: "background 0.2s",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = "#F1F5F9")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                  idx % 2 === 0 ? "white" : "#FAFAFA")
                              }
                            >
                              <td
                                style={{
                                  padding: "14px 18px",
                                  fontSize: "13px",
                                  fontWeight: 600,
                                  color: COLORS.primary,
                                }}
                              >
                                {employment.organizationName}
                              </td>
                              <td
                                style={{
                                  padding: "14px 18px",
                                  textAlign: "center",
                                  fontSize: "13px",
                                  color: COLORS.secondary,
                                }}
                              >
                                {employment.year}
                              </td>
                              <td
                                style={{
                                  padding: "14px 18px",
                                  textAlign: "right",
                                  fontSize: "13px",
                                  fontWeight: 600,
                                  color: COLORS.primary,
                                }}
                              >
                                {formatNumber(employment.totalEmployees)}명
                              </td>
                              <td
                                style={{
                                  padding: "14px 18px",
                                  textAlign: "right",
                                  fontSize: "13px",
                                  color: COLORS.secondary,
                                }}
                              >
                                {femaleRatio}%
                              </td>
                              <td
                                style={{
                                  padding: "14px 18px",
                                  textAlign: "right",
                                  fontSize: "13px",
                                  color: COLORS.secondary,
                                }}
                              >
                                {regularRatio}%
                              </td>
                              <td
                                style={{
                                  padding: "14px 18px",
                                  textAlign: "right",
                                  fontSize: "13px",
                                  color: COLORS.secondary,
                                }}
                              >
                                {employment.averageServiceYears
                                  ? employment.averageServiceYears.toFixed(1)
                                  : "-"}
                                년
                              </td>
                              <td
                                style={{
                                  padding: "14px 18px",
                                  textAlign: "center",
                                }}
                              >
                                <Badge
                                  variant={
                                    employment.verificationStatus === "검증완료"
                                      ? "default"
                                      : "secondary"
                                  }
                                  style={{
                                    borderRadius: "6px",
                                    padding: "4px 10px",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    background:
                                      employment.verificationStatus ===
                                      "검증완료"
                                        ? COLORS.success
                                        : COLORS.secondary,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <Database
                                    style={{ width: "12px", height: "12px" }}
                                  />
                                  {employment.verificationStatus}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                  {filteredEmployments.length > 50 && (
                    <div
                      style={{
                        padding: "16px",
                        textAlign: "center",
                        background: "#F8FAFC",
                        borderTop: `1px solid ${COLORS.border}`,
                        fontSize: "12px",
                        color: COLORS.secondary,
                      }}
                    >
                      상위 50개 항목만 표시됩니다. 총{" "}
                      {filteredEmployments.length}개 항목
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
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
