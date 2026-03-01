"use client";

import { useState, useEffect } from 'react';

export function useDarkMode() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('darkMode');
        if (saved === 'true') setIsDark(true);
    }, []);

    const toggle = () => {
        setIsDark(prev => {
            localStorage.setItem('darkMode', String(!prev));
            return !prev;
        });
    };

    const bg = isDark
        ? 'bg-gradient-to-br from-[#0a0a0f] via-[#111118] to-[#0d0d14]'
        : 'bg-gradient-to-br from-[#b8860b] via-[#8b4513] to-[#1a0005]';

    const sidebar = isDark
        ? 'bg-[#0c0c12]/80 border-white/5'
        : 'bg-black/40 border-white/5';

    const header = isDark
        ? 'bg-[#0c0c12]/60 border-white/5'
        : 'bg-black/20 border-white/5';

    const card = isDark
        ? 'bg-[#16161e]/80 border-white/5'
        : 'bg-black/20 border-white/5';

    const accent = isDark ? 'text-blue-400' : 'text-amber-500';
    const accentBg = isDark ? 'bg-blue-500' : 'bg-amber-500';
    const accentBgHover = isDark ? 'hover:bg-blue-400' : 'hover:bg-amber-400';
    const accentBorder = isDark ? 'border-blue-500/30' : 'border-amber-500/30';
    const accentText = isDark ? 'text-blue-400' : 'text-amber-500';
    const accentBgLight = isDark ? 'bg-blue-500/10' : 'bg-amber-500/10';
    const accentShadow = isDark ? 'shadow-blue-500/20' : 'shadow-amber-500/20';

    return {
        isDark,
        toggle,
        bg,
        sidebar,
        header,
        card,
        accent,
        accentBg,
        accentBgHover,
        accentBorder,
        accentText,
        accentBgLight,
        accentShadow,
    };
}
