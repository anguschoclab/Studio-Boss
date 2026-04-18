import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Heart, Info, Users, Zap } from 'lucide-react';
import { Talent, Agency, Agent, Family } from '@/engine/types';
import { TalentAvatar } from '../TalentAvatar';

const Quote = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 7.55228 14.017 7V5C14.017 4.44772 14.4647 4 15.017 4H19.017C20.1216 4 21.017 4.89543 21.017 6V15C21.017 18.3137 18.3307 21 15.017 21H14.017ZM3 21L3 18C3 16.8954 3.89543 16 5 16H8C8.55228 16 9 15.5523 9 15V9C9 8.44772 8.55228 8 8 8H4C3.44772 8 3 7.55228 3 7V5C3 4.44772 3.44772 4 4 4H8C9.10457 4 10 4.89543 10 6V15C10 18.3137 7.31371 21 4 21H3Z" />
  </svg>
);

interface TalentBioTabProps {
  talent: Talent;
  agency: Agency | undefined;
  agent: Agent | undefined;
  family: Family | undefined;
  familyMembers: Talent[];
  onSelectTalent: (id: string | null) => void;
}

export const TalentBioTab: React.FC<TalentBioTabProps> = ({
  talent, agency, agent, family, familyMembers, onSelectTalent
}) => (
  <TabsContent value="bio" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 focus-visible:outline-none">
    <div className="grid grid-cols-5 gap-8">
      <div className="col-span-3 space-y-8">
        <div className="glass-panel p-8 rounded-3xl relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Quote className="w-20 h-20" />
          </div>
          <h4 className="text-[11px] font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
            <Info className="h-4 w-4" /> Biography
          </h4>
          <p className="text-base text-slate-300 leading-relaxed font-medium italic drop-shadow-sm">
            {talent.bio}
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-[11px] font-black text-primary uppercase tracking-widest flex items-center gap-2 pl-2">
            <Zap className="h-4 w-4" /> DID YOU KNOW?
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {talent.trivia?.map((t, i) => (
              <div key={i} className="bg-slate-900/30 p-5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all duration-300 flex gap-4">
                <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-black text-primary">{i + 1}</span>
                </div>
                <p className="text-sm text-slate-300 font-medium">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="col-span-2 space-y-6">
        <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/5 space-y-4 shadow-xl">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Briefcase className="h-4 w-4" /> Representation
          </h4>
          {agency ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Current Agency</p>
                <p className="font-black text-white text-lg tracking-tight uppercase italic">{agency.name}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="text-[9px] h-5 bg-primary/20 text-primary border-primary/20 uppercase font-black">{agency.tier}</Badge>
                  <Badge variant="secondary" className="text-[9px] h-5 bg-slate-800 text-slate-400 uppercase font-black">{agency.culture}</Badge>
                </div>
              </div>
              {talent.contractId && (
                <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                  <p className="text-[10px] font-bold text-rose-500/60 uppercase tracking-widest mb-1">Exclusive Pact</p>
                  <p className="text-xs font-black text-rose-400 uppercase italic">Active Industry Tie-up</p>
                  <p className="text-[9px] text-rose-400/60 font-bold mt-1 uppercase">Limited availability for outside projects</p>
                </div>
              )}
              {agent && (
                <div className="pl-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Primary Agent</p>
                  <p className="font-bold text-slate-200">{agent.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Specialty: {agent.specialty.replace('_', ' ')}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-10 text-center border-2 border-dashed border-white/5 rounded-2xl">
              <p className="text-xs italic text-slate-500 font-bold uppercase tracking-widest opacity-40">Unrepresented</p>
            </div>
          )}
        </div>

        {family && (
          <div className="bg-amber-500/5 p-6 border border-amber-500/10 rounded-3xl shadow-xl">
            <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Heart className="h-4 w-4" /> Industry Heritage
            </h4>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-black text-amber-500 text-2xl tracking-tighter">
                {family.name[0]}
              </div>
              <div>
                <p className="text-xs font-black text-amber-500 uppercase tracking-widest">The {family.name} Family</p>
                <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-400/80 uppercase px-2 py-0 h-4 mt-1">{family.status}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-amber-950/20 p-2 rounded-xl text-center border border-amber-500/10">
                <p className="text-[8px] font-black text-amber-500/60 uppercase">Prestige</p>
                <p className="text-sm font-black text-amber-200">{family.prestigeLegacy}</p>
              </div>
              <div className="bg-amber-950/20 p-2 rounded-xl text-center border border-amber-500/10">
                <p className="text-[8px] font-black text-amber-500/60 uppercase">Recognition</p>
                <p className="text-sm font-black text-amber-200">{family.recognition}</p>
              </div>
            </div>
            {familyMembers.length > 0 && (
              <div className="mt-4 pt-3 border-t border-amber-500/10">
                <p className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Users className="w-3 h-3" /> Family Members
                </p>
                <div className="flex flex-wrap gap-2">
                  {familyMembers.slice(0, 4).map(member => (
                    <button
                      type="button"
                      key={member.id}
                      className="flex items-center w-full sm:w-auto gap-2 bg-amber-950/30 px-2 py-1.5 rounded-xl border border-amber-500/10 hover:border-amber-500/30 transition-colors cursor-pointer text-left"
                      onClick={() => onSelectTalent(member.id)}
                    >
                      <TalentAvatar talent={member} size="xs" className="border-amber-500/20" />
                      <div>
                        <p className="text-[10px] font-bold text-amber-200 leading-tight">{member.name}</p>
                        <p className="text-[8px] font-bold text-amber-500/50 uppercase">{member.roles[0]}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className="text-[10px] text-amber-200/40 leading-relaxed font-bold uppercase tracking-tight mt-3">
              A recognized lineage in the Hollywood hierarchy. Transitioning from {family.status} status.
            </p>
          </div>
        )}
      </div>
    </div>
  </TabsContent>
);
