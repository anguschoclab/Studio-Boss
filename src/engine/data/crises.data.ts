import { CrisisOption } from '../types';

export interface CrisisTemplate {
  description: string;
  options: CrisisOption[];
}

export const CRISIS_POOLS: CrisisTemplate[] = [
  {
    description: "Your lead actor has been caught on a hot mic making disparaging remarks about the studio's latest streaming platform, calling it 'a digital graveyard for dreams'.",
    options: [
      {
        text: "Force them to issue a groveling apology and do a 48-hour social media takeover.",
        effectDescription: "Costs $50k in PR consulting. The actor's ego takes a hit, but the story dies.",
        cashPenalty: 50000
      },
      {
        text: "Lean into it. Market the film as 'the one the studio didn't want you to see'.",
        effectDescription: "Increases buzz by 25, but the studio owner is furious. Lose 10 reputation.",
        buzzPenalty: -25,
        reputationPenalty: 10
      },
      {
        text: "Fire them immediately for breach of contract.",
        effectDescription: "Costs $2M to recast and reshoot. The film is delayed by 4 weeks.",
        cashPenalty: 2100000,
        weeksDelay: 4
      }
    ]
  },
  {
    description: "The film's primary editor accidentally formatted the main server, losing three weeks of 'impossible to replicate' footage shot on location in the Himalayas.",
    options: [
      {
        text: "Spend a fortune on professional data recovery specialists.",
        effectDescription: "Costs $500k. There is a 70% chance it works (represented here as a cost/delay penalty).",
        cashPenalty: 500000,
        weeksDelay: 1
      },
      {
        text: "Send the crew back for reshoots.",
        effectDescription: "Costs $1.5M and delays the film by 3 weeks.",
        cashPenalty: 1500000,
        weeksDelay: 3
      },
      {
        text: "Edit around the missing footage and hope for the best.",
        effectDescription: "The pacing is ruined. Lose 30 buzz and 15 reputation.",
        buzzPenalty: 30,
        reputationPenalty: 15
      }
    ]
  },
  {
    description: "Your 'visionary' director has demanded an additional $5M to render every strand of hair on a CGI cat that only appears on screen for four seconds.",
    options: [
      {
        text: "Approve the budget increase. Art demands it.",
        effectDescription: "Costs $5M. The cat looks incredible.",
        cashPenalty: 5000000
      },
      {
        text: "Deny the request and use a budget CGI cat.",
        effectDescription: "The cat becomes a viral meme for all the wrong reasons. Lose 40 buzz.",
        buzzPenalty: 40
      },
      {
        text: "Cut the cat entirely and rewrite the scene for a real dog.",
        effectDescription: "Costs $200k for animal trainers and a reshoot day. Delays production by 1 week.",
        cashPenalty: 200000,
        weeksDelay: 1
      }
    ]
  },
  {
    description: "A rival studio has just announced a near-identical project with a bigger star, scheduled to release on the exact same weekend as yours.",
    options: [
      {
        text: "Move your release date up by two weeks.",
        effectDescription: "Marketing is rushed. Lose 15 buzz but gain a clear theatrical window.",
        buzzPenalty: 15,
        weeksDelay: -2
      },
      {
        text: "Double your marketing spend to outspend the competition.",
        effectDescription: "Costs an extra $5M in ad buys.",
        cashPenalty: 5000000
      },
      {
        text: "Stay the course and hope your film's quality wins out.",
        effectDescription: "The competition is fierce. Lose 50 buzz.",
        buzzPenalty: 50
      }
    ]
  },
  {
    description: "The star's romantic comedy interest has gone public with a devastating breakup—with your movie’s director.",
    options: [
      {
        text: "Hire a full-time mediator to stay on set.",
        effectDescription: "Costs $100k. Prevents a total shutdown.",
        cashPenalty: 100000
      },
      {
        text: "Shut down production until the drama cools off.",
        effectDescription: "Delays the film by 3 weeks.",
        weeksDelay: 3
      },
      {
        text: "Leak the drama to the tabloids to build 'authentic chemistry'.",
        effectDescription: "The film gains 20 buzz but the director and star's relationship is permanently toxic. Lose 10 reputation.",
        buzzPenalty: -20,
        reputationPenalty: 10
      }
    ]
  },
  {
    description: "The primary filming location—a historic 14th-century castle—has been haunted by a 'very active' poltergeist that keeps throwing lighting rigs at the crew.",
    options: [
      {
        text: "Hire an 'exorcism consultant' and a psychic.",
        effectDescription: "Costs $50k. It looks ridiculous in the trades. Lose 5 reputation.",
        cashPenalty: 50000,
        reputationPenalty: 5
      },
      {
        text: "Hazard pay for the entire crew.",
        effectDescription: "Costs $300k. The lights keep falling, but they keep working.",
        cashPenalty: 300000
      },
      {
        text: "Move to a green-screen soundstage.",
        effectDescription: "Costs $1M in unexpected VFX work and delays the shoot by 2 weeks.",
        cashPenalty: 1000000,
        weeksDelay: 2
      }
    ]
  },
  {
    description: "The script for your highly guarded sci-fi epic has been leaked to a popular fan forum, and the ending is being universally mocked.",
    options: [
      {
        text: "Rewrite the ending and reshoot.",
        effectDescription: "Costs $3M and delays the film by 5 weeks.",
        cashPenalty: 3000000,
        weeksDelay: 5
      },
      {
        text: "Lawyer up and sue the leaker into oblivion.",
        effectDescription: "Costs $500k in legal fees. The fans hate you for it. Lose 30 buzz.",
        cashPenalty: 500000,
        buzzPenalty: 30
      },
      {
        text: "Gaslight the internet. Claim the leak is a fake 'decoy' script.",
        effectDescription: "Costs $150k in rapid-response marketing. People kind of believe you.",
        cashPenalty: 150000
      }
    ]
  },
  {
    description: "Your lead actress has decided to pivot to an exclusive 'spiritual wellness' retreat in the middle of principal photography and refuses to check her phone.",
    options: [
      {
        text: "Send a private helicopter to find her.",
        effectDescription: "Costs $200k. She returns, but is resentful.",
        cashPenalty: 200000
      },
      {
        text: "Wait for her to return voluntarily.",
        effectDescription: "Delays the film by 2 weeks.",
        weeksDelay: 2
      },
      {
        text: "Sue for breach of contract and replace her.",
        effectDescription: "Costs $4M to recast and reshoot half the movie. Total disaster.",
        cashPenalty: 4000000,
        weeksDelay: 6
      }
    ]
  },
  {
    description: "During a stunt gone wrong, the film's only hero vehicle—a one-of-a-kind vintage Italian supercar—was driven into a lake.",
    options: [
      {
        text: "Drain the lake and hire a specialist to restore it.",
        effectDescription: "Costs $800k and delays the shoot by 3 weeks.",
        cashPenalty: 800000,
        weeksDelay: 3
      },
      {
        text: "Buy another one at an auction for a massive premium.",
        effectDescription: "Costs $1.5M out of pocket.",
        cashPenalty: 1500000
      },
      {
        text: "Fake it with a plastic shell and CGI in post.",
        effectDescription: "Costs $300k. The fans will notice. Lose 15 buzz.",
        cashPenalty: 300000,
        buzzPenalty: 15
      }
    ]
  },
  {
    description: "The studio's highly touted 'carbon neutral' initiative has been exposed as a sham: a local journalist found a secret diesel generator hidden under a pile of bamboo sets.",
    options: [
      {
        text: "Bribe the journalist with an exclusive 'BTS' series deal.",
        effectDescription: "Costs $300k in production commitments.",
        cashPenalty: 300000
      },
      {
        text: "Issue a public apology and pay a massive fine to an eco-charity.",
        effectDescription: "Costs $1M. Saves the studio's image.",
        cashPenalty: 1000000
      },
      {
        text: "Claim the generator belongs to the caterers and fire them.",
        effectDescription: "Costs $100k to replace the caterers. The crew is miserable (lose 5 reputation).",
        cashPenalty: 100000,
        reputationPenalty: 5
      }
    ]
  },
  {
    description: "Your 'method' lead actor has refused to wear modern shoes on set, even when out of character, and has now contracted a severe foot infection.",
    options: [
      {
        text: "Hire a full-time medical podiatrist to follow them around.",
        effectDescription: "Costs $150k for the remaining 4 weeks of production.",
        cashPenalty: 150000
      },
      {
        text: "Delay production until they heal.",
        effectDescription: "The film is pushed by 2 weeks.",
        weeksDelay: 2
      },
      {
        text: "Force them to wear shoes or be sued.",
        effectDescription: "They comply but trash the movie in every interview. Lose 25 buzz.",
        buzzPenalty: 25
      }
    ]
  },
  {
    description: "The film's most expensive practical effect—a scale model of London—was accidentally sat on by a tired PA.",
    options: [
      {
        text: "Rebuild it from scratch.",
        effectDescription: "Costs $500k and delays the shoot by 2 weeks.",
        cashPenalty: 500000,
        weeksDelay: 2
      },
      {
        text: "Fix it with duct tape and hide the damage with lens flares.",
        effectDescription: "Costs $50k. It looks 'stylistic'.",
        cashPenalty: 50000
      },
      {
        text: "Pivot to CGI for that sequence.",
        effectDescription: "Costs $1.2M in unplanned VFX work.",
        cashPenalty: 1200000
      }
    ]
  },
  {
    description: "Your director has gone 'rogue' and is shooting an experimental, 4-hour documentative cut about the 'nature of craft services', ignoring the original rom-com script.",
    options: [
      {
        text: "Fire the director and bring in a 'studio hack' to finish.",
        effectDescription: "Costs $800k in severance and new fees. The film is salvaged but loses all auteur buzz (lose 20 buzz).",
        cashPenalty: 800000,
        buzzPenalty: 20
      },
      {
        text: "Let them finish their vision and release it as a 'limited series'.",
        effectDescription: "Costs $2M in extra data and post-production. It's a risk.",
        cashPenalty: 2000000
      },
      {
        text: "Fly out a team of executives to supervise every shot.",
        effectDescription: "Costs $200k in travel and hotels. Delays production by 1 week as everyone argues.",
        cashPenalty: 200000,
        weeksDelay: 1
      }
    ]
  },
  {
    description: "A major religious group has called for a worldwide boycott of the studio because your family-friendly animated film features a 'too realistic' depiction of a demon.",
    options: [
      {
        text: "Digitally soften the demon's features to look like a marshmallow.",
        effectDescription: "Costs $1.5M in rush VFX. The film is now 'safe'.",
        cashPenalty: 1500000
      },
      {
        text: "Lean into the controversy and market it to horror fans.",
        effectDescription: "Pivoting the marketing costs $800k. Buzz increases by 40, but you lose family appeal.",
        cashPenalty: 800000,
        buzzPenalty: -40
      },
      {
        text: "Do nothing and hope it blows over.",
        effectDescription: "The boycott persists. Lose 60 buzz and 20 reputation.",
        buzzPenalty: 60,
        reputationPenalty: 20
      }
    ]
  },
  {
    description: "Your lead actor just announced their retirement from acting to become a professional competitive eater, effective immediately.",
    options: [
      {
        text: "Bribe them with a $2M 'completion bonus'.",
        effectDescription: "They finish the movie, but you're down $2M.",
        cashPenalty: 2000000
      },
      {
        text: "Deepfake the rest of their performance.",
        effectDescription: "Costs $3M for high-end digital doubles. Added 3 weeks to post.",
        cashPenalty: 3000000,
        weeksDelay: 3
      },
      {
        text: "Rewrite the script so their character dies halfway through.",
        effectDescription: "The movie's plot is unrecognizable. Lose 45 buzz.",
        buzzPenalty: 45
      }
    ]
  },
  {
    description: "During a night shoot, the crew accidentally 'borrowed' power from a local hospital, causing a brief blackout in the ICU.",
    options: [
      {
        text: "Pay an astronomical 'settlement' to the hospital board.",
        effectDescription: "Costs $2.5M to keep it out of the papers.",
        cashPenalty: 2500000
      },
      {
        text: "The story breaks. Studio is branded 'evil'.",
        effectDescription: "Lose 50 reputation and 30 buzz. Costs $500k in legal defense.",
        reputationPenalty: 50,
        buzzPenalty: 30,
        cashPenalty: 500000
      },
      {
        text: "Blame the local power grid and sue the utility company.",
        effectDescription: "Costs $200k in legal fees. Production is frozen for 2 weeks during the investigation.",
        cashPenalty: 200000,
        weeksDelay: 2
      }
    ]
  },
  {
    description: "A rogue intern accidentally deleted the only backup of the film's 10-minute climactic sequence.",
    options: [
      {
        text: "Reshoot the sequence.",
        effectDescription: "Costs $5M and delays the film by 3 weeks. It will never be as good as the original.",
        cashPenalty: 5000000,
        weeksDelay: 3,
        buzzPenalty: 10
      },
      {
        text: "Try to piece it together from low-res 'dailies'.",
        effectDescription: "The audiences and critics notice the drop in quality. Lose 25 buzz.",
        buzzPenalty: 25
      },
      {
        text: "Use a specialist firm to perform bit-level data reconstruction.",
        effectDescription: "Costs $1.2M. Delays production by 2 weeks. It is mostly successful.",
        cashPenalty: 1200000,
        weeksDelay: 2
      }
    ]
  },
  {
    description: "Your star actor's dog has passed away, and they have declared a 'month of mourning', refusing to leave their bedroom.",
    options: [
      {
        text: "Wait it out. Loyalty is everything.",
        effectDescription: "Delays production by an agonizing 4 weeks.",
        weeksDelay: 4
      },
      {
        text: "Hire a world-class 'pet medium' to conduct a seance on set.",
        effectDescription: "Costs $200k. The actor is mollified and returns in 3 days.",
        cashPenalty: 200000
      },
      {
        text: "Sue the star for failure to perform.",
        effectDescription: "They return, but they are visibly weeping in every scene which serves as a rom-com. Lose 35 buzz.",
        buzzPenalty: 35
      }
    ]
  },
  {
    description: "A prominent 'cultural consultant' you hired has gone rogue on TikTok, detailing every single change you made to their traditional story, calling the film 'profoundly offensive'.",
    options: [
      {
        text: "Pay them a $500k 'hush-up' settlement.",
        effectDescription: "They delete the account, but the damage is partially done.",
        cashPenalty: 500000
      },
      {
        text: "Issue a public apology and commit to massive reshoots with a new consultant.",
        effectDescription: "Costs $2M and delays the film by 4 weeks.",
        cashPenalty: 2000000,
        weeksDelay: 4
      },
      {
        text: "Ignore it and hope the marketing machines can bury the story.",
        effectDescription: "The backlash is fierce. Lose 50 buzz and 20 reputation.",
        buzzPenalty: 50,
        reputationPenalty: 20
      }
    ]
  },
  {
    description: "Extreme weather has literally blown the rooftop off your primary soundstage, destroying $2M in electronics and ruining your 'rain-free' set.",
    options: [
      {
        text: "Pay for an emergency 'rush' repair.",
        effectDescription: "Costs $2.5M. Production resumes in 1 week.",
        cashPenalty: 2500000,
        weeksDelay: 1
      },
      {
        text: "Move the shoot to another state entirely.",
        effectDescription: "Costs $1M in logistics. Delays production by 3 weeks.",
        cashPenalty: 1000000,
        weeksDelay: 3
      },
      {
        text: "Rewrite the movie to take place in a hurricane.",
        effectDescription: "Costs $500k in rewrites and effects. The plot makes no sense. Lose 20 buzz.",
        cashPenalty: 500000,
        buzzPenalty: 20
      }
    ]
  },
  {
    description: "Leaked emails show your lead actor mocking the film's source material, calling the original book 'trash for idiots'.",
    options: [
      {
        text: "Launch a $1M 'PR Rebranding' campaign for the actor.",
        effectDescription: "They appear on talk shows pretending to love the book.",
        cashPenalty: 1000000
      },
      {
        text: "Nothing. Controversy is free marketing.",
        effectDescription: "Buzz increases by 10, but the core fanbase is livid. Lose 25 buzz overall.",
        buzzPenalty: 15
      },
      {
        text: "Fire them and replace with a CGI character.",
        effectDescription: "Costs $5M and delays the film by 6 weeks. The internet is fascinated but confused.",
        cashPenalty: 5000000,
        weeksDelay: 6
      }
    ]
  },
  {
    description: "The film's most anticipated action scene—a motorcycle jump onto a moving train—was performed perfectly, but the camera operator forgot to press record.",
    options: [
      {
        text: "Fire the camera team and do it again.",
        effectDescription: "Costs $1M and delays the shoot by 2 weeks.",
        cashPenalty: 1000000,
        weeksDelay: 2
      },
      {
        text: "Use the 'stunt rehearsal' footage shot on an iPhone.",
        effectDescription: "The sequence looks terrible. Lose 30 buzz.",
        buzzPenalty: 30
      },
      {
        text: "Cut the scene entirely.",
        effectDescription: "The movie loses its biggest marketing hook. Lose 50 buzz.",
        buzzPenalty: 50
      }
    ]
  },
  {
    description: "Your lead actor has decided to go full 'Method' and refuses to break character, communicating only in grunts and throwing their own feces on set.",
    options: [
      {
        text: "Hire an 'Animal Whisperer' as a dialect coach.",
        effectDescription: "Costs $150k for the consultant.",
        cashPenalty: 150000
      },
      {
        text: "Cancel their press tour.",
        effectDescription: "The film loses crucial marketing momentum. Lose 25 buzz.",
        buzzPenalty: 25
      },
      {
        text: "Recolor the entire movie in post to match their aura.",
        effectDescription: "Costs $800k in VFX color grading and delays the release by 3 weeks.",
        cashPenalty: 800000,
        weeksDelay: 3
      }
    ]
  },
  {
    description: "The film's incredibly expensive, bespoke physical prop—a MacGuffin critical to the plot—was accidentally sold at a local garage sale by a disgruntled PA.",
    options: [
      {
        text: "Track it down and buy it back from a collector at a massive markup.",
        effectDescription: "Costs $300k.",
        cashPenalty: 300000
      },
      {
        text: "Rebuild it from scratch.",
        effectDescription: "Costs $100k and delays the shoot by 2 weeks.",
        cashPenalty: 100000,
        weeksDelay: 2
      },
      {
        text: "Replace it with a generic item and rewrite the script.",
        effectDescription: "The plot hole is massive. Lose 20 buzz.",
        buzzPenalty: 20
      }
    ]
  },
  {
    description: "The director of your gritty urban thriller insists on shooting exclusively during 'magic hour', reducing usable filming time to 15 minutes a day.",
    options: [
      {
        text: "Allow it for the sake of 'art'.",
        effectDescription: "Delays production by an unbelievable 6 weeks.",
        weeksDelay: 6
      },
      {
        text: "Force them to shoot all day and fix it in post.",
        effectDescription: "Costs $1.5M for extensive day-for-night/magic-hour VFX grading.",
        cashPenalty: 1500000
      },
      {
        text: "Fire the director.",
        effectDescription: "Costs $800k to replace them and delays the shoot by 3 weeks.",
        cashPenalty: 800000,
        weeksDelay: 3
      }
    ]
  },
  {
    description: "The studio's highly publicized 'carbon neutral' initiative is a sham, and an investigative journalist just found the massive hidden diesel generators powering the set.",
    options: [
      {
        text: "Bribe the journalist to kill the story.",
        effectDescription: "Costs $500k in hush money.",
        cashPenalty: 500000
      },
      {
        text: "Let the story break and issue a generic apology.",
        effectDescription: "The eco-conscious demographic boycotts the film. Lose 35 buzz.",
        buzzPenalty: 35
      },
      {
        text: "Actually go carbon neutral immediately.",
        effectDescription: "Costs $1.2M in rush infrastructure changes and delays the shoot by 2 weeks.",
        cashPenalty: 1200000,
        weeksDelay: 2
      }
    ]
  },
  {
    description: "A prominent supporting actor was just exposed for running a bizarre, multi-level marketing scheme selling 'brain-enhancing' essential oils to their fans.",
    options: [
      {
        text: "Digitally remove them and recast the role.",
        effectDescription: "Costs $1.5M in extensive VFX and delays post-production by 4 weeks.",
        cashPenalty: 1500000,
        weeksDelay: 4
      },
      {
        text: "Keep them in the movie, but ban them from the press tour.",
        effectDescription: "The association still taints the film. Lose 25 buzz.",
        buzzPenalty: 25
      },
      {
        text: "Invest in the MLM and feature the oils in the movie.",
        effectDescription: "Costs $200k. The fans realize they are being grifted. Massive 45 buzz penalty.",
        cashPenalty: 200000,
        buzzPenalty: 45
      }
    ]
  },
  {
    description: "The film's highly touted 'groundbreaking' CGI monster design was leaked, and the internet unanimously agrees it looks exactly like a popular children's cartoon character.",
    options: [
      {
        text: "Order an immediate, ground-up redesign.",
        effectDescription: "Costs a staggering $2.5M and delays post-production by 5 weeks.",
        cashPenalty: 2500000,
        weeksDelay: 5
      },
      {
        text: "Lean into it. Claim it's a deliberate homage.",
        effectDescription: "Audiences don't buy it, and you face a potential lawsuit. Lose 30 buzz and $500k in legal fees.",
        buzzPenalty: 30,
        cashPenalty: 500000
      },
      {
        text: "Release the movie with the terrible CGI.",
        effectDescription: "It becomes a massive laughingstock. Lose 40 buzz.",
        buzzPenalty: 40
      }
    ]
  },
  {
    description: "Your 'visionary' director has demanded that the entire third act be reshot because they 'had a dream where the villain was actually a misunderstood mime'.",
    options: [
      {
        text: "Approve the reshoots.",
        effectDescription: "Costs $2M and delays the film by 4 weeks. The ending is baffling.",
        cashPenalty: 2000000,
        weeksDelay: 4,
        buzzPenalty: 15
      },
      {
        text: "Refuse the reshoots and lock them out of the editing bay.",
        effectDescription: "The director throws a massive tantrum in the trades. Lose 25 buzz.",
        buzzPenalty: 25
      },
      {
        text: "Compromise by adding a mime to the background of one scene.",
        effectDescription: "Costs $50k, but the director is pacified.",
        cashPenalty: 50000
      }
    ]
  },
  {
    description: "Your lead actor has decided to go full 'Method' and refuses to break character, communicating only in grunts and throwing their own feces on set.",
    options: [
      {
        text: "Hire an 'Animal Whisperer' as a dialect coach.",
        effectDescription: "Costs $150k but the actor is somewhat mollified.",
        cashPenalty: 150000
      },
      {
        text: "Demand they break character or face legal action.",
        effectDescription: "They walk off set, delaying the film by 3 weeks.",
        weeksDelay: 3
      },
      {
        text: "Leak the behavior to the press as a 'brilliant creative process'.",
        effectDescription: "Increases buzz slightly, but costs $50k in crisis PR.",
        cashPenalty: 50000,
        buzzPenalty: -10
      }
    ]
  },
  {
    description: "The primary VFX studio just declared bankruptcy, taking the only server holding your unrendered CGI assets offline.",
    options: [
      {
        text: "Buy the VFX studio outright.",
        effectDescription: "Costs $3M. You save the assets but now own a failing VFX house.",
        cashPenalty: 3000000
      },
      {
        text: "Hire a hacktivist to break into their servers.",
        effectDescription: "Costs $250k. Highly illegal, but you get the files. Lose 10 reputation.",
        cashPenalty: 250000,
        reputationPenalty: 10
      },
      {
        text: "Start the VFX over from scratch with a new vendor.",
        effectDescription: "Costs $1.5M and adds 6 weeks to post-production.",
        cashPenalty: 1500000,
        weeksDelay: 6
      }
    ]
  },
  {
    description: "A decade-old tweet from your visionary director has just resurfaced, and it contains some incredibly problematic takes on a beloved cartoon franchise.",
    options: [
      {
        text: "Issue a groveling notes-app apology.",
        effectDescription: "Costs $50k in PR consulting. Lose 15 buzz as fans reject it.",
        cashPenalty: 50000,
        buzzPenalty: 15
      },
      {
        text: "Fire the director to appease the internet.",
        effectDescription: "Costs $1M to sever their contract. Delays the film by 4 weeks.",
        cashPenalty: 1000000,
        weeksDelay: 4
      },
      {
        text: "Claim their account was hacked by a time-traveling rival studio.",
        effectDescription: "Audiences mock the blatant lie. Lose 30 buzz and 5 reputation.",
        buzzPenalty: 30,
        reputationPenalty: 5
      }
    ]
  },
  {
    description: "An extra managed to smuggle a script onto Reddit, and a 4-hour video essay dismantling your plot holes is currently trending #1 on YouTube.",
    options: [
      {
        text: "Rewrite the final act to subvert their expectations.",
        effectDescription: "Costs $800k in emergency rewrites and reshoots. Delays production by 2 weeks.",
        cashPenalty: 800000,
        weeksDelay: 2
      },
      {
        text: "File a DMCA takedown and threaten to sue the YouTuber.",
        effectDescription: "Streisand Effect kicks in. The internet hates you. Lose 40 buzz.",
        buzzPenalty: 40
      },
      {
        text: "Hire the YouTuber as a 'Creative Consultant'.",
        effectDescription: "Costs $200k. The script stays the same but the fan backlash softens.",
        cashPenalty: 200000
      }
    ]
  },
  {
    description: "A ransomware syndicate has stolen the director's cut of your highly anticipated blockbuster and is threatening to release it with comic-sans subtitles.",
    options: [
      {
        text: "Pay the ransom in cryptocurrency.",
        effectDescription: "Costs an untraceable $1.2M.",
        cashPenalty: 1200000
      },
      {
        text: "Call their bluff and refuse to pay.",
        effectDescription: "They leak it. The comic-sans is deeply distracting. Lose 50 buzz and 15 reputation.",
        buzzPenalty: 50,
        reputationPenalty: 15
      },
      {
        text: "Preemptively leak the movie yourself.",
        effectDescription: "Costs $100k to set up the 'leak'. The studio loses its theatrical window. Massive financial loss. Lose $5M.",
        cashPenalty: 5100000
      }
    ]
  },
  {
    description: "Your lead actor refuses to promote the movie unless the studio funds their side project: a 3-hour black-and-white silent film about crypto-mining.",
    options: [
      {
        text: "Fund the side project.",
        effectDescription: "Costs $2M. The vanity project is a disaster, but they do the press tour.",
        cashPenalty: 2000000
      },
      {
        text: "Cancel their press tour.",
        effectDescription: "The film loses massive marketing momentum. Lose 35 buzz.",
        buzzPenalty: 35
      },
      {
        text: "Threaten to sue them for breach of contract.",
        effectDescription: "They do the press tour but bad-mouth the film in every interview. Lose 20 buzz and 10 reputation.",
        buzzPenalty: 20,
        reputationPenalty: 10
      }
    ]
  },
  {
    description: "The highly-touted practical explosion sequence accidentally ignited a nearby prop warehouse, destroying $500k worth of vintage costumes.",
    options: [
      {
        text: "Pay the damages out of pocket.",
        effectDescription: "Costs $500k in hush money.",
        cashPenalty: 500000
      },
      {
        text: "Blame the pyrotechnics vendor and sue.",
        effectDescription: "Costs $100k in legal fees. Production is delayed 2 weeks while the set is locked down.",
        cashPenalty: 100000,
        weeksDelay: 2
      },
      {
        text: "Claim the fire was part of the shot and use the footage.",
        effectDescription: "Costs $0 but you get sued by the warehouse owner for $1M.",
        cashPenalty: 1000000
      }
    ]
  },
  {
    description: "Your 'inclusive' historical epic just cast a wildly historically inaccurate lead, and historians on TikTok are destroying the film's credibility.",
    options: [
      {
        text: "Deepfake a more historically accurate face onto the actor.",
        effectDescription: "Costs $1.5M in extensive post-production VFX.",
        cashPenalty: 1500000
      },
      {
        text: "Lean into the controversy. It's 'alternative history'.",
        effectDescription: "Audiences are confused. Lose 25 buzz.",
        buzzPenalty: 25
      },
      {
        text: "Recast the role and reshoot their scenes.",
        effectDescription: "Costs $2.5M and delays the film by 5 weeks.",
        cashPenalty: 2500000,
        weeksDelay: 5
      }
    ]
  },
  {
    description: "The studio's highly publicized 'carbon neutral' initiative is a sham, and an investigative journalist just found the massive hidden diesel generators powering the set.",
    options: [
      {
        text: "Bribe the journalist to kill the story.",
        effectDescription: "Costs $500k in hush money.",
        cashPenalty: 500000
      },
      {
        text: "Let the story break and issue a generic apology.",
        effectDescription: "The eco-conscious demographic boycotts the film. Lose 35 buzz.",
        buzzPenalty: 35
      },
      {
        text: "Actually go carbon neutral immediately.",
        effectDescription: "Costs $1.2M in rush infrastructure changes and delays the shoot by 2 weeks.",
        cashPenalty: 1200000,
        weeksDelay: 2
      }
    ]
  },
  {
    description: "The star of your romantic comedy is publicly feuding with their co-star. The paparazzi just caught them brawling outside a vegan restaurant.",
    options: [
      {
        text: "Spin the brawl as a 'passionate rehearsal' for the film.",
        effectDescription: "Costs $200k in PR spin. People kind of buy it.",
        cashPenalty: 200000
      },
      {
        text: "Fire the instigator.",
        effectDescription: "Costs $1M to sever their contract. Delays the film by 4 weeks to recast.",
        cashPenalty: 1000000,
        weeksDelay: 4
      },
      {
        text: "Ignore it and let the tabloids run wild.",
        effectDescription: "The toxic on-set environment ruins the chemistry. Lose 30 buzz.",
        buzzPenalty: 30
      }
    ]
  },
  {
    description: "A prominent supporting actor was just exposed for running a bizarre, multi-level marketing scheme selling 'brain-enhancing' essential oils to their fans.",
    options: [
      {
        text: "Digitally remove them and recast the role.",
        effectDescription: "Costs $1.5M in extensive VFX and delays post-production by 4 weeks.",
        cashPenalty: 1500000,
        weeksDelay: 4
      },
      {
        text: "Keep them in the movie, but ban them from the press tour.",
        effectDescription: "The association still taints the film. Lose 25 buzz.",
        buzzPenalty: 25
      },
      {
        text: "Invest in the MLM and feature the oils in the movie.",
        effectDescription: "Costs $200k. The fans realize they are being grifted. Massive 45 buzz penalty.",
        cashPenalty: 200000,
        buzzPenalty: 45
      }
    ]
  },
  {
    description: "The film's highly touted 'groundbreaking' CGI monster design was leaked, and the internet unanimously agrees it looks exactly like a popular children's cartoon character.",
    options: [
      {
        text: "Order an immediate, ground-up redesign.",
        effectDescription: "Costs a staggering $2.5M and delays post-production by 5 weeks.",
        cashPenalty: 2500000,
        weeksDelay: 5
      },
      {
        text: "Lean into it. Claim it's a deliberate homage.",
        effectDescription: "Audiences don't buy it, and you face a potential lawsuit. Lose 30 buzz and $500k in legal fees.",
        buzzPenalty: 30,
        cashPenalty: 500000
      },
      {
        text: "Release the movie with the terrible CGI.",
        effectDescription: "It becomes a massive laughingstock. Lose 40 buzz.",
        buzzPenalty: 40
      }
    ]
  },
  {
    description: "Your 'visionary' director has demanded that the entire third act be reshot because they 'had a dream where the villain was actually a misunderstood mime'.",
    options: [
      {
        text: "Approve the reshoots.",
        effectDescription: "Costs $2M and delays the film by 4 weeks. The ending is baffling.",
        cashPenalty: 2000000,
        weeksDelay: 4,
        buzzPenalty: 15
      },
      {
        text: "Refuse the reshoots and lock them out of the editing bay.",
        effectDescription: "The director throws a massive tantrum in the trades. Lose 25 buzz.",
        buzzPenalty: 25
      },
      {
        text: "Compromise by adding a mime to the background of one scene.",
        effectDescription: "Costs $50k, but the director is pacified.",
        cashPenalty: 50000
      }
    ]
  },
  {
    description: "The movie's lead has been accused of stealing the plot from a wildly popular, self-published fan-fiction blog.",
    options: [
      {
        text: "Buy the rights to the fan-fiction quietly.",
        effectDescription: "Costs $500k to bury the scandal.",
        cashPenalty: 500000
      },
      {
        text: "Sue the blogger for defamation.",
        effectDescription: "Costs $250k in legal fees. The internet turns against you. Lose 35 buzz.",
        cashPenalty: 250000,
        buzzPenalty: 35
      },
      {
        text: "Rewrite the film entirely.",
        effectDescription: "Costs $1.5M and adds 6 weeks to production.",
        cashPenalty: 1500000,
        weeksDelay: 6
      }
    ]
  },
  {
    description: "A rogue marketing intern accidentally tweeted the entire plot twist from the official studio account.",
    options: [
      {
        text: "Claim it was a brilliant meta-marketing stunt.",
        effectDescription: "Costs $100k in rapid PR spin. People are still annoyed. Lose 10 buzz.",
        cashPenalty: 100000,
        buzzPenalty: 10
      },
      {
        text: "Delete the tweet and fire the intern.",
        effectDescription: "The internet already screenshotted it. The twist is ruined. Lose 25 buzz.",
        buzzPenalty: 25
      },
      {
        text: "Shoot a completely new ending.",
        effectDescription: "Costs $1M and delays the release by 3 weeks.",
        cashPenalty: 1000000,
        weeksDelay: 3
      }
    ]
  },
  {
    description: "Your lead method actor has fully immersed themselves in their character as an 18th-century cobbler and is refusing to wear modern shoes, perform lines correctly, or acknowledge anyone by their real names.",
    options: [
      {
        text: "Hire an 'acting coach' who is actually a therapist to gently guide them out.",
        effectDescription: "Costs $150k but saves face and keeps production on track.",
        cashPenalty: 150000
      },
      {
        text: "Let them do it. It's 'art.'",
        effectDescription: "The crew is miserable, delaying production by 3 weeks.",
        weeksDelay: 3
      },
      {
        text: "Threaten a breach of contract lawsuit unless they break character.",
        effectDescription: "They break character, but immediately trash the studio to the press. Lose 30 buzz and 5 reputation.",
        buzzPenalty: 30,
        reputationPenalty: 5
      }
    ]
  },
  {
    description: "The primary VFX studio hired for the film has suddenly declared bankruptcy, leaving 80% of your CGI shots unfinished and held hostage by their creditors.",
    options: [
      {
        text: "Pay off their most urgent creditors to get the servers unlocked.",
        effectDescription: "Costs a staggering $2.5M, but you get the files immediately.",
        cashPenalty: 2500000
      },
      {
        text: "Pivot to practical effects and miniatures for the remaining shots.",
        effectDescription: "Costs $800k and delays the release by 4 weeks while sets are built.",
        cashPenalty: 800000,
        weeksDelay: 4
      },
      {
        text: "Release it as is, claiming it's an 'avant-garde deconstruction of modern cinema'.",
        effectDescription: "Audiences despise it. Lose 45 buzz and 10 reputation.",
        buzzPenalty: 45,
        reputationPenalty: 10
      }
    ]
  },
  {
    description: "Extremely problematic tweets from your director dating back to 2011 have suddenly resurfaced and are trending globally on social media.",
    options: [
      {
        text: "Launch a massive PR campaign and 'Apology Tour'.",
        effectDescription: "Costs $500k in crisis management fees, but saves the director's job.",
        cashPenalty: 500000
      },
      {
        text: "Fire the director and bring in a reliable studio hack to finish.",
        effectDescription: "Costs $300k and adds 3 weeks of reshoots.",
        cashPenalty: 300000,
        weeksDelay: 3
      },
      {
        text: "Do absolutely nothing and hope it blows over.",
        effectDescription: "The internet goes nuclear. The studio's reputation suffers heavily. Lose 35 buzz and 15 reputation.",
        buzzPenalty: 35,
        reputationPenalty: 15
      }
    ]
  },
  {
    description: "Your A-list lead actor has been arrested in a foreign country for attempting to smuggle an endangered iguana through customs.",
    options: [
      {
        text: "Bribe local officials through a shell company to get them released.",
        effectDescription: "Costs $1M and is highly illegal, but production resumes.",
        cashPenalty: 1000000
      },
      {
        text: "Rewrite the script to explain their sudden disappearance.",
        effectDescription: "The rewrite is terrible and delays the film by 2 weeks. Lose 15 buzz.",
        weeksDelay: 2,
        buzzPenalty: 15
      },
      {
        text: "Wait for the legal process to play out.",
        effectDescription: "Production is halted for 5 weeks while they post bail.",
        weeksDelay: 5
      }
    ]
  },
  {
    description: "An anonymous hacker group is threatening to leak the unfinished, un-color-graded film unless a $2M ransom is paid in cryptocurrency.",
    options: [
      {
        text: "Pay the ransom quietly.",
        effectDescription: "Costs $2M in untraceable funds.",
        cashPenalty: 2000000
      },
      {
        text: "Call their buff and refuse to pay.",
        effectDescription: "The movie leaks. Everyone sees the green screens. Lose 40 buzz.",
        buzzPenalty: 40
      },
      {
        text: "Leak it yourself first as a 'teaser' to establish dominance.",
        effectDescription: "Costs $100k in PR spin. Confuses the public but lessens the blow. Lose 20 buzz.",
        cashPenalty: 100000,
        buzzPenalty: 20
      }
    ]
  },
  {
    description: "Your two co-stars have developed a deep, burning hatred for each other and absolutely refuse to film any scenes together.",
    options: [
      {
        text: "Shoot their scenes separately and stitch them together in post.",
        effectDescription: "Costs $600k in extra VFX work and scheduling delays.",
        cashPenalty: 600000
      },
      {
        text: "Hire a mediator to force them into a truce.",
        effectDescription: "Costs $150k but delays production by 1 week while they talk it out.",
        cashPenalty: 150000,
        weeksDelay: 1
      },
      {
        text: "Fire the supporting star and recast immediately.",
        effectDescription: "Costs $400k and delays production by 3 weeks.",
        cashPenalty: 400000,
        weeksDelay: 3
      }
    ]
  },
  {
    description: "The crew has walked off the set, claiming the historic location is severely haunted after three lighting rigs collapsed under mysterious circumstances.",
    options: [
      {
        text: "Hire an exorcist and a psychic to cleanse the set.",
        effectDescription: "Costs $50k. The crew comes back, but you lose 5 reputation for looking ridiculous.",
        cashPenalty: 50000,
        reputationPenalty: 5
      },
      {
        text: "Abandon the location and rebuild the set on a soundstage.",
        effectDescription: "Costs $1.2M and delays production by 4 weeks.",
        cashPenalty: 1200000,
        weeksDelay: 4
      },
      {
        text: "Force them to work under threat of firing.",
        effectDescription: "The crew returns resentfully. The film suffers. Lose 25 buzz.",
        buzzPenalty: 25
      }
    ]
  },
  {
    description: "A major corporate sponsor realized their product is being used by the villain and is demanding extensive reshoots to make their soda look 'heroic'.",
    options: [
      {
        text: "Comply and write a scene where the hero drinks the soda.",
        effectDescription: "Costs $300k and delays the film by 1 week. The scene is cringe-inducing. Lose 15 buzz.",
        cashPenalty: 300000,
        weeksDelay: 1,
        buzzPenalty: 15
      },
      {
        text: "Digitally replace the soda in every frame.",
        effectDescription: "Costs $800k in last-minute VFX work.",
        cashPenalty: 800000
      },
      {
        text: "Tell the sponsor to kick rocks and breach the contract.",
        effectDescription: "You lose the sponsorship money and face a lawsuit. Lose $1.5M.",
        cashPenalty: 1500000
      }
    ]
  },
  {
    description: "During a massive crowd scene, a legitimate brawl breaks out among the extras, leading to several injuries and a police shutdown.",
    options: [
      {
        text: "Settle all medical bills and quietly pay off the injured extras.",
        effectDescription: "Costs $400k to avoid lawsuits.",
        cashPenalty: 400000
      },
      {
        text: "Use the footage of the real brawl in the movie.",
        effectDescription: "Saves money, but the unions are furious. Lose 10 reputation.",
        reputationPenalty: 10
      },
      {
        text: "Shut down production until a safety review is completed.",
        effectDescription: "Delays the film by 3 weeks.",
        weeksDelay: 3
      }
    ]
  },
  {
    description: "A critical prop—an authentic 17th-century guitar on loan from a museum—was accidentally smashed to splinters by the lead actor in a fit of rage.",
    options: [
      {
        text: "Pay the museum its full insured value.",
        effectDescription: "Costs $1.2M out of pocket.",
        cashPenalty: 1200000
      },
      {
        text: "Cover it up and return a convincing replica.",
        effectDescription: "Costs $100k, but if caught, it'll be a disaster. The anxiety costs you 10 buzz.",
        cashPenalty: 100000,
        buzzPenalty: 10
      },
      {
        text: "Publicly blame the prop department and fire them.",
        effectDescription: "Saves the studio's face, but destroys crew morale. Delays production by 2 weeks and costs 5 reputation.",
        weeksDelay: 2,
        reputationPenalty: 5
      }
    ]
  },
  {
    description: "A rogue drone operator captured the entire climactic ending of the film and uploaded it to a popular subreddit, ruining the twist for millions.",
    options: [
      {
        text: "Hire private investigators to find the leaker and sue them into oblivion.",
        effectDescription: "Costs $300k in legal fees, but sends a message.",
        cashPenalty: 300000
      },
      {
        text: "Shoot an entirely new, decoy ending to confuse the internet.",
        effectDescription: "Costs $1.5M and delays release by 3 weeks.",
        cashPenalty: 1500000,
        weeksDelay: 3
      },
      {
        text: "Claim the leak was intentional 'viral marketing'.",
        effectDescription: "No one believes you. The film's hype deflates. Lose 35 buzz.",
        buzzPenalty: 35
      }
    ]
  },
  {
    description: "The cultural consultant you hired just published a scathing 5,000-word exposé in a major magazine calling the film 'profoundly tone-deaf and insulting.'",
    options: [
      {
        text: "Publicly apologize and commit to extensive reshoots.",
        effectDescription: "Costs $2M and adds 4 weeks to the schedule.",
        cashPenalty: 2000000,
        weeksDelay: 4
      },
      {
        text: "Hire a rival PR firm to discredit the consultant.",
        effectDescription: "Costs $500k. It's ugly, but it saves the film's buzz at the cost of 10 reputation.",
        cashPenalty: 500000,
        reputationPenalty: 10
      },
      {
        text: "Ignore the article entirely.",
        effectDescription: "The backlash is fierce. Lose 45 buzz.",
        buzzPenalty: 45
      }
    ]
  },
  {
    description: "The local mayor has revoked your filming permits after the director went on a profanity-laced tirade about the town's catering options.",
    options: [
      {
        text: "Make a massive 'donation' to the mayor's re-election campaign.",
        effectDescription: "Costs $750k to get the permits back instantly.",
        cashPenalty: 750000
      },
      {
        text: "Force the director to grovel publicly and apologize.",
        effectDescription: "The director's ego takes a hit, but it costs nothing. Lose 15 buzz.",
        buzzPenalty: 15
      },
      {
        text: "Move the entire production to a neighboring state.",
        effectDescription: "Costs $1.5M and delays filming by 3 weeks.",
        cashPenalty: 1500000,
        weeksDelay: 3
      }
    ]
  },
  {
    description: "Your lead talent has joined a 'wellness cult' in the desert and refuses to read any script pages that contain negative energy.",
    options: [
      {
        text: "Hire the cult leader as a 'spiritual producer' to placate them.",
        effectDescription: "Costs $400k in a fake salary, but the actor returns to work.",
        cashPenalty: 400000
      },
      {
        text: "Have the writers hastily rewrite the entire film to be 'positive'.",
        effectDescription: "Costs $200k and ruins the gritty tone. Lose 25 buzz.",
        cashPenalty: 200000,
        buzzPenalty: 25
      },
      {
        text: "Send a private security team to 'extract' them from the compound.",
        effectDescription: "Costs $500k and delays production by 2 weeks while things cool down.",
        cashPenalty: 500000,
        weeksDelay: 2
      }
    ]
  },
  {
    description: "The studio executives have suddenly decided the film needs a talking CGI animal sidekick to boost merchandise sales, and they want it added retroactively to every scene.",
    options: [
      {
        text: "Comply and ruin the film's artistic integrity.",
        effectDescription: "Costs $3M in VFX and delays the film by 5 weeks.",
        cashPenalty: 3000000,
        weeksDelay: 5
      },
      {
        text: "Threaten to take your name off the project and leak the memo.",
        effectDescription: "The executives back down, but your relationship is damaged. Lose 15 reputation.",
        reputationPenalty: 15
      },
      {
        text: "Add the CGI animal, but make it deeply unsettling on purpose.",
        effectDescription: "Costs $500k. The internet turns it into a meme, but it alienates general audiences. Lose 20 buzz.",
        cashPenalty: 500000,
        buzzPenalty: 20
      }
    ]
  }
];
