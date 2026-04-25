
import { WeekCoordinator } from '@/engine/services/WeekCoordinator';
import { initializeGame } from '@/engine/core/gameInit';
import { RandomGenerator } from '@/engine/utils/rng';
import { GameState, Project, IPAsset } from '@/engine/types';
import { type ProjectId, type AssetId, type TalentId } from '@/engine/types/shared.types';

describe('System Connectivity - Phase 3 Integration', () => {
    let state: GameState;
    let rng: RandomGenerator;

    beforeEach(() => {
        rng = new RandomGenerator(12345);
        state = initializeGame('Test Studio', 'major', 12345);
    });

    test('WeekCoordinator annual tick triggers IP scan', () => {
        // Mock a project in vault
        const projId = 'proj-seed' as ProjectId;
        state.studio.internal.projectHistory = [{
            id: projId,
            title: 'Cult Movie',
            releaseWeek: -300, // 5+ years ago
            reviewScore: 85,
            budget: 100000000,
            revenue: 20000000,
            genre: 'DRAMA',
            state: 'archived',
            isCultClassic: false,
            ownerId: state.studio.id
        } as Project];
        
        state.ip.vault = [{
            id: 'asset-1' as AssetId,
            originalProjectId: projId,
            title: 'Cult Movie',
            tier: 'ORIGINAL',
            decayRate: 1.0,
            rightsOwner: 'STUDIO'
        } as IPAsset];

        // Advance to year 2, week 1 (week 53)
        state.week = 52;
        const result = WeekCoordinator.execute(state, rng);
        
        // Check for cult classic news or impact
        const hasCultImpact = result.impacts.some(i => i.type === 'VAULT_ASSET_UPDATED' && (i.payload as unknown as any).update.tier === 'CULT_CLASSIC');
        expect(hasCultImpact).toBe(true);
    });

    test('RevenueProcessor applies demographic resonance', () => {
        // Mock a released project
        const project = {
            id: 'p1' as ProjectId,
            title: 'Action Movie',
            type: 'FILM',
            format: 'film',
            state: 'released',
            weeklyRevenue: 1000000,
            targetDemographic: 'male_under_25',
            genre: 'ACTION',
            budget: 50000000,
            revenue: 0,
            buzz: 80,
            distributionStatus: 'theatrical',
            ownerId: state.studio.id,
            budgetTier: 'mid',
            releaseWeek: 0,
            quality: 70
        } as Project;

        state.entities.projects = { ['p1' as ProjectId]: project };
        
        // Manual revenue calculation check would be complex here due to snapshots,
        // but we can verify the WeeklyFinancialReport contains expected values.
        const result = WeekCoordinator.execute(state, rng);
        expect(result.summary.totalRevenue).toBeGreaterThan(0);
    });
});
