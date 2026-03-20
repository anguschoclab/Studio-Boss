import { pick } from '../utils';

const GENRE_PATTERNS: Record<string, string[][]> = {
  Action: [
    ['The', 'ADJECTIVE', 'NOUN'],
    ['The', 'ADJECTIVE', 'NOUN', 'Protocol'],
    ['Project', 'NOUN', 'Zero'],
    ['NOUN', 'Down'],
    ['VERB', 'or', 'VERB'],
    ['The', 'NAME', 'Ultimatum'],
    ['ADJECTIVE', 'Force'],
    ['Operation', 'ADJECTIVE', 'NOUN'],
    ['NOUN', 'of the', 'PLACE'],
    ['NOUN', 'of', 'NOUN'],
    ['Operation', 'NOUN'],
    ['VERB', 'Hard'],
    ['ADJECTIVE', 'NOUN', 'Protocol'],
    ['The', 'NOUN', 'Cinematic Universe'],
    ['NOUN', 'vs', 'NOUN'],
    ['ADJECTIVE', 'NOUN', ': Origins'],
    ['The', 'ADJECTIVE', 'Franchise'],
    ['Return to', 'PLACE']
  ],
  Comedy: [
    ['The', 'ADJECTIVE', 'NOUN'],
    ['Cancel', 'NAME'],
    ['The', 'ADJECTIVE', 'Influencer'],
    ['Trending in', 'PLACE'],
    ['The', 'Meme', 'Team'],
    ['Too', 'ADJECTIVE', 'to', 'VERB'],
    ['My', 'ADJECTIVE', 'Boss'],
    ['The', 'Podcast', 'Disaster'],
    ['VERB', 'Me in', 'PLACE'],
    ['My', 'ADJECTIVE', 'NOUN'],
    ['Don\'t', 'VERB', 'the', 'NOUN'],
    ['NOUN', 'Trouble'],
    ['ADJECTIVE', 'Business'],
    ['Cancel', 'the', 'NOUN'],
    ['ADJECTIVE', 'Content'],
    ['The', 'NOUN', 'Podcast'],
    ['Viral', 'NOUN'],
    ['Trending in', 'PLACE']
  ],
  Drama: [
    ['The', 'NOUN', 'of', 'NAME'],
    ['The', 'ADJECTIVE', 'Sociopath'],
    ['Gaslighting', 'NAME'],
    ['Trauma in', 'PLACE'],
    ['The', 'Empath', 'and the', 'NOUN'],
    ['Toxic', 'NOUN'],
    ['Tears of', 'PLACE'],
    ['The', 'Nepotism', 'Paradox'],
    ['Red Flags in', 'PLACE'],
    ['A', 'ADJECTIVE', 'NOUN'],
    ['The', 'NOUN'],
    ['NAME', 'and', 'NAME'],
    ['Echoes', 'of', 'NOUN'],
    ['Trauma in', 'PLACE'],
    ['The', 'ADJECTIVE', 'Sociopath'],
    ['Gaslighting', 'NAME'],
    ['Toxic', 'NOUN'],
    ['The', 'Empath', 'and the', 'NOUN']
  ],
  Horror: [
    ['The', 'NOUN', 'in the', 'PLACE'],
    ['Elevated', 'NOUN'],
    ['The', 'ADJECTIVE', 'Vibe'],
    ['Aesthetic of', 'PLACE'],
    ['Meta', 'NOUN'],
    ['The Subversive', 'NOUN'],
    ['Blood on the', 'NOUN'],
    ['The', 'PLACE', 'Jump Scare'],
    ['Nightmare in', 'PLACE'],
    ['ADJECTIVE', 'NOUN'],
    ['It', 'VERBS', 'at', 'TIME'],
    ['The', 'PLACE'],
    ['Curse of the', 'NOUN'],
    ['Elevated', 'NOUN'],
    ['The', 'ADJECTIVE', 'Vibe'],
    ['Aesthetic of', 'PLACE'],
    ['Meta', 'NOUN'],
    ['The', 'Subversive', 'NOUN']
  ],
  'Sci-Fi': [
    ['Project', 'NOUN'],
    ['The', 'Metaverse', 'Chronicles'],
    ['Web3', 'NOUN'],
    ['Algorithm of', 'PLACE'],
    ['The', 'ADJECTIVE', 'Simulation'],
    ['Project', 'NOUN'],
    ['The', 'PLACE', 'Singularity'],
    ['Beyond the', 'Algorithm'],
    ['Crypto', 'NOUN'],
    ['The', 'PLACE', 'Chronicles'],
    ['Beyond the', 'PLACE'],
    ['ADJECTIVE', 'Frontier'],
    ['Star', 'NOUN'],
    ['NOUN', ': Part One'],
    ['The', 'Metaverse', 'Chronicles'],
    ['Web3', 'NOUN'],
    ['Algorithm of', 'PLACE'],
    ['The', 'ADJECTIVE', 'Simulation']
  ],
  Thriller: [
    ['The', 'ADJECTIVE', 'NOUN'],
    ['The', 'Hacker', 'Identity'],
    ['Exposing', 'NAME'],
    ['The Deepfake', 'Conspiracy'],
    ['Viral', 'Trap'],
    ['Cancelled in', 'PLACE'],
    ['The', 'Grifter', 'Paradox'],
    ['Scamming', 'NAME'],
    ['The', 'ADJECTIVE', 'Whistleblower'],
    ['No', 'NOUN', 'Left'],
    ['Kill', 'the', 'NOUN'],
    ['The', 'NAME', 'Identity'],
    ['Deadly', 'NOUN'],
    ['The', 'Hacker', 'Identity'],
    ['Exposing', 'NAME'],
    ['The', 'Deepfake', 'Conspiracy'],
    ['Viral', 'Trap'],
    ['Cancelled in', 'PLACE']
  ],
  Romance: [
    ['Love in', 'PLACE'],
    ['The', 'ADJECTIVE', 'Heart'],
    ['A', 'NOUN', 'to Remember'],
    ['Meet me at', 'TIME'],
    ['NAME', 'and', 'NAME'],
    ['Ghosting', 'NAME'],
    ['Swiping Right in', 'PLACE'],
    ['The', 'Situationship'],
    ['Toxic', 'Love'],
    ['Match with', 'NAME']
  ],
  Animation: [
    ['The', 'ADJECTIVE', 'ANIMAL'],
    ['ANIMAL', 'Tales'],
    ['The Great', 'NOUN', 'Adventure'],
    ['Adventures of', 'NAME'],
    ['Magical', 'PLACE'],
    ['The', 'IP', 'Adventure'],
    ['Synergistic', 'ANIMAL'],
    ['Branded', 'Tales'],
    ['Merch of the', 'NOUN'],
    ['The Marketable', 'ANIMAL']
  ],
  Documentary: [
    ['The Truth About', 'NOUN'],
    ['Inside the', 'PLACE'],
    ['The', 'NOUN', 'Paradox'],
    ['Rise of the', 'NOUN'],
    ['Uncovering', 'NAME'],
    ['The True Crime of', 'PLACE'],
    ['Cult of', 'NAME'],
    ['Scamming', 'NAME'],
    ['The', 'Grifter', 'Paradox'],
    ['Inside the', 'Algorithm']
  ],
  Fantasy: [
    ['The', 'NOUN', 'of', 'PLACE'],
    ['Realm of', 'NOUN'],
    ['The', 'ADJECTIVE', 'King'],
    ['Legends of', 'PLACE'],
    ['The Magic', 'NOUN'],
    ['Lore of', 'PLACE'],
    ['The', 'Canon', 'King'],
    ['Fandom of', 'NOUN'],
    ['The Unofficial', 'Tale'],
    ['Cosplay in', 'PLACE']
  ],
  Crime: [
    ['The', 'PLACE', 'Murders'],
    ['Blood on the', 'NOUN'],
    ['The', 'NAME', 'Syndicate'],
    ['Heist in', 'PLACE'],
    ['To Catch a', 'NOUN'],
    ['The Crypto', 'Murders'],
    ['Cyber', 'Heist'],
    ['Laundering in', 'PLACE'],
    ['The Anonymous', 'Syndicate'],
    ['Ransomware', 'City']
  ],
  Musical: [
    ['Singing in the', 'PLACE'],
    ['The', 'ADJECTIVE', 'Melody'],
    ['Rhythm of', 'PLACE'],
    ['Dance', 'with', 'NAME'],
    ['Song of the', 'NOUN'],
    ['The Jukebox', 'Melody'],
    ['Streaming', 'with', 'NAME'],
    ['Viral', 'Rhythm'],
    ['The Algorithm', 'Dance'],
    ['Platinum', 'Dreams']
  ]
};

const WORDS: Record<string, string[]> = {
  ADJECTIVE: ['Dark', 'Silent', 'Golden', 'Broken', 'Hidden', 'Last', 'Lost', 'Secret', 'Lethal', 'Final', 'Red', 'Black', 'Wild', 'Crazy', 'Funny', 'Beautiful', 'Brave', 'Fierce', 'Uncut', 'Quantum', 'Cyber', 'Neon', 'Hyper', 'Meta', 'Toxic', 'Viral', 'Cancel', 'Elevated', 'Atmospheric', 'Subversive', 'Procedural', 'Algorithmic', 'Tactical', 'Strategic', 'Covert', 'Clandestine', 'Stealth', 'Phantom', 'Ghost', 'Shadow', 'Rogue', 'Maverick', 'Renegade', 'Outlaw', 'Vigilante', 'Mercenary', 'Expendable', 'Disposable', 'Collateral', 'Fatal', 'Mortal', 'Awkward', 'Cringe', 'Based', 'Woke', 'Problematic', 'Cancelled', 'Triggered', 'Savage', 'Petty', 'Salty', 'Thirsty', 'Basic', 'Extra', 'Bougie', 'Ratchet', 'Sus', 'Cap'],
  NOUN: ['Shadow', 'Mirror', 'Ghost', 'Knight', 'City', 'Storm', 'Weapon', 'Target', 'Agent', 'Game', 'House', 'Night', 'Day', 'Star', 'Dream', 'Heart', 'World', 'Man', 'Woman', 'Boy', 'Girl', 'Multiverse', 'Franchise', 'Content', 'Algorithm', 'Meme', 'Podcast', 'Trauma', 'Nepotism', 'Vibe', 'Aesthetic', 'Metaverse', 'Crypto', 'Grifter', 'Situationship', 'IP', 'Recon', 'Extraction', 'Payload', 'Objective', 'Bounty', 'Crossfire', 'Infiltration', 'Exfiltration', 'Takeover', 'Lockdown', 'Overdrive', 'Showdown', 'Blowback', 'Backlash', 'Flashpoint', 'Ground Zero', 'Vanguard', 'Sentinel', 'Outpost', 'Stronghold', 'Influencer', 'Streamer', 'Vlogger', 'Viral', 'Trending', 'Cancel Culture', 'Scam', 'Hustle', 'Flex', 'Clout', 'Drip', 'Mood', 'Energy', 'Synergy'],
  VERB: ['Die', 'Run', 'Shoot', 'Hide', 'Seek', 'Find', 'Kill', 'Save', 'Love', 'Kiss', 'Dance', 'Sing', 'Fly', 'Fall', 'Cancel', 'Reboot', 'Swipe', 'Ghost', 'Stream', 'Hack', 'Leak', 'Trend', 'Post', 'Upload', 'Download', 'Share', 'Like', 'Subscribe', 'Follow', 'Unfollow', 'Block', 'Mute', 'Report', 'Ban'],
  VERBS: ['Waits', 'Hides', 'Kills', 'Watches', 'Screams', 'Comes', 'Walks', 'Cancels', 'Reboots', 'Swipes', 'Ghosts', 'Streams', 'Hacks', 'Leaks', 'Trends', 'Posts', 'Uploads', 'Downloads', 'Shares', 'Likes', 'Subscribes', 'Follows', 'Unfollows', 'Blocks', 'Mutes', 'Reports', 'Bans'],
  PLACE: ['Darkness', 'City', 'Woods', 'Space', 'Future', 'Mars', 'London', 'Paris', 'New York', 'Moon', 'Sun', 'Island', 'Village', 'Metaverse', 'Simulation', 'Web3', 'Timeline', 'Algorithm', 'Feed', 'Grid', 'Matrix', 'Network', 'Cloud', 'Server', 'Database', 'Mainframe', 'Hub', 'Node', 'Nexus', 'Core', 'Vortex', 'Void', 'Abyss'],
  NAME: ['John', 'Mary', 'Bourne', 'Bond', 'Ripley', 'Neo', 'Trinity', 'Luke', 'Leia', 'Harry', 'Hermione', 'Gatsby', 'Holmes', 'Elon', 'Zuck', 'Chad', 'Karen', 'Influencer', 'Streamer', 'Creator', 'Grifter', 'Scammer', 'Hacker', 'Troll', 'Bot', 'NPC', 'Main Character', 'Side Character', 'Villain', 'Hero', 'Anti-Hero', 'Protagonist', 'Antagonist'],
  TIME: ['Midnight', 'Dawn', 'Dusk', 'Night', 'Tomorrow', 'Yesterday', 'Upload', 'Drop', 'Stream', 'Post'],
  ANIMAL: ['Bear', 'Dog', 'Cat', 'Lion', 'Tiger', 'Dragon', 'Unicorn', 'Dinosaur', 'Doge', 'Ape', 'Pepe']
};

export function generateProjectTitle(genre: string): string {
  const patterns = GENRE_PATTERNS[genre] || GENRE_PATTERNS['Drama'];
  const pattern = pick(patterns);

  return pattern.map(part => {
    if (WORDS[part]) {
      return pick(WORDS[part]);
    }
    return part;
  }).join(' ');
}
