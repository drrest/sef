"use client";

import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
    Scatter,
    ComposedChart,
    LabelList
} from "recharts";
import { GlassCard } from "./ui/GlassCard";

interface MetricChartProps {
    data: { n: number; m: number; label: string }[];
    firmName: string;
}

export function MetricChart({ data, firmName }: MetricChartProps) {
    if (!data || data.length === 0) return null;

    return (
        <GlassCard className="h-[500px] flex flex-col" contentClassName="p-0 h-full">
            <div style={{ width: '100%', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 30, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                            type="number"
                            dataKey="n"
                            name="N (Cost Change)"
                            stroke="#9ca3af"
                            label={{ value: "N (Cost Δ)", position: "insideBottom", offset: -10, fill: "#9ca3af" }}
                            height={30}
                        />
                        <YAxis
                            type="number"
                            dataKey="m"
                            name="M (Efficiency)"
                            stroke="#9ca3af"
                            label={{ value: "M (Efficiency)", angle: -90, position: "insideLeft", fill: "#9ca3af", offset: 10 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(0,0,0,0.8)",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "8px",
                                color: "#fff",
                            }}
                            cursor={{ strokeDasharray: "3 3" }}
                        />
                        <Legend verticalAlign="top" height={36} />
                        <ReferenceLine x={0} stroke="rgba(255,255,255,0.3)" />
                        <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" />

                        <Line
                            type="monotone"
                            dataKey="m"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            dot={false}
                            activeDot={false}
                            legendType="none"

                        />

                        <Scatter
                            name="Year Pairs"
                            dataKey="m"
                            fill="#f472b6"
                            shape="circle"
                        >

                            <LabelList dataKey="label" position="top" offset={10} style={{ fill: '#fff', fontSize: '12px' }} />
                        </Scatter>

                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
    );
}
