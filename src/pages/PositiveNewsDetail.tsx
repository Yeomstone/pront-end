import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

const CATEGORY_COLORS = {
  기부: "#10b981",
  봉사: "#3b82f6",
  환경: "#10b981",
  교육: "#f59e0b",
  일자리: "#8b5cf6",
  지역사회: "#ec4899",
};

interface News {
  id: number;
  organizationName: string;
  title: string;
  description: string;
  url: string;
  publishedDate: string;
  category: string;
  matchedKeywords: string;
}

interface YearStats {
  year: number;
  count: number;
  [key: string]: number; // 인덱스 시그니처 추가
}

interface CategoryStats {
  category: string;
  count: number;
  [key: string]: string | number; // 인덱스 시그니처 추가 - string과 number 모두 허용
}

const PositiveNewsDetail = () => {
  const [news, setNews] = useState<News[]>([]);
  const [yearStats, setYearStats] = useState<YearStats[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // 필터
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedOrg, setSelectedOrg] = useState<number>(1); // 기본: 첫 번째 조직

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchNews();
    fetchStatistics();
  }, [currentPage, selectedYear, selectedCategory, selectedOrg]);

  const fetchNews = async () => {
    try {
      let url = `http://localhost:8080/api/positive-news/organization/${selectedOrg}?page=${
        currentPage - 1
      }&size=${ITEMS_PER_PAGE}`;

      if (selectedYear !== "all") {
        url += `&year=${selectedYear}`;
      }
      if (selectedCategory !== "all") {
        url += `&category=${selectedCategory}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      setNews(data.content);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalElements);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const [yearRes, categoryRes] = await Promise.all([
        fetch(
          `http://localhost:8080/api/positive-news/organization/${selectedOrg}/stats/by-year`
        ),
        fetch(
          `http://localhost:8080/api/positive-news/organization/${selectedOrg}/stats/by-category`
        ),
      ]);

      const yearData = await yearRes.json();
      const categoryData = await categoryRes.json();

      setYearStats(yearData);
      setCategoryStats(categoryData);
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
    }
  };

  const handleNewsClick = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Title */}
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          marginBottom: "32px",
          color: "#111827",
        }}
      >
        📰 긍정 뉴스 수집
      </h1>

      {/* Statistics Charts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "24px",
          marginBottom: "24px",
        }}
      >
        {/* Year Statistics */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "16px",
              color: "#111827",
            }}
          >
            📅 연도별 뉴스 수
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={yearStats}>
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Statistics */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "16px",
              color: "#111827",
            }}
          >
            🏷️ 카테고리별 분포
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryStats}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.category}: ${entry.count}`}
              >
                {categoryStats.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div>
            <label
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginRight: "8px",
              }}
            >
              연도:
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: "8px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            >
              <option value="all">전체</option>
              {yearStats.map((stat) => (
                <option key={stat.year} value={stat.year}>
                  {stat.year}년
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginRight: "8px",
              }}
            >
              카테고리:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: "8px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            >
              <option value="all">전체</option>
              {categoryStats.map((stat) => (
                <option key={stat.category} value={stat.category}>
                  {stat.category}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{ marginLeft: "auto", color: "#6b7280", fontSize: "14px" }}
          >
            총 <strong style={{ color: "#3b82f6" }}>{totalCount}</strong>개의
            뉴스
          </div>
        </div>
      </div>

      {/* News Cards */}
      <div style={{ display: "grid", gap: "16px" }}>
        {news.map((item) => (
          <div
            key={item.id}
            onClick={() => handleNewsClick(item.url)}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              cursor: "pointer",
              transition: "all 0.2s",
              border: "1px solid #e5e7eb",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "12px",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#111827",
                  flex: 1,
                  marginRight: "16px",
                }}
              >
                {item.title}
              </h3>
              <span
                style={{
                  padding: "4px 12px",
                  background:
                    CATEGORY_COLORS[
                      item.category as keyof typeof CATEGORY_COLORS
                    ] || "#e5e7eb",
                  color: "white",
                  borderRadius: "16px",
                  fontSize: "12px",
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                }}
              >
                {item.category}
              </span>
            </div>

            <p
              style={{
                color: "#6b7280",
                fontSize: "14px",
                lineHeight: "1.6",
                marginBottom: "12px",
              }}
            >
              {item.description}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "13px",
                color: "#9ca3af",
              }}
            >
              <span>{item.publishedDate}</span>
              <span>키워드: {item.matchedKeywords}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginTop: "32px",
          }}
        >
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: "8px 16px",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              background: currentPage === 1 ? "#f3f4f6" : "white",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            이전
          </button>

          <span
            style={{
              padding: "8px 16px",
              display: "flex",
              alignItems: "center",
              color: "#374151",
            }}
          >
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: "8px 16px",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              background: currentPage === totalPages ? "#f3f4f6" : "white",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};

export default PositiveNewsDetail;
