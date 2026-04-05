import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dices } from 'lucide-react';
import { generateStudioName } from '@/engine/generators/names';
import { useGameStore } from '@/store/gameStore';
import { RandomGenerator } from '@/engine/utils/rng';
import { ARCHETYPES, ArchetypeData } from '@/engine/data/archetypes';
import { ArchetypeKey } from '@/engine/types';
import { ArchetypeCard } from '@/components/setup/ArchetypeCard';

const NewGame = () => {
  const navigate = useNavigate();
  const { newGame } = useGameStore();
  const [studioName, setStudioName] = useState('');
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeKey | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autoStart') === 'true') {
      navigate({ to: '/dashboard' });
    }
  }, [navigate]);

  const handleLaunch = async () => {
    if (!studioName.trim() || !selectedArchetype) return;
    await newGame(studioName.trim(), selectedArchetype);
    navigate({ to: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl space-y-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-display text-4xl font-bold text-foreground">Found Your Studio</h1>
          <p className="text-muted-foreground">Name your studio and choose your starting identity.</p>
        </div>

        {/* Studio Name */}
        <div className="max-w-md mx-auto space-y-2">
          <label htmlFor="studioName" className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Studio Name</label>
          <div className="flex gap-2">
            <Input
              id="studioName"
              value={studioName}
              onChange={e => setStudioName(e.target.value)}
              placeholder="Enter your studio name..."
              className="h-14 text-lg text-center font-display font-semibold bg-card border-border flex-1"
              maxLength={30}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-14 w-14 shrink-0"
              onClick={() => {
                const rng = new RandomGenerator(Math.floor(Math.random() * 1000000));
                setStudioName(generateStudioName([], rng));
              }}
              title="Randomize Studio Name"
              aria-label="Randomize Studio Name"
            >
              <Dices className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Archetypes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.values(ARCHETYPES) as ArchetypeData[]).map(arch => (
            <ArchetypeCard
              key={arch.key}
              arch={arch}
              selected={selectedArchetype === arch.key}
              onSelect={setSelectedArchetype}
            />
          ))}
        </div>

        {/* Launch */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => navigate({ to: '/' })} className="font-display">
            Back
          </Button>
          <Button
            onClick={handleLaunch}
            disabled={!studioName.trim() || !selectedArchetype}
            size="lg"
            className="px-12 font-display font-bold text-lg"
          >
            Launch Studio →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewGame;
