import re

def append_to_array(filename, declaration_regex, new_items):
    with open(filename, 'r') as f:
        content = f.read()

    match = re.search(declaration_regex, content)
    if not match:
        print(f"Could not find array matching {declaration_regex} in {filename}")
        return

    start_idx = match.end()
    bracket_level = 1
    idx = start_idx
    while idx < len(content):
        if content[idx] == '[':
            bracket_level += 1
        elif content[idx] == ']':
            bracket_level -= 1
            if bracket_level == 0:
                break
        idx += 1

    if bracket_level != 0:
        print(f"Could not find closing bracket for {declaration_regex} in {filename}")
        return

    last_char_idx = idx - 1
    while last_char_idx >= 0 and content[last_char_idx].isspace():
        last_char_idx -= 1

    needs_comma = content[last_char_idx] != ',' and content[last_char_idx] != '['

    items_str = ""
    if needs_comma:
        items_str += ",\n"
    else:
        items_str += "\n"

    items_str += "  // Scribe Expanded Content\n"
    items_str += "  " + ",\n  ".join([f"'{item}'" for item in new_items]) + "\n"

    new_content = content[:idx] + items_str + content[idx:]

    with open(filename, 'w') as f:
        f.write(new_content)
    print(f"Updated {filename} successfully.")

def append_to_words_array(filename, category, new_items):
    with open(filename, 'r') as f:
        content = f.read()

    regex = rf"{category}:\s*\["
    match = re.search(regex, content)
    if not match:
        print(f"Could not find array matching {regex} in {filename}")
        return

    start_idx = match.end()
    bracket_level = 1
    idx = start_idx
    while idx < len(content):
        if content[idx] == '[':
            bracket_level += 1
        elif content[idx] == ']':
            bracket_level -= 1
            if bracket_level == 0:
                break
        idx += 1

    last_char_idx = idx - 1
    while last_char_idx >= 0 and content[last_char_idx].isspace():
        last_char_idx -= 1

    needs_comma = content[last_char_idx] != ',' and content[last_char_idx] != '['

    items_str = ""
    if needs_comma:
        items_str += ",\n"
    else:
        items_str += "\n"

    items_str += "    // Scribe Expanded Content\n"
    items_str += "    " + ", ".join([f"'{item}'" for item in new_items]) + "\n  "

    new_content = content[:idx] + items_str + content[idx:]

    with open(filename, 'w') as f:
        f.write(new_content)
    print(f"Updated {category} in {filename} successfully.")

def append_to_genre_array(filename, genre, category, new_items):
    with open(filename, 'r') as f:
        content = f.read()

    genre_regex = rf"'{genre}':\s*\{{"
    match = re.search(genre_regex, content)
    if not match:
        print(f"Could not find genre matching {genre_regex} in {filename}")
        return

    start_idx = match.end()

    cat_regex = rf"{category}:\s*\["
    cat_match = re.search(cat_regex, content[start_idx:])

    if not cat_match:
        print(f"Could not find category {category} in {genre}")
        return

    actual_start_idx = start_idx + cat_match.end()

    bracket_level = 1
    idx = actual_start_idx
    while idx < len(content):
        if content[idx] == '[':
            bracket_level += 1
        elif content[idx] == ']':
            bracket_level -= 1
            if bracket_level == 0:
                break
        idx += 1

    last_char_idx = idx - 1
    while last_char_idx >= 0 and content[last_char_idx].isspace():
        last_char_idx -= 1

    needs_comma = content[last_char_idx] != ',' and content[last_char_idx] != '['

    items_str = ""
    if needs_comma:
        items_str += ",\n"
    else:
        items_str += "\n"

    items_str += "      // Scribe Expanded Content\n"
    items_str += "      " + ", ".join([f"'{item}'" for item in new_items]) + "\n    "

    new_content = content[:idx] + items_str + content[idx:]

    with open(filename, 'w') as f:
        f.write(new_content)
    print(f"Updated {genre} {category} in {filename} successfully.")


# MOTTOS
mottos = [
    "Where the algorithm writes the script.",
    "Test audiences loved it, critics will hate it.",
    "We fix the plot in the trailer.",
    "Four quadrants, zero risks.",
    "Franchising your childhood memories since 1998.",
    "A wholly-owned subsidiary of a tech conglomerate.",
    "We make content, not cinema.",
    "Cinematic universes built on shifting sand.",
    "Because focus groups said so.",
    "Recycling IP for a modern audience.",
    "Greenlit by a spreadsheet.",
    "We bought the rights to your tweet.",
    "More lens flares, less character development.",
    "Catering to the lowest common denominator.",
    "It\\'s not a movie, it\\'s a four-week brand activation.",
    "We only do legacy sequels.",
    "Putting the \\'art\\' in \\'artificial intelligence\\'.",
    "Where indie directors go to sell out.",
    "We turn podcasts into cinematic universes.",
    "The studio that killed the mid-budget drama."
]

append_to_array('src/engine/generators/names.ts', r'const MOTTOS = \[', mottos)

# HEADLINES
talent_headlines = [
    "${directorName} claims ${projectName} isn\\'t a movie, it\\'s a \\'six-part feature-length experience\\'.",
    "Lead actor in ${projectName} demands CGI abs added in post-production.",
    "Director ${directorName} reportedly communicating with cast entirely via cryptic voice notes.",
    "A-lister drops out of ${projectName} after reading the rewrite by a focus group.",
    "Studio executives panic as ${directorName} insists the three-hour runtime is \\'non-negotiable\\'.",
    "Star of ${projectName} launches competing lifestyle brand on the same day as the premiere.",
    "On-set \\'vibe coordinator\\' for ${projectName} quits, citing unmanageable egos.",
    "${directorName} spends entirely too much of the ${projectName} budget on vintage lenses.",
    "Lead actress in ${projectName} refuses to do press, sending her publicist in a mask instead.",
    "Studio brings in three ghostwriters to \\'punch up\\' the third act of ${projectName}.",
    "${directorName} defends the controversial ending of ${projectName} as \\'challenging the viewer\\'.",
    "Star of ${projectName} caught streaming video games during the film\\'s red carpet premiere.",
    "Craft services mutiny on the set of ${projectName} over lack of artisanal matcha.",
    "${directorName} attempts to trademark the specific shade of teal used in ${projectName}.",
    "Leaked audio reveals ${directorName} screaming at a producer over the font size in the opening credits.",
    "Star of ${projectName} insists on bringing their spiritual advisor to every script read.",
    "Studio head forced to apologize after calling ${projectName} a \\'glorified toy commercial\\'.",
    "${directorName} demands the removal of all dialogue from the final 20 minutes of ${projectName}.",
    "Fans petition to recast the lead in ${projectName} with a moderately popular Twitch streamer.",
    "The press tour for ${projectName} derails entirely after the stars admit they didn\\'t understand the plot."
]

rival_templates = [
    "{rival} greenlights a grimdark reboot of a beloved childhood franchise, scarring millennials.",
    "{rival} CEO defends the use of generative AI scripts for their upcoming {genre} slate.",
    "{rival} acquires the film rights to a Wikipedia article for ${budget}M.",
    "{rival} attempts to launch a cinematic universe based entirely on public domain mascots.",
    "{rival} forces unnecessary sequel hooks into their acclaimed ${budget}M {genre} indie darling.",
    "{rival} spends ${budget}M marketing a {genre} film that was quietly cancelled last month.",
    "{rival} pivots entirely to short-form content, cutting the runtime of all {genre} films to 45 minutes.",
    "{rival} launches a ${budget}M {genre} project starring exclusively TikTok influencers; it flops immediately.",
    "{rival} announces a 15-year roadmap for a {genre} franchise before the first film is even cast.",
    "{rival} desperately tries to artificially manufacture a TikTok dance trend for their ${budget}M {genre} release.",
    "{rival} blames the poor box office of their ${budget}M {genre} tentpole on \\'audience fatigue\\'.",
    "{rival} caught artificially inflating the Rotten Tomatoes score for their new {genre} blockbuster.",
    "{rival} writes off a nearly-completed ${budget}M {genre} film, claiming it \\'no longer aligns with the brand\\'.",
    "{rival} re-releases an underperforming ${budget}M {genre} film, claiming it\\'s the \\'true visionary cut\\'.",
    "{rival} stock plummets after their highly anticipated ${budget}M {genre} cinematic universe implodes on arrival.",
    "{rival} buys a struggling indie distributor just to strip-mine their {genre} IP.",
    "{rival} insists their new ${budget}M {genre} franchise is \\'too smart\\' for mainstream audiences.",
    "{rival} aggressively monetizes their back catalog, releasing \\'demastered\\' versions of classic {genre} films.",
    "{rival} CEO caught calling their core demographic \\'walking wallets\\' on a hot mic.",
    "{rival} relies entirely on algorithmic generation for their upcoming ${budget}M {genre} slate."
]

append_to_array('src/engine/generators/headlines.ts', r'const TALENT_HEADLINES = \[', talent_headlines)
append_to_array('src/engine/generators/headlines.ts', r'const RIVAL_TEMPLATES = \[', rival_templates)

# TITLES - WORDS
adjectives = [
    "Derivative", "Pretentious", "Subversive", "Focus-Grouped", "Algorithmic",
    "Gritty", "Post-Modern", "Elevated", "Tax-Deductible", "Manufactured",
    "Self-Indulgent", "Over-Budget", "Tone-Deaf", "Nostalgia-Bait", "Cash-Grab",
    "Venture-Backed", "Four-Quadrant", "Demographic-Driven", "Synergistic", "Uncanny"
]

nouns = [
    "Content", "Franchise", "Cinematic Universe", "Algorithm", "Focus Group",
    "Tax Write-Off", "Nepo Baby", "IP", "Reboot", "Sequel", "Prequel",
    "Spin-Off", "Synergy", "Demographic", "Engagement", "Metrics",
    "Pitch Deck", "Boardroom", "Shareholder", "Vibe Shift"
]

verbs = [
    "Monetize", "Synergize", "Reboot", "Cancel", "Pivot", "Focus-Group",
    "Shelve", "Astroturf", "Ratio", "Doxx", "Launder", "Outsource",
    "Stream", "Binge", "Optimize", "Franchise", "Leverage", "Scale"
]

append_to_words_array('src/engine/generators/titles.ts', 'ADJECTIVE', adjectives)
append_to_words_array('src/engine/generators/titles.ts', 'NOUN', nouns)
append_to_words_array('src/engine/generators/titles.ts', 'VERB', verbs)

# TITLES - DICTIONARIES
drama_nouns = ["Nepo Baby", "Method Actor", "Oscars Bait", "Trauma Dump", "Tax Write-Off", "Subtweet", "PR Crisis", "Apology Video", "Nepotism", "Cancel Culture", "Influencer", "Streamer", "Content House", "Vibe Shift", "Monologue", "Tearjerker", "Auteur", "Vanity Project", "Think Piece", "Cancellation"]
drama_adjs = ["Pretentious", "Self-Indulgent", "Over-Emote", "Subversive", "Elevated", "Gritty", "Triggering", "Problematic", "Cringe", "Based", "Tone-Deaf", "Oscar-Baiting", "Melodramatic", "Navel-Gazing", "Overrated", "Underappreciated", "Divisive", "Polarizing", "Cinematic", "Aesthetic"]

sci_fi_nouns = ["LLM", "Generative AI", "Tech Bro", "Venture Capital", "Tokenomics", "Smart Contract", "Server Farm", "Deepfake", "Algorithm", "Simulation", "Metaverse", "Crypto", "Data Mining", "Neural Net", "Singularity", "Web3", "Blockchain", "NFT", "DAO", "Cybersecurity"]
sci_fi_adjs = ["Procedural", "Algorithmic", "Generative", "Simulated", "Crypto", "Tokenized", "Decentralized", "Plagiarized", "Machine-Learned", "Automated", "Post-Apocalyptic", "Retro-Futuristic", "Cyber", "Neon", "Virtual", "Digital", "Synthetic", "Infinite", "Multiversal", "Transdimensional"]

horror_nouns = ["Elevated Horror", "Jump Scare", "Analog Horror", "Found Footage", "Creepypasta", "Liminal Space", "Sleep Paralysis", "Escape Room", "True Crime Podcast", "Cult", "Exorcism", "Possession", "Slasher", "Final Girl", "Ouija Board", "Demon", "Poltergeist", "Haunted House", "Cursed Tape", "Urban Legend"]
horror_adjs = ["Uncanny", "Liminal", "Psychological", "Gory", "Disturbing", "Atmospheric", "Terrifying", "Chilling", "Macabre", "Grotesque", "Surreal", "Nightmarish", "Eerie", "Sinister", "Demonic", "Possessed", "Cursed", "Haunted", "Subliminal", "Visceral"]

action_nouns = ["Set Piece", "CGI Explosion", "Stunt Double", "Green Screen", "Wire Work", "Practical Effect", "Franchise Starter", "Cinematic Universe", "Reboot", "Sequel", "Spin-Off", "Tentpole", "Blockbuster", "Origin Story", "Anti-Hero", "Vigilante", "Mercenary", "Assassin", "Cartel", "Syndicate"]
action_adjs = ["Explosive", "High-Octane", "Gritty", "Action-Packed", "Adrenaline-Fueled", "Stylized", "CGI-Heavy", "Over-the-Top", "Blockbuster", "Tentpole", "Franchise-Building", "Rebooted", "Sequelized", "Cinematic", "Epic", "Tactical", "Strategic", "Covert", "Clandestine", "Stealth"]

comedy_nouns = ["Improv", "Sketch", "Stand-Up", "Special", "Sitcom", "Laugh Track", "Bit", "Gag", "Punchline", "Roast", "Satire", "Parody", "Spoof", "Cringe Comedy", "Dark Comedy", "Rom-Com", "Buddy Cop", "Slapstick", "Deadpan", "Mockumentary"]
comedy_adjs = ["Hilarious", "Uproarious", "Sidesplitting", "Gut-Busting", "Laugh-Out-Loud", "Hysterical", "Riotous", "Satirical", "Subversive", "Irreverent", "Deadpan", "Cringe-Inducing", "Awkward", "Quirky", "Zany", "Wacky", "Goofy", "Silly", "Absurd", "Surreal"]

thriller_nouns = ["Gaslighting", "Plot Twist", "Red Herring", "MacGuffin", "Cliffhanger", "Suspense", "Tension", "Paranoia", "Conspiracy", "Cover-Up", "Whistleblower", "Hacker", "Psy-Op", "Double Agent", "Mole", "Informant", "Burner Phone", "Dead Drop", "Ransomware", "Deepfake"]
thriller_adjs = ["Nail-Biting", "Edge-of-Your-Seat", "Pulse-Pounding", "Gripping", "Tense", "Suspenseful", "Twisty", "Unpredictable", "Mind-Bending", "Psychological", "Paranoid", "Conspiratorial", "Hitchcockian", "Claustrophobic", "Taut", "Gritty", "Dark", "Atmospheric", "Chilling", "Sinister"]

append_to_genre_array('src/engine/generators/titles.ts', 'Drama', 'nouns', drama_nouns)
append_to_genre_array('src/engine/generators/titles.ts', 'Drama', 'adjs', drama_adjs)
append_to_genre_array('src/engine/generators/titles.ts', 'Sci-Fi', 'nouns', sci_fi_nouns)
append_to_genre_array('src/engine/generators/titles.ts', 'Sci-Fi', 'adjs', sci_fi_adjs)
append_to_genre_array('src/engine/generators/titles.ts', 'Horror', 'nouns', horror_nouns)
append_to_genre_array('src/engine/generators/titles.ts', 'Horror', 'adjs', horror_adjs)
append_to_genre_array('src/engine/generators/titles.ts', 'Action', 'nouns', action_nouns)
append_to_genre_array('src/engine/generators/titles.ts', 'Action', 'adjs', action_adjs)
append_to_genre_array('src/engine/generators/titles.ts', 'Comedy', 'nouns', comedy_nouns)
append_to_genre_array('src/engine/generators/titles.ts', 'Comedy', 'adjs', comedy_adjs)
append_to_genre_array('src/engine/generators/titles.ts', 'Thriller', 'nouns', thriller_nouns)
append_to_genre_array('src/engine/generators/titles.ts', 'Thriller', 'adjs', thriller_adjs)
