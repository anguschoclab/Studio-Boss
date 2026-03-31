import { useEffect } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useGameStore } from '@/store/gameStore';
import { ArchetypeKey } from '@/engine/types';

export const AutoInitializer = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { gameState, devAutoInit } = useGameStore();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const autoStart = params.get('autoStart');
        const archetype = params.get('archetype') as ArchetypeKey | null;

        if (autoStart === 'true') {
            if (!gameState) {
                console.log('[AutoInitializer] State missing, triggering dev auto-start...');
                devAutoInit(archetype || 'major');
            }
            
            // Allow a small delay or check for dashboard navigation
            const isRoot = location.pathname === '/' || location.pathname === '/new-game';
            if (isRoot) {
                console.log(`[AutoInitializer] On root/new-game, navigating to dashboard...`);
                // Preserve the autoStart param to prevent Dashboard from redirecting back
                navigate({ 
                    to: '/dashboard', 
                    search: (prev: any) => ({ ...prev, autoStart: 'true' }),
                    replace: true 
                });
            }
        }
    }, [gameState, devAutoInit, navigate, location.pathname]);

    return null;
};
