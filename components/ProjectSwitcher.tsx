"use client";

import React, { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { LayoutGrid, AlertCircle } from "lucide-react";

export const ProjectSwitcher = () => {
    const [activeHost, setActiveHost] = useState("");

    useEffect(() => {
        setActiveHost(window.location.hostname);
    }, []);

    const projects = [
        {
            name: "Selecting effective firms",
            url: "https://zir.octahash.com/",
            icon: LayoutGrid,
            active: activeHost.includes('zir')
        },
        {
            name: "Identifying Bubbles",
            url: "https://zimm.octahash.com/",
            icon: AlertCircle,
            active: activeHost.includes('zimm') || (activeHost !== "" && !activeHost.includes('zir'))
        }
    ];

    return (
        <div className="flex items-center justify-center w-full py-4 px-6 border-b border-white/5 bg-black/20 backdrop-blur-sm sticky top-0 z-[100]">
            <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10 shadow-2xl">
                {projects.map((project) => {
                    const Icon = project.icon;
                    return (
                        <a
                            key={project.url}
                            href={project.url}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-500 group relative overflow-hidden",
                                project.active
                                    ? "text-white scale-105"
                                    : "text-white/40 hover:text-white hover:bg-white/10"
                            )}
                        >
                            {project.active && (
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 animate-gradient-x" />
                            )}
                            <div className="relative flex items-center gap-2">
                                <Icon className={cn("w-4 h-4 transition-transform duration-500 group-hover:scale-110",
                                    project.active ? "text-white" : "text-white/30 group-hover:text-white"
                                )} />
                                <span>{project.name}</span>
                            </div>

                            {project.active && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/40" />
                            )}
                        </a>
                    );
                })}
            </div>
        </div>
    );
};
