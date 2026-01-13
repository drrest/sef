import React from "react";
import { GlassCard } from "./ui/GlassCard";

interface ResultRow {
    years: string;
    n: number;
    m: number;
}

interface MetricTableProps {
    results: ResultRow[];
}

export function MetricTable({ results }: MetricTableProps) {
    if (!results || results.length === 0) return null;

    return (
        <GlassCard>
            <h3 className="text-xl font-bold mb-4 text-white/90">Details</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-white/50 text-sm uppercase tracking-wider">
                            <th className="p-3">Years</th>
                            <th className="p-3">N (Profitability Δ)</th>
                            <th className="p-3">M (Elasticity)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {results.map((row, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                <td className="p-3 font-mono text-purple-300">{row.years}</td>
                                <td className="p-3 font-mono text-gray-300">{row.n.toFixed(4)}</td>
                                <td className="p-3 font-mono text-gray-300">{row.m.toFixed(4)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </GlassCard>
    );
}
