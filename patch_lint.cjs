const fs = require('fs');

const hubContent = fs.readFileSync('src/components/talent/TalentHub.tsx', 'utf8');
const newHub = hubContent.replace(/import \{ Search, Filter, Users, Star, Database, Target, ShieldCheck \} from 'lucide-react';/, "import { Search, Users, Star, Database, ShieldCheck } from 'lucide-react';")
                        .replace(/import \{ TooltipWrapper \} from '@\/components\/ui\/tooltip-wrapper';\n/, '');
fs.writeFileSync('src/components/talent/TalentHub.tsx', newHub);

const auctionContent = fs.readFileSync('src/components/talent/LiveAuctionDashboard.tsx', 'utf8');
const newAuction = auctionContent.replace(/import \{ Users, Timer, Sparkles, TrendingUp, DollarSign, Clock, AlertTriangle, ArrowUpRight, Award, Flame, Star, Zap, Activity, ChevronRight \} from 'lucide-react';/, "import { Users, Timer, Sparkles, TrendingUp, DollarSign, AlertTriangle, Award, Flame, Star, Zap, Activity } from 'lucide-react';");
fs.writeFileSync('src/components/talent/LiveAuctionDashboard.tsx', newAuction);

const castingContent = fs.readFileSync('src/components/talent/CastingFeedback.tsx', 'utf8');
const newCasting = castingContent.replace(/import \{ AlertTriangle, CheckCircle2, TrendingUp, Heart, Star, Sparkles, Users, Award, ShieldCheck, Skull, DollarSign, Building2 \} from 'lucide-react';/, "import { AlertTriangle, CheckCircle2, Sparkles, Users, Award, ShieldCheck, Skull, DollarSign } from 'lucide-react';");
fs.writeFileSync('src/components/talent/CastingFeedback.tsx', newCasting);

console.log('patched unused imports');
