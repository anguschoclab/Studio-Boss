import { pick } from '../utils';
import { ProjectFormat } from '../types';

const PREFIXES = [
  // Classic Hollywood & Thematic
  'Universal', 'Paramount', 'Silver', 'Golden', 'Grand', 'Royal', 'Majestic', 'A25', 'Auteur', 'Artisan', 'Boutique', 'Cinephile', 'Gritty', 'Authentic', 'Raw', 'Visceral', 'Indie', 'Micro', 'Prestige', 'Trophy', 'Icon', 'Aura', 'Elevated', 'Derivative', 'Algorithm', 'Nostalgia', 'Tentpole', 'Reboot', 'Cinematic', 'Blockbuster', 'Streaming', 'Viral', 'Meme', 'Synergy', 'Corporate', 'Focus Group',
  // New Thematic Additions
  'Celluloid', 'Kinetoscope', 'Marquee', 'Backlot', 'Soundstage', 'Mogul', 'Box Office', 'Popcorn', 'Multiplex', 'Drive-In', 'Matinee', 'Premiere', 'Red Carpet', 'Paparazzi', 'Starlet', 'Montage', 'Jump Cut', 'Fade In', 'Lens Flare', 'Clapperboard', 'Green Screen', 'CGI', 'Showrunner', 'Method', 'Typecast', 'A-List', 'B-Movie', 'Cult Classic', 'Sleeper Hit', 'Flop', 'Bomb', 'Sequel', 'Prequel', 'Spin-off', 'Remake', 'Franchise', 'Trilogy', 'Cinematic Universe', 'Fandom', 'Four Quadrant', 'Demographic', 'IP', 'Oscar Bait', 'Festival Darling', 'Direct-to-Video', 'Streaming Wars', 'Binge', 'Content', 'Monetized', 'Synergistic', 'Vertical', 'Reshoot', 'Director\'s Cut', 'Golden Age', 'New Wave', 'Avant-Garde', 'Dogme', 'Mumblecore', 'Grindhouse', 'Midnight Movie'
];

const SUFFIXES = [
  // Thematic
  'Pictures', 'Studios', 'Entertainment', 'Films', 'Media', 'Productions', 'Cinema', 'Motion Pictures', 'Network', 'Broadcasting', 'Vision', 'Works', 'Arts', 'Interactive', 'Digital', 'Creative', 'Features', 'Releasing', 'Collective', 'Syndicate', 'Ventures', 'Partners', 'Holdings', 'Group', 'Enterprises', 'Corp', 'Inc', 'Labs', 'Workshop', 'Factory', 'Foundry', 'Forge', 'Vault', 'Archive', 'Content', 'IP', 'Universe', 'Franchise', 'Algorithm', 'Brand', 'Properties', 'Synergy Group',
  // New Thematic Additions
  'Distribution', 'Motion Picture Company', 'International', 'Worldwide', 'Global', 'Plus', 'Max', 'Play', 'Go', 'On Demand', 'Originals', 'Releasing Company'
];

const MOTTOS = [
  'Where stories come alive', 'Entertainment without limits', 'The future of cinema', 'Bold stories, bigger audiences', 'Defining the culture', 'Every frame matters', 'Dream factory', 'Stories that move the world', 'Inspiring the imagination', 'Creating the extraordinary', 'Beyond the screen', 'Magic in every moment', 'Your ticket to adventure', 'Unleashing creativity', 'The art of storytelling', 'Cinematic perfection', 'Bringing visions to life', 'Worlds without end', 'Monetizing your childhood', 'Content is King', 'Four quadrants, one vision', 'Synergy in motion', 'Maximizing shareholder value', 'IP above all', 'We make the memes', 'Data-driven storytelling', 'Algorithms do not lie', 'Quantity has a quality all its own', 'Rebooting the culture', 'Franchises are forever', 'Your nostalgia, our profit', 'Selling the dream', 'Pivoting to video', 'The universe is expanding', 'Building the metaverse', 'Vertical integration realized', 'From script to stream', 'Disrupting the narrative', 'Content for the modern attention span', 'Art as a service', 'Monetizing the zeitgeist', 'We own your childhood', 'A cinematic universe of our own', 'Quantity over quality', 'Fast and cheap', 'Good enough for streaming', 'We fix it in post', 'Trust the algorithm', 'Four quadrants or bust', 'IP is king', 'Franchises forever', 'Rebooting your childhood', 'Monetizing nostalgia', 'Content is content', 'Engagement at all costs', 'Viral marketing is free', 'We only make sequels', 'Original ideas are risky', 'Focus grouped to perfection', 'Bland but profitable', 'Safely generic', 'Write it off for taxes', 'Don\'t read the reviews', 'Our trailers are better than the movie', 'Cancel culture is our best marketing', 'Replacing actors with AI since 2024', 'Please subscribe to our streaming tier', 'We own the rights to your dreams', 'Greenlighting based on TikTok trends', 'If it bleeds, we stream it', 'Milking the IP dry', 'Another reboot no one asked for', 'Lowering the bar daily'
];

export const MALE_FIRST_NAMES = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph',
  'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark',
  'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian',
  'George', 'Edward', 'Ronald', 'Timothy', 'Jason', 'Jeffrey', 'Ryan', 'Jacob',
  'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott',
  'Brandon', 'Benjamin', 'Samuel', 'Gregory', 'Frank', 'Alexander', 'Raymond',
  'Patrick', 'Jack', 'Dennis', 'Jerry', 'Tyler', 'Aaron', 'Jose', 'Adam', 'Henry',
  'Nathan', 'Douglas', 'Zachary', 'Peter', 'Kyle', 'Walter', 'Ethan', 'Jeremy',
  'Harold', 'Keith', 'Christian', 'Roger', 'Noah', 'Gerald', 'Carl', 'Terry',
  'Sean', 'Austin', 'Arthur', 'Lawrence', 'Jesse', 'Dylan', 'Bryan', 'Joe',
  'Jordan', 'Billy', 'Bruce', 'Albert', 'Willie', 'Gabriel', 'Logan', 'Alan',
  'Juan', 'Wayne', 'Ralph', 'Roy', 'Eugene', 'Randy', 'Vincent', 'Russell',
  'Louis', 'Philip', 'Bobby', 'Johnny', 'Bradley'
];

export const FEMALE_FIRST_NAMES = [
  'Mary', 'Patricia', 'Linda', 'Barbara', 'Elizabeth', 'Jennifer', 'Maria', 'Susan',
  'Margaret', 'Dorothy', 'Lisa', 'Nancy', 'Karen', 'Betty', 'Helen', 'Sandra',
  'Donna', 'Carol', 'Ruth', 'Sharon', 'Michelle', 'Laura', 'Sarah', 'Kimberly',
  'Deborah', 'Jessica', 'Shirley', 'Cynthia', 'Angela', 'Melissa', 'Brenda', 'Amy',
  'Anna', 'Rebecca', 'Virginia', 'Kathleen', 'Pamela', 'Martha', 'Debra', 'Amanda',
  'Stephanie', 'Carolyn', 'Christine', 'Marie', 'Janet', 'Catherine', 'Frances',
  'Ann', 'Joyce', 'Diane', 'Alice', 'Julie', 'Heather', 'Teresa', 'Doris', 'Gloria',
  'Evelyn', 'Jean', 'Cheryl', 'Mildred', 'Katherine', 'Joan', 'Ashley', 'Judith',
  'Rose', 'Janice', 'Kelly', 'Nicole', 'Judy', 'Christina', 'Kathy', 'Theresa',
  'Beverly', 'Denise', 'Tammy', 'Irene', 'Jane', 'Lori', 'Rachel', 'Marilyn',
  'Andrea', 'Kathryn', 'Louise', 'Sara', 'Anne', 'Jacqueline', 'Wanda', 'Bonnie',
  'Julia', 'Ruby', 'Lois', 'Tina', 'Phyllis', 'Norma', 'Paula', 'Diana', 'Annie',
  'Lillian', 'Emily', 'Robin'
];

export const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
  'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
  'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey',
  'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson', 'Watson',
  'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz',
  'Hughes', 'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long',
  'Ross', 'Foster', 'Jimenez'
];

// Dictionaries by Genre
const DICTIONARIES: Record<string, { nouns: string[], adjs: string[] }> = {
  'Action': {
    nouns: ['Vengeance', 'Protocol', 'Strike', 'Force', 'Bullet', 'Assassin', 'Mercenary', 'Mission', 'Target', 'Rogue', 'Agent', 'Sniper', 'Vendetta', 'Cartel', 'Reckoning', 'Escape', 'Heist', 'Pursuit', 'Squad', 'Fist', 'Reboot', 'Franchise', 'Multiverse', 'Cinematic Universe', 'Sequel', 'Prequel', 'Spinoff', 'Remake', 'Crossover', 'Trilogy', 'Recon', 'Extraction', 'Payload', 'Objective', 'Bounty', 'Crossfire', 'Infiltration', 'Exfiltration', 'Takeover', 'Lockdown', 'Overdrive', 'Showdown', 'Blowback', 'Backlash', 'Flashpoint', 'Ground Zero', 'Vanguard', 'Sentinel', 'Outpost', 'Stronghold', 'Blockbuster', 'CGI', 'Explosion', 'Set Piece', 'Green Screen', 'Stunt Double', 'Body Double'],
    adjs: ['Lethal', 'Deadly', 'Blind', 'Rogue', 'Final', 'Relentless', 'Silent', 'Hostile', 'Covert', 'Extreme', 'Tactical', 'Ruthless', 'Explosive', 'Unstoppable', 'Furious', 'Savage', 'Brutal', 'Uncut', 'Quantum', 'Cyber', 'Neon', 'Hyper', 'Meta', 'Post-Apocalyptic', 'Dystopian', 'Strategic', 'Clandestine', 'Stealth', 'Phantom', 'Ghost', 'Shadow', 'Maverick', 'Renegade', 'Outlaw', 'Vigilante', 'Mercenary', 'Expendable', 'Disposable', 'Collateral', 'Fatal', 'Mortal', 'Overbudget', 'Action-Packed', 'High-Octane', 'Adrenaline-Fueled', 'CGI-Heavy', 'Test-Screened']
  },
  'Comedy': {
    nouns: ['Weekend', 'Trip', 'Boss', 'Neighbors', 'Party', 'Wedding', 'Hangover', 'Mistake', 'Disaster', 'Fool', 'Family', 'Date', 'Road', 'Vacation', 'Mix-up', 'Camp', 'School', 'College', 'Misfits', 'Idiots', 'Content', 'Influencer', 'Streamer', 'Vlogger', 'Podcast', 'Cancel Culture', 'Algorithm', 'Meme', 'Viral', 'Trending', 'Grifter', 'Scam', 'Hustle', 'Flex', 'Clout', 'Drip', 'Vibe', 'Aesthetic', 'Mood', 'Energy', 'Synergy', 'PR Crisis', 'Apology Video', 'Notes App', 'Subtweet', 'Ratio', 'Hot Mic', 'Deepfake'],
    adjs: ['Crazy', 'Bad', 'Awkward', 'Wild', 'Stupid', 'Dumb', 'Messy', 'Clumsy', 'Hilarious', 'Unlucky', 'Fake', 'Worst', 'Accidental', 'Unexpected', 'Secret', 'Embarrassing', 'Cringe', 'Based', 'Woke', 'Toxic', 'Problematic', 'Cancelled', 'Triggered', 'Savage', 'Petty', 'Salty', 'Thirsty', 'Basic', 'Extra', 'Bougie', 'Ratchet', 'Sus', 'Cap', 'No Cap', 'Bet', 'Demagnetized', 'Tone-Deaf', 'Out-of-Touch', 'Unrelatable']
  },
  'Drama': {
    nouns: ['Tears', 'Silence', 'Promise', 'Secret', 'Shadow', 'Past', 'Letter', 'Journey', 'Heart', 'Sorrow', 'Truth', 'Lie', 'Winter', 'Summer', 'River', 'Road', 'House', 'Family', 'Son', 'Daughter', 'Wife', 'Husband', 'Memory', 'Sins', 'Trauma', 'Nepotism', 'Gaslighting', 'Narcissist', 'Sociopath', 'Empath', 'Therapy', 'Boundary', 'Trigger', 'Red Flag', 'Green Flag', 'Ick', 'Situationship', 'Attachment Style', 'Love Language', 'Toxic Trait', 'Coping Mechanism', 'Defense Mechanism', 'Projection', 'Deflection', 'Awards Bait', 'Oscar Campaign', 'Method Acting', 'Prestige TV', 'Limited Series', 'Showrunner', 'Monologue'],
    adjs: ['Broken', 'Hidden', 'Fading', 'Lost', 'Quiet', 'Dark', 'Cold', 'Bitter', 'Tender', 'Forgiven', 'Forgotten', 'Silent', 'Distant', 'Empty', 'Shattered', 'Blind', 'Toxic', 'Abusive', 'Narcissistic', 'Codependent', 'Triggering', 'Validating', 'Empowering', 'Healing', 'Growing', 'Evolving', 'Manifesting', 'Aligning', 'Vibrating', 'Resonating', 'Connecting', 'Disconnecting', 'Dissociating', 'Spiraling', 'Crashing', 'Burning', 'Oscar-Bait', 'Critically-Acclaimed', 'Pretentious', 'Self-Indulgent', 'Overlong', 'Auteur-Driven', 'Gritty']
  },
  'Horror': {
    nouns: ['Demon', 'Ghost', 'House', 'Woods', 'Cabin', 'Night', 'Curse', 'Entity', 'Devil', 'Spirits', 'Shadows', 'Darkness', 'Blood', 'Scream', 'Fear', 'Nightmare', 'Mirror', 'Doll', 'Asylum', 'Graveyard', 'Elevated', 'IP', 'Aesthetic', 'Vibe', 'Mood', 'Atmosphere', 'Trope', 'Cliché', 'Jump Scare', 'Gore', 'Final Girl', 'Body Horror', 'Found Footage', 'Slasher', 'Poltergeist', 'Exorcism', 'Cult', 'Sacrifice', 'Ritual', 'Analog Horror', 'Liminal Space', 'Creepypasta', 'Backrooms', 'ARG'],
    adjs: ['Haunted', 'Cursed', 'Possessed', 'Demonic', 'Evil', 'Creepy', 'Sinister', 'Dead', 'Undead', 'Macabre', 'Bloody', 'Terrifying', 'Wicked', 'Twisted', 'Unholy', 'Elevated', 'Atmospheric', 'Slow-Burn', 'Psychological', 'Subversive', 'Meta', 'Self-Aware', 'Satirical', 'Ironic', 'Campy', 'Schlocky', 'Gory', 'Gruesome', 'Disturbing', 'Unsettling', 'Spooky', 'Scary', 'Uncanny', 'Liminal', 'Viral', 'Trend-Chasing']
  },
  'Sci-Fi': {
    nouns: ['Planet', 'Star', 'Galaxy', 'Alien', 'Space', 'Future', 'Ship', 'Void', 'Dimension', 'Colony', 'Matrix', 'Cyborg', 'Robot', 'Nexus', 'Anomaly', 'Singularity', 'Orbit', 'System', 'Engine', 'Clone', 'Metaverse', 'Web3', 'Crypto', 'NFT', 'AI', 'Blockchain', 'Virtual Reality', 'Augmented Reality', 'Simulation', 'Algorithm', 'Post-Human', 'Android', 'Mutant', 'Extraterrestrial', 'UFO', 'UAP', 'Generative AI', 'LLM', 'Neural Net', 'Deepfake', 'Data Mining', 'Server Farm'],
    adjs: ['Galactic', 'Cosmic', 'Quantum', 'Cyber', 'Neon', 'Infinite', 'Parallel', 'Unknown', 'Alien', 'Virtual', 'Solar', 'Lunar', 'Stellar', 'Digital', 'Synthetic', 'Procedural', 'Algorithmic', 'Generative', 'Simulated', 'Crypto', 'Retro-Futuristic', 'Post-Apocalyptic', 'Dystopian', 'Utopian', 'Interstellar', 'Multiversal', 'Transdimensional', 'Chronological', 'AI-Generated', 'Tokenized', 'Decentralized']
  },
  'Thriller': {
    nouns: ['Suspect', 'Clue', 'Murder', 'Witness', 'Motive', 'Secret', 'Deception', 'Web', 'Trap', 'Game', 'Conspiracy', 'Plot', 'Alibi', 'Lies', 'Truth', 'Stalker', 'Stranger', 'Window', 'Room', 'Identity', 'Grifter', 'Scammer', 'Catfish', 'Hacker', 'Troll', 'Bot', 'Deepfake', 'Cover-up', 'Whistleblower', 'Insider', 'Informant', 'Mole', 'Double Agent', 'Sleeper Cell', 'Syndicate', 'Cartel', 'Mafia', 'Mob', 'Triad', 'Psy-Op', 'Zero-Day', 'Ransomware', 'Leak', 'Doxxing', 'Burner', 'Drop'],
    adjs: ['Fatal', 'Guilty', 'Innocent', 'Twisted', 'Deceptive', 'Hidden', 'Missing', 'Buried', 'Dark', 'Blind', 'Dangerous', 'Obsessive', 'Paranoid', 'Suspicious', 'Cold', 'Viral', 'Trending', 'Cancel', 'Exposed', 'Leaked', 'Hacked', 'Compromised', 'Infiltrated', 'Breached', 'Decrypted', 'Encrypted', 'Classified', 'Top Secret', 'Redacted', 'Censored', 'Banned', 'Illegal', 'Illicit', 'Contraband', 'Gaslit', 'Psychological']
  },
  'Romance': {
    nouns: ['Love', 'Heart', 'Kiss', 'Embrace', 'Sunset', 'Rain', 'Stars', 'Letters', 'Vows', 'Desire', 'Passion', 'Romance', 'Soulmate', 'Destiny', 'Spark', 'Flame', 'Valentine', 'Rose', 'Autumn', 'Spring', 'Ghosting', 'Breadcrumbing', 'Love Bombing', 'Orbiting', 'Situationship', 'Tinder', 'Bumble', 'Hinge', 'Swiping', 'Match', 'Super Like', 'DM', 'Slide', 'Simp', 'Cuffing Season', 'Hot Girl Summer', 'Soft Launch', 'Hard Launch', 'Red Flag', 'Green Flag', 'Meet-Cute', 'Enemies-to-Lovers', 'Fake Dating', 'Slow Burn', 'Love Triangle'],
    adjs: ['Sweet', 'Endless', 'True', 'First', 'Last', 'Secret', 'Forbidden', 'Passionate', 'Crazy', 'Perfect', 'Beautiful', 'Tender', 'Romantic', 'Wild', 'Unexpected', 'Toxic', 'Codependent', 'Avoidant', 'Anxious', 'Secure', 'Attached', 'Detached', 'Clingy', 'Needy', 'Distant', 'Aloof', 'Guarded', 'Vulnerable', 'Open', 'Closed', 'Available', 'Unavailable', 'Committed', 'Phobic', 'Poly', 'Swoon-Worthy', 'Hallmark-Esque', 'Spicy']
  },
  'Animation': {
    nouns: ['Pets', 'Toys', 'Bugs', 'Monsters', 'Magic', 'Adventure', 'Quest', 'Kingdom', 'Friends', 'Tale', 'Legend', 'Beasts', 'Dragons', 'Heroes', 'Critters', 'Machines', 'Dreams', 'Wonders', 'Island', 'Journey', 'IP', 'Merch', 'Theme Park', 'Ride', 'Attraction', 'Mascot', 'Brand', 'Sponsorship', 'Synergy', 'Crossover', 'Spinoff', 'Reboot', 'Remake', 'Sequel', 'Prequel', 'Origin Story', 'Cinematic Universe', 'Multiverse', 'Franchise', 'Action Figure', 'Plushie', 'Happy Meal Toy'],
    adjs: ['Magical', 'Incredible', 'Amazing', 'Secret', 'Lost', 'Brave', 'Little', 'Giant', 'Tiny', 'Super', 'Happy', 'Flying', 'Talking', 'Wonderful', 'Fantastic', 'Four-Quadrant', 'Family-Friendly', 'Wholesome', 'Marketable', 'Synergistic', 'Branded', 'Corporate', 'Sanitized', 'Safe', 'Predictable', 'Formulaic', 'Generic', 'Bland', 'Inoffensive', 'Colorful', 'Loud', 'Fast-Paced', 'Attention-Grabbing', 'Viral', 'Memeable', 'Cash-Grab', 'Soulless']
  },
  'Documentary': {
    nouns: ['Truth', 'Story', 'Life', 'World', 'Planet', 'History', 'Nature', 'Crime', 'Mystery', 'Secret', 'Rise', 'Fall', 'Behind', 'Inside', 'Mind', 'Earth', 'Ocean', 'Wild', 'People', 'Voices', 'True Crime', 'Cult', 'Scam', 'Fraud', 'Heist', 'Murder', 'Serial Killer', 'Cult Leader', 'Guru', 'Grifter', 'Con Artist', 'Imposter', 'Fake', 'Phony', 'Charlatan', 'Quack', 'Snake Oil', 'Pyramid Scheme', 'Ponzi', 'MLM', 'Fyre Festival', 'Crypto Crash', 'Theranos'],
    adjs: ['Untold', 'Hidden', 'Real', 'True', 'Secret', 'Dark', 'Ancient', 'Modern', 'Wild', 'Lost', 'Forgotten', 'Invisible', 'Unseen', 'Inside', 'Making', 'Shocking', 'Unbelievable', 'Twisted', 'Bizarre', 'Disturbing', 'Chilling', 'Gripping', 'Compelling', 'Fascinating', 'Mind-Blowing', 'Explosive', 'Groundbreaking', 'Unprecedented', 'Never-Before-Seen', 'Exclusive', 'Behind-the-Scenes', 'All-Access', 'Unfiltered', 'Raw', 'Uncut', 'Exploitative', 'Sensationalized', 'Biased']
  },
  'Fantasy': {
    nouns: ['Dragon', 'Sword', 'King', 'Queen', 'Kingdom', 'Magic', 'Spell', 'Curse', 'Prophecy', 'Realm', 'Crown', 'Throne', 'Elf', 'Wizard', 'Shadow', 'Light', 'Ring', 'Stone', 'Chronicles', 'Tale', 'Lore', 'Worldbuilding', 'Canon', 'Fandom', 'Stan', 'Ship', 'Fanfic', 'Headcanon', 'Cosplay', 'Convention', 'Panel', 'Q&A', 'Autograph', 'Meet & Greet', 'Photo Op', 'Exclusive', 'Limited Edition', 'Collector\'s Item', 'Variant', 'Chase', 'Grail', 'Grimdark', 'High Fantasy', 'Low Fantasy'],
    adjs: ['Ancient', 'Magical', 'Cursed', 'Hidden', 'Lost', 'Dark', 'Epic', 'Mystic', 'Crystal', 'Golden', 'Silver', 'Shadow', 'Blood', 'Iron', 'Fire', 'Canon', 'Non-Canon', 'Official', 'Unofficial', 'Fan-Made', 'Community', 'Toxic', 'Gatekeeping', 'Elitist', 'Casual', 'Hardcore', 'Dedicated', 'Obsessive', 'Passionate', 'Devoted', 'Loyal', 'Die-Hard', 'Ride-or-Die', 'Stan', 'Main', 'Problematic', 'Mary-Sue']
  },
  'Crime': {
    nouns: ['Mob', 'Mafia', 'Gang', 'Heist', 'Bank', 'City', 'Streets', 'Detective', 'Cop', 'Robbery', 'Cartel', 'Underworld', 'Syndicate', 'Job', 'Score', 'Deal', 'Hustle', 'Cash', 'Gun', 'Law', 'Crypto', 'Laundering', 'Hacking', 'Ransomware', 'Phishing', 'Scam', 'Fraud', 'Embezzlement', 'Extortion', 'Blackmail', 'Bribery', 'Corruption', 'Nepotism', 'Cronyism', 'Collusion', 'Racketeering', 'Tax Evasion', 'Insider Trading', 'Ponzi Scheme', 'Rug Pull', 'Wire Fraud'],
    adjs: ['Corrupt', 'Dirty', 'Crooked', 'Bad', 'Ruthless', 'Violent', 'Bloody', 'Underground', 'Guilty', 'Cold', 'Hard', 'Blind', 'Fatal', 'Deadly', 'Broken', 'Cyber', 'Crypto', 'Digital', 'Virtual', 'Untraceable', 'Anonymous', 'Encrypted', 'Decentralized', 'Offshore', 'Shell', 'Front', 'Bogus', 'Fake', 'Counterfeit', 'Forged', 'Stolen', 'Laundered', 'Clean', 'Legit', 'White-Collar']
  },
  'Musical': {
    nouns: ['Song', 'Dance', 'Rhythm', 'Beat', 'Melody', 'Stage', 'Lights', 'Chorus', 'Voice', 'Music', 'Harmony', 'Band', 'Singer', 'Star', 'Dream', 'Show', 'Broadway', 'Street', 'Sound', 'Heart', 'Jukebox', 'Biopic', 'Soundtrack', 'Album', 'Single', 'Chart', 'Streaming', 'Playlist', 'Algorithm', 'Viral', 'TikTok', 'Dance Challenge', 'Lip Sync', 'Cover', 'Remix', 'Mashup', 'Sample', 'Interpolation', 'Feature', 'Collab', 'Drop', 'Industry Plant', 'Nepo Baby', 'Autotune'],
    adjs: ['Singing', 'Dancing', 'Loud', 'Sweet', 'Golden', 'Star', 'Neon', 'Bright', 'Magic', 'Rhythmic', 'Harmonic', 'Electric', 'Acoustic', 'Vocal', 'Grand', 'Viral', 'Trending', 'Chart-Topping', 'Platinum', 'Gold', 'Diamond', 'Multi-Platinum', 'Record-Breaking', 'Award-Winning', 'Grammy-Nominated', 'Critically-Acclaimed', 'Commercial', 'Mainstream', 'Underground', 'Indie', 'Alternative', 'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Manufactured', 'Overproduced']
  }
};

const PREFIX_PATTERNS = [
  'The', 'A', 'Return of the', 'Rise of the', 'Fall of the', 'Revenge of the', 'Curse of the', 'Secret of the', 'Legend of the', 'Tale of the'
];

const CONNECTORS = [
  'and the', 'in the', 'of the', 'from the', 'without', 'vs', 'meets'
];

const LOCATIONS = [
  'New York', 'Los Angeles', 'London', 'Paris', 'Tokyo', 'Vegas', 'Miami', 'Chicago', 'Texas', 'Hollywood', 'Space', 'Mars', 'Earth', 'Hell', 'Heaven', 'Island', 'Mountain', 'River', 'City', 'Town'
];

export function generateStudioName(existing: string[]): string {
  const existingSet = new Set(existing);
  let name: string;
  let attempts = 0;
  do {
    name = `${pick(PREFIXES)} ${pick(SUFFIXES)}`;
    attempts++;
  } while (existingSet.has(name) && attempts < 50);
  return name;
}

export function generateMotto(): string {
  return pick(MOTTOS);
}

export function generateActorName(): string {
  return `${pick(MALE_FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

export function generateActressName(): string {
  return `${pick(FEMALE_FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

export function generateProjectName(format: ProjectFormat, genre: string): string {
  const dict = DICTIONARIES[genre] || DICTIONARIES['Drama']; // Fallback to Drama

  if (format === 'tv') {
    const tvPatterns = [
      () => `${pick(dict.adjs)} ${pick(dict.nouns)}s`,
      () => `The ${pick(dict.nouns)}`,
      () => `${pick(dict.nouns)} ${pick(LOCATIONS)}`,
      () => `${pick(dict.nouns)} and ${pick(dict.nouns)}`,
      () => `${pick(LOCATIONS)} ${pick(dict.nouns)}s`,
      () => `Project: ${pick(dict.nouns)}`,
      () => `${pick(dict.adjs)}`,
    ];
    return pick(tvPatterns)();
  } else {
    // Film
    const filmPatterns = [
      () => `The ${pick(dict.adjs)} ${pick(dict.nouns)}`,
      () => `${pick(PREFIX_PATTERNS)} ${pick(dict.nouns)}`,
      () => `${pick(dict.nouns)} of ${pick(LOCATIONS)}`,
      () => `${pick(dict.adjs)} ${pick(dict.nouns)}`,
      () => `${pick(dict.nouns)} ${pick(CONNECTORS)} ${pick(dict.nouns)}`,
      () => `${pick(dict.nouns)}`,
      () => `The ${pick(dict.nouns)} ${pick(dict.nouns)}`,
    ];
    return pick(filmPatterns)();
  }
}
