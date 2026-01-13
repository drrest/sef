"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { DataManager, FirmData } from "./DataManager";
import { GlassCard } from "./ui/GlassCard";
import { MetricChart } from "./MetricChart";
import { MetricTable } from "./MetricTable";
import { YearRangeFilter } from "./YearRangeFilter";
import { ExportButtons } from "./ExportButtons";
import { Search, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
    const [data, setData] = useState<FirmData[]>([]);
    const [selectedFirm, setSelectedFirm] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [executionTime, setExecutionTime] = useState<number | null>(null);
    const [yearRange, setYearRange] = useState<{ from: number; to: number } | null>(null);
    const exportRef = useRef<HTMLDivElement>(null);

    // Memoized callback to prevent infinite loops
    const handleYearRangeChange = useCallback((from: number, to: number) => {
        setYearRange({ from, to });
    }, []);

    // Filter data by year range
    const filteredData = useMemo(() => {
        if (!yearRange) return data;
        return data.filter(row => row.year >= yearRange.from && row.year <= yearRange.to);
    }, [data, yearRange]);

    const companies = useMemo(() => {
        const map = new Map<string, FirmData[]>();
        filteredData.forEach((row) => {
            if (!map.has(row.name)) {
                map.set(row.name, []);
            }
            map.get(row.name)?.push(row);
        });
        return map;
    }, [filteredData]);

    const allYears = useMemo(() => {
        const years = new Set<number>();
        data.forEach(row => years.add(row.year));
        return Array.from(years).sort((a, b) => a - b);
    }, [data]);

    const firmNames = useMemo(() => Array.from(companies.keys()).sort(), [companies]);


    const filteredFirms = useMemo(() => {
        if (!searchQuery) return [];
        return firmNames.filter(name =>
            name && typeof name === 'string' && name.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 10); // Limit to 10
    }, [firmNames, searchQuery]);


    const hasValidData = (rows: FirmData[]) => {
        if (rows.length < 2) return false;
        const sortedRows = [...rows].sort((a, b) => a.year - b.year);
        for (let i = 0; i < sortedRows.length - 1; i++) {
            if (sortedRows[i].year + 1 === sortedRows[i + 1].year) {
                return true;
            }
        }
        return false;
    };


    const topFirms = useMemo(() => {
        if (companies.size === 0) return [];

        const firmStats = Array.from(companies.entries())
            .filter(([_, rows]) => hasValidData(rows)) // Filter out invalid
            .map(([name, rows]) => {
                // Find latest year record for sorting by latest MV
                const latestRow = rows.reduce((prev, curr) => (prev.year > curr.year ? prev : curr));
                return {
                    name,
                    metric: latestRow.market_value,
                    metricLabel: "Market Value",
                    year: latestRow.year
                };
            });

        // Sort by metric desc
        return firmStats.sort((a, b) => b.metric - a.metric).slice(0, 50);
    }, [companies]);


    const results = useMemo(() => {
        if (!selectedFirm || !companies.has(selectedFirm)) return [];

        const start = performance.now();

        // Sort logic
        const firmData = companies.get(selectedFirm)!.sort((a, b) => a.year - b.year);
        const yearMap = new Map(firmData.map(r => [r.year, r]));
        const sortedYears = firmData.map(r => r.year);
        const calcResults = [];

        for (let i = 0; i < sortedYears.length - 1; i++) {
            const yPrev = sortedYears[i];
            const yCurr = sortedYears[i + 1];

            // Only calculate for consecutive years
            if (yCurr === yPrev + 1) {
                const prev = yearMap.get(yPrev)!;
                const curr = yearMap.get(yCurr)!;

                try {
                    // Costs = Sales - Profit
                    const costsCurr = curr.sales - curr.profit;
                    const costsPrev = prev.sales - prev.profit;

                    // N: Change in costs
                    const nVal = costsCurr - costsPrev;

                    // M: Efficiency = Delta Sales / Delta Costs
                    const salesGrowth = curr.sales - prev.sales;

                    if (nVal !== 0) {
                        const mVal = salesGrowth / nVal;
                        if (isFinite(mVal)) {
                            calcResults.push({
                                years: `${yPrev}-${yCurr}`,
                                n: nVal,
                                m: mVal,
                                label: `${yPrev}-${yCurr}`
                            });
                        }
                    }
                } catch (e) {
                    console.error("Calculation error", e);
                }
            }
        }

        const end = performance.now();
        setExecutionTime(end - start);

        return calcResults;
    }, [selectedFirm, companies]);


    return (
        <div className="container mx-auto p-6 space-y-8 max-w-[1600px]">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                        SEF <span className="text-white/20 text-2xl font-light">Cloud Calculator</span>
                    </h1>
                    <p className="text-white/50 mt-1">Financial Cloud Calculator</p>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                    {selectedFirm && (
                        <ExportButtons
                            targetRef={exportRef}
                            fileName={`${selectedFirm.replace(/[^a-z0-9]/gi, '_')}_analysis`}
                        />
                    )}

                    {executionTime !== null && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-mono text-green-400">
                            <Clock className="w-4 h-4" />
                            {executionTime.toFixed(2)}ms
                        </div>
                    )}
                </div>
            </header>

            {/* Data Section */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Sidebar / Controls */}
                <div className="space-y-6 lg:col-span-4">
                    <DataManager onDataLoaded={setData} />

                    {data.length > 0 && allYears.length > 0 && (
                        <YearRangeFilter
                            minYear={allYears[0]}
                            maxYear={allYears[allYears.length - 1]}
                            onRangeChange={handleYearRangeChange}
                        />
                    )}

                    {data.length > 0 && (
                        <div className="space-y-6">
                            <GlassCard className="overflow-visible z-20">
                                <label className="block text-sm font-medium text-white/50 mb-2">Select Firm</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-black/40 text-white placeholder-gray-500 focus:outline-none focus:bg-black/60 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 sm:text-sm transition-all"
                                        placeholder="Search firm..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            if (e.target.value === "") setSelectedFirm("");
                                        }}
                                    />

                                    {/* Autocomplete Dropdown */}
                                    {searchQuery && filteredFirms.length > 0 && (
                                        <div className="absolute z-50 mt-1 w-full bg-[#1a1a1a] border border-white/10 rounded-md shadow-lg max-h-60 overflow-auto">
                                            {filteredFirms.map((firm) => (
                                                <button
                                                    key={firm}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-purple-600 hover:text-white transition-colors"
                                                    onClick={() => {
                                                        setSelectedFirm(firm);
                                                        setSearchQuery(firm);
                                                    }}
                                                >
                                                    {firm}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 text-xs text-white/30">
                                    {companies.size} firms loaded
                                </div>
                            </GlassCard>

                            {/* Top 50 List */}
                            <GlassCard className="max-h-[600px] overflow-y-auto custom-scrollbar">
                                <h3 className="text-lg font-bold mb-4 text-white/80 sticky top-0 bg-black/20 backdrop-blur-md py-2 -mt-2">Top 50 by Market Value (Analyzable)</h3>
                                <div className="space-y-2">
                                    {topFirms.map((firm, idx) => (
                                        <div
                                            key={firm.name}
                                            onClick={() => {
                                                setSelectedFirm(firm.name);
                                                setSearchQuery(firm.name);
                                            }}
                                            className={cn(
                                                "flex justify-between items-center p-2 rounded-lg cursor-pointer transition-all hover:bg-white/10",
                                                selectedFirm === firm.name ? "bg-purple-500/20 border border-purple-500/30" : "bg-white/5 border border-transparent"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-mono text-white/30 w-5">#{idx + 1}</span>
                                                <span className="text-sm font-medium text-white/90 truncate max-w-[200px]" title={firm.name}>{firm.name}</span>
                                            </div>
                                            <div className="text-xs text-green-300 font-mono">
                                                {firm.metric.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="lg:col-span-8 space-y-6">
                    {selectedFirm && results.length > 0 ? (
                        <div ref={exportRef} className="export-container space-y-6 bg-[#0a0a0a] p-6 rounded-2xl">
                            {/* Company Header for Export */}
                            <div className="px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10">
                                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                                    Company: {selectedFirm}
                                </h2>
                            </div>

                            <MetricChart data={results} firmName={selectedFirm} />
                            <MetricTable results={results} />
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center p-12 text-center text-white/20 border-2 border-dashed border-white/5 rounded-3xl">
                            {data.length === 0 ? "Please load a dataset to begin." :
                                !selectedFirm ? "Select a firm to view metamorphosis analysis." :
                                    "Insufficient data for this firm (requires consecutive years)."}
                        </div>
                    )}
                </div>

                {/* Documentation Section */}
                <div className="md:col-span-12">
                    <GlassCard>
                        <h2 className="text-xl font-bold text-white mb-4">How it works & What it shows</h2>
                        <div className="grid md:grid-cols-2 gap-6 text-sm text-white/70">
                            <div>
                                <h3 className="font-semibold text-purple-300 mb-2">How to use</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Select a firm from the <strong>Top 50</strong> list on the left or use the <strong>Search</strong> bar.</li>
                                    <li>The system automatically analyzes financial data for all available consecutive years (2008-2023).</li>
                                    <li>Firms without consecutive data are excluded from the Top 50 list.</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-pink-300 mb-2">The chart plots the relationship between two key derived metrics:</h3>
                                <div className="space-y-2">
                                    <ul className="list-disc list-inside">
                                        <li><strong>Axis X (N)</strong>: Change in absolute costs ($Costs = Sales - Profit$) between years.</li>
                                        <li><strong>Axis Y (M)</strong>: Efficiency coefficient (ratio of sales growth to cost growth).</li>
                                    </ul>
                                    <p className="opacity-70 mt-2">
                                        The parameter <strong>N</strong> shows how much the company's total costs have increased or decreased. The parameter <strong>M</strong> shows the "return" on these costs: how many units of additional revenue the company received for each unit of cost increase. A value of $M=1$ means revenue grows at the same rate as costs. $M {" > "} 1$ indicates efficient growth.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </section>
        </div>
    );
}
