"use client";

import React, { useState, useEffect, useRef } from "react";
import { GlassCard } from "./ui/GlassCard";
import { Calendar } from "lucide-react";

interface YearRangeFilterProps {
    minYear: number;
    maxYear: number;
    onRangeChange: (from: number, to: number) => void;
}

export function YearRangeFilter({ minYear, maxYear, onRangeChange }: YearRangeFilterProps) {
    const [fromYear, setFromYear] = useState(minYear);
    const [toYear, setToYear] = useState(maxYear);
    const [isDragging, setIsDragging] = useState<'from' | 'to' | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setFromYear(minYear);
        setToYear(maxYear);
        setIsInitialized(true);
    }, [minYear, maxYear]);

    useEffect(() => {
        if (isInitialized) {
            onRangeChange(fromYear, toYear);
        }
    }, [fromYear, toYear]);

    const getPositionFromYear = (year: number) => {
        return ((year - minYear) / (maxYear - minYear)) * 100;
    };

    const getYearFromPosition = (position: number) => {
        const year = Math.round(minYear + (position / 100) * (maxYear - minYear));
        return Math.max(minYear, Math.min(maxYear, year));
    };

    const handleMouseDown = (type: 'from' | 'to') => (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(type);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !sliderRef.current) return;

        const rect = sliderRef.current.getBoundingClientRect();
        const position = ((e.clientX - rect.left) / rect.width) * 100;
        const year = getYearFromPosition(position);

        if (isDragging === 'from') {
            setFromYear(Math.min(year, toYear));
        } else {
            setToYear(Math.max(year, fromYear));
        }
    };

    const handleMouseUp = () => {
        setIsDragging(null);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, fromYear, toYear]);

    const fromPosition = getPositionFromYear(fromYear);
    const toPosition = getPositionFromYear(toYear);

    return (
        <GlassCard className="overflow-visible">
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-purple-400" />
                <label className="text-sm font-medium text-white/80">Year Range Filter</label>
            </div>

            <div className="space-y-6">
                {/* Year Display */}
                <div className="flex justify-between items-center">
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-white/40 mb-1">From</span>
                        <div className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg">
                            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                {fromYear}
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 mx-4 h-px bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-purple-500/50"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-white/40 mb-1">To</span>
                        <div className="px-4 py-2 bg-gradient-to-r from-pink-500/20 to-red-500/20 border border-pink-500/30 rounded-lg">
                            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-red-400">
                                {toYear}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Custom Range Slider */}
                <div className="relative pt-6 pb-2">
                    <div
                        ref={sliderRef}
                        className="relative h-2 bg-white/10 rounded-full cursor-pointer"
                    >
                        {/* Active Range */}
                        <div
                            className="absolute h-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full transition-all"
                            style={{
                                left: `${fromPosition}%`,
                                width: `${toPosition - fromPosition}%`,
                            }}
                        />

                        {/* From Handle */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing"
                            style={{ left: `${fromPosition}%` }}
                            onMouseDown={handleMouseDown('from')}
                        >
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white shadow-lg transition-transform ${isDragging === 'from' ? 'scale-125' : 'hover:scale-110'}`}>
                                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-75"></div>
                            </div>
                        </div>

                        {/* To Handle */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing"
                            style={{ left: `${toPosition}%` }}
                            onMouseDown={handleMouseDown('to')}
                        >
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-red-600 border-2 border-white shadow-lg transition-transform ${isDragging === 'to' ? 'scale-125' : 'hover:scale-110'}`}>
                                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-75"></div>
                            </div>
                        </div>
                    </div>

                    {/* Year Markers */}
                    <div className="relative mt-4">
                        <div className="flex justify-between text-xs text-white/30 font-mono">
                            {Array.from({ length: Math.min(maxYear - minYear + 1, 10) }, (_, i) => {
                                const year = minYear + Math.floor((i / 9) * (maxYear - minYear));
                                return <span key={year}>{year}</span>;
                            })}
                        </div>
                    </div>
                </div>

                {/* Quick Presets */}
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => {
                            setFromYear(minYear);
                            setToYear(maxYear);
                        }}
                        className="px-3 py-1 text-xs rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 text-white/60 hover:text-white transition-all"
                    >
                        All Years
                    </button>
                    <button
                        onClick={() => {
                            setFromYear(Math.max(minYear, maxYear - 5));
                            setToYear(maxYear);
                        }}
                        className="px-3 py-1 text-xs rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 text-white/60 hover:text-white transition-all"
                    >
                        Last 5 Years
                    </button>
                    <button
                        onClick={() => {
                            setFromYear(Math.max(minYear, maxYear - 10));
                            setToYear(maxYear);
                        }}
                        className="px-3 py-1 text-xs rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 text-white/60 hover:text-white transition-all"
                    >
                        Last 10 Years
                    </button>
                </div>

                {/* Stats */}
                <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between text-xs">
                        <span className="text-white/40">Selected Range:</span>
                        <span className="text-purple-300 font-mono font-semibold">
                            {toYear - fromYear + 1} years
                        </span>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}
