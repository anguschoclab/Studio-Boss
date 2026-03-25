import { Project, ActiveCrisis, GameState } from '../types';
import { pick } from '../utils';

const CRISIS_POOLS = [
  {
    description: "Your lead actor is refusing to leave their trailer, citing 'creative differences' with the director.",
    options: [
      {
        text: "Pay them off.",
        effectDescription: "Lose $250k but keep production moving.",
        cashPenalty: 250000
      },
      {
        text: "Fire the director and find a replacement.",
        effectDescription: "Delays production by 2 weeks and costs $100k.",
        weeksDelay: 2,
        cashPenalty: 100000
      },
      {
        text: "Force them to work.",
        effectDescription: "No cost, but project buzz takes a massive hit.",
        buzzPenalty: 20
      }
    ]
  },
  {
    description: "A major set piece was destroyed in a freak accident overnight.",
    options: [
      {
        text: "Rebuild it from scratch.",
        effectDescription: "Costs $500k and delays production by 1 week.",
        cashPenalty: 500000,
        weeksDelay: 1
      },
      {
        text: "Rewrite the script to bypass the scene.",
        effectDescription: "Saves money but severely hurts the project's buzz.",
        buzzPenalty: 15
      }
    ]
  },
  {
    description: "The studio executives are demanding a sudden tone shift to chase a new trend.",
    options: [
      {
        text: "Comply and reshoot scenes.",
        effectDescription: "Costs $300k and adds 2 weeks to production.",
        cashPenalty: 300000,
        weeksDelay: 2
      },
      {
        text: "Fight the executives and stick to the vision.",
        effectDescription: "Risk a major PR disaster. Loses 10 buzz.",
        buzzPenalty: 10
      }
    ]
  },
  {
    description: "Your Method Actor is refusing to leave character, which happens to be a 19th-century tuberculosis patient. They are coughing on the crew and demanding leeches.",
    options: [
      {
        text: "Hire an on-set 'apothecary' to humor them.",
        effectDescription: "Costs $150k but keeps the actor happy.",
        cashPenalty: 150000
      },
      {
        text: "Threaten to recast them.",
        effectDescription: "Actor complies, but morale plummets and project buzz takes a hit.",
        buzzPenalty: 25
      },
      {
        text: "Lean into it. Leak the story to the trades.",
        effectDescription: "Massive buzz boost, but production slows down by 2 weeks as they 'recover'.",
        weeksDelay: 2,
        buzzPenalty: -15
      }
    ]
  },
  {
    description: "The primary VFX studio just filed for bankruptcy and took your raw plates down with them.",
    options: [
      {
        text: "Buy them out to seize the servers.",
        effectDescription: "Costs an eye-watering $2.5M, but saves the schedule.",
        cashPenalty: 2500000
      },
      {
        text: "Pivot to 'practical effects'.",
        effectDescription: "Costs $500k and delays the film by 4 weeks to rebuild scenes.",
        cashPenalty: 500000,
        weeksDelay: 4
      },
      {
        text: "Release it unfinished. Call it an 'artistic choice'.",
        effectDescription: "Saves money, but the internet destroys your buzz.",
        buzzPenalty: 40
      }
    ]
  },
  {
    description: "The Director's old, highly problematic tweets just resurfaced.",
    options: [
      {
        text: "Fire them immediately.",
        effectDescription: "Costs $400k to replace them and delays by 3 weeks.",
        cashPenalty: 400000,
        weeksDelay: 3
      },
      {
        text: "Launch a costly PR apology tour.",
        effectDescription: "Costs $800k but keeps production on track.",
        cashPenalty: 800000
      },
      {
        text: "Ignore the mob.",
        effectDescription: "No cost, but project buzz is obliterated.",
        buzzPenalty: 50
      }
    ]
  },
  {
    description: "An A-list cameo demands their trailer be entirely repainted 'eggshell white', delaying their scene.",
    options: [
      {
        text: "Repaint it overnight.",
        effectDescription: "Costs $50k in overtime pay.",
        cashPenalty: 50000
      },
      {
        text: "Tell them to deal with 'bone white'.",
        effectDescription: "They walk off set. Delays production by 1 week.",
        weeksDelay: 1
      }
    ]
  },
  {
    description: "A rogue extra smuggled a smartphone on set and leaked the secret ending to Reddit.",
    options: [
      {
        text: "Rewrite and reshoot the ending.",
        effectDescription: "Costs $1M and adds 3 weeks to production.",
        cashPenalty: 1000000,
        weeksDelay: 3
      },
      {
        text: "Lean into it and release a fake 'alternate leak'.",
        effectDescription: "Costs $200k in marketing to confuse the internet, but neutralizes the buzz drop.",
        cashPenalty: 200000
      },
      {
        text: "Do nothing.",
        effectDescription: "The surprise is ruined. Lose 30 buzz.",
        buzzPenalty: 30
      }
    ]
  },
  {
    description: "The film's dog star has allegedly bitten the key grip. The humane society is threatening to shut down production.",
    options: [
      {
        text: "Settle with the grip and pay off the inspectors.",
        effectDescription: "Costs $300k to sweep it under the rug.",
        cashPenalty: 300000
      },
      {
        text: "Fire the dog and recast with CGI.",
        effectDescription: "Costs $750k and delays by 2 weeks.",
        cashPenalty: 750000,
        weeksDelay: 2
      }
    ]
  },
  {
    description: "Your lead actress has launched a holistic lifestyle brand and is insisting on rewriting her dialogue to promote her crystal-infused water.",
    options: [
      {
        text: "Let her have one product placement scene.",
        effectDescription: "No monetary cost, but loses 15 buzz from cringeworthy dialogue.",
        buzzPenalty: 15
      },
      {
        text: "Hire ghostwriters to subtly remove it daily.",
        effectDescription: "Costs $150k in daily script polish fees.",
        cashPenalty: 150000
      },
      {
        text: "Put your foot down.",
        effectDescription: "She locks herself in her trailer. 1 week delay.",
        weeksDelay: 1
      }
    ]
  },
  {
    description: "A sudden union strike by the catering team leaves the crew starving and threatening to walk out.",
    options: [
      {
        text: "Cater Nobu for the entire crew.",
        effectDescription: "Costs $250k but production continues.",
        cashPenalty: 250000
      },
      {
        text: "Wait out the strike.",
        effectDescription: "Delays production by 2 weeks.",
        weeksDelay: 2
      }
    ]
  },
  {
    description: "The studio president's untalented nephew was just promised a speaking role by the director.",
    options: [
      {
        text: "Cut his scenes in post.",
        effectDescription: "Saves the movie's integrity, but causes friction later.",
        buzzPenalty: 10
      },
      {
        text: "Pay an acting coach to miracle a performance.",
        effectDescription: "Costs $200k.",
        cashPenalty: 200000
      },
      {
        text: "Let him ruin the scene.",
        effectDescription: "Loses 20 buzz because he is truly terrible.",
        buzzPenalty: 20
      }
    ]
  },
  {
    description: "An unexpected hurricane destroys your tropical location shoot.",
    options: [
      {
        text: "Relocate to a soundstage in Atlanta.",
        effectDescription: "Costs $1.5M and delays by 3 weeks.",
        cashPenalty: 1500000,
        weeksDelay: 3
      },
      {
        text: "Wait for the weather to clear.",
        effectDescription: "Delays production by 5 weeks.",
        weeksDelay: 5
      }
    ]
  },
  {
    description: "Your co-stars are engaged in a bitter, public feud and refuse to look at each other during scenes.",
    options: [
      {
        text: "Shoot their coverage on separate days.",
        effectDescription: "Adds 3 weeks to the schedule.",
        weeksDelay: 3
      },
      {
        text: "Hire a celebrity mediator.",
        effectDescription: "Costs $400k.",
        cashPenalty: 400000
      },
      {
        text: "Force them to work it out on camera.",
        effectDescription: "The tension is palpable, but toxic. Lose 25 buzz from bad press.",
        buzzPenalty: 25
      }
    ]
  },
  {
    description: "The test screening scores are abysmal. The audience hated the third act.",
    options: [
      {
        text: "Order massive reshoots.",
        effectDescription: "Costs $2M and adds 4 weeks of production.",
        cashPenalty: 2000000,
        weeksDelay: 4
      },
      {
        text: "Re-cut the film in the edit bay.",
        effectDescription: "Costs $500k.",
        cashPenalty: 500000
      },
      {
        text: "Release it as is. Blame the audience.",
        effectDescription: "Massive 40 buzz penalty.",
        buzzPenalty: 40
      }
    ]
  },
  {
    description: "A rival studio has just announced a film with the exact same premise, releasing one month before yours.",
    options: [
      {
        text: "Rush production to beat them to theaters.",
        effectDescription: "Costs $1.5M in overtime, but avoids a delay.",
        cashPenalty: 1500000
      },
      {
        text: "Pivot the marketing to make yours look like the 'premium' version.",
        effectDescription: "Costs $800k in new marketing spend.",
        cashPenalty: 800000
      },
      {
        text: "Stay the course.",
        effectDescription: "Lose 35 buzz as you look like a cheap knock-off.",
        buzzPenalty: 35
      }
    ]
  },
  {
    description: "Your composer was caught plagiarizing the main theme from an obscure 1970s Italian horror film.",
    options: [
      {
        text: "Fire them and hire Hans Zimmer's non-union equivalent.",
        effectDescription: "Costs $600k and delays by 2 weeks.",
        cashPenalty: 600000,
        weeksDelay: 2
      },
      {
        text: "Quietly pay off the original Italian composer.",
        effectDescription: "Costs $1M in hush money.",
        cashPenalty: 1000000
      },
      {
        text: "Claim it's a 'homage'.",
        effectDescription: "The internet isn't fooled. Lose 25 buzz.",
        buzzPenalty: 25
      }
    ]
  },
  {
    description: "The 'indie darling' director you hired is paralyzed by choice and hasn't yelled 'action' in three days.",
    options: [
      {
        text: "Send the producers down to scream at them.",
        effectDescription: "Costs nothing, but morale plummets. Lose 15 buzz.",
        buzzPenalty: 15
      },
      {
        text: "Hire a ghost-director to actually run the set.",
        effectDescription: "Costs $300k.",
        cashPenalty: 300000
      },
      {
        text: "Let them 'find the scene'.",
        effectDescription: "Delays production by 2 weeks.",
        weeksDelay: 2
      }
    ]
  }

,
  {
    description: "The film's 'visionary' director insists on shooting a 45-minute unbroken take in a moving train, and the camera operator just quit in tears.",
    options: [
      {
        text: "Hire an expensive specialist Steadicam op.",
        effectDescription: "Costs $350k but the shot might actually work.",
        cashPenalty: 350000
      },
      {
        text: "Force the director to cut the scene into manageable pieces.",
        effectDescription: "Saves money, but the director throws a tantrum. Morale drops, 15 buzz lost.",
        buzzPenalty: 15
      },
      {
        text: "Attempt the shot with the B-camera op.",
        effectDescription: "Takes 2 weeks of failed takes before they finally get it.",
        weeksDelay: 2
      }
    ]
  },
  {
    description: "A hacker group has breached the studio servers and threatens to leak the unrendered, embarrassing green-screen footage of your lead actor.",
    options: [
      {
        text: "Pay the ransom in cryptocurrency.",
        effectDescription: "Costs $1.5M quietly.",
        cashPenalty: 1500000
      },
      {
        text: "Call their bluff.",
        effectDescription: "They leak it. The actor looks ridiculous in a mo-cap suit without effects. Massive 35 buzz penalty.",
        buzzPenalty: 35
      },
      {
        text: "Leak it yourself as a 'hilarious behind-the-scenes' viral marketing stunt.",
        effectDescription: "Costs $500k in PR spin, but neutralizes the threat and gains some goodwill.",
        cashPenalty: 500000,
        buzzPenalty: -10
      }
    ]
  },
  {
    description: "The studio's highly publicized 'sustainability initiative' is a disaster; the solar-powered generators keep failing during night shoots.",
    options: [
      {
        text: "Quietly bring in massive diesel generators.",
        effectDescription: "Costs $200k in rush rentals and fuel.",
        cashPenalty: 200000
      },
      {
        text: "Stick to the solar plan.",
        effectDescription: "Shooting is painfully slow. Adds 3 weeks to production.",
        weeksDelay: 3
      },
      {
        text: "A trade journalist spots the diesel generators. Pay them off.",
        effectDescription: "Costs $100k to kill the story.",
        cashPenalty: 100000
      }
    ]
  },
  {
    description: "Your prestige drama’s historical consultant just published an op-ed calling the script 'a catastrophic insult to actual history'.",
    options: [
      {
        text: "Hire a team of writers to urgently rewrite and reshoot key historical scenes.",
        effectDescription: "Costs $1.2M and delays production by 3 weeks.",
        cashPenalty: 1200000,
        weeksDelay: 3
      },
      {
        text: "Publicly attack the consultant's credentials.",
        effectDescription: "Messy PR war. Loses 20 buzz.",
        buzzPenalty: 20
      },
      {
        text: "Ignore it and market the film as an 'alternate history' fantasy.",
        effectDescription: "Costs $400k in pivot marketing.",
        cashPenalty: 400000
      }
    ]
  },
  {
    description: "The lead actor's personal 'spiritual advisor' has convinced them that the script's ending brings bad karma, and they refuse to film it.",
    options: [
      {
        text: "Bribe the spiritual advisor to change their reading of the karma.",
        effectDescription: "Costs $250k in 'donations'.",
        cashPenalty: 250000
      },
      {
        text: "Rewrite the ending to be overwhelmingly positive and karmically aligned.",
        effectDescription: "The ending makes no sense for the genre. Lose 25 buzz.",
        buzzPenalty: 25
      },
      {
        text: "Wait them out while lawyers draft breach of contract letters.",
        effectDescription: "Delays production by 2 weeks.",
        weeksDelay: 2
      }
    ]
  },
  {
    description: "A rival production is shooting down the street and keeps blasting an air horn to ruin your audio takes.",
    options: [
      {
        text: "Bribe the city permit office to revoke their location permit.",
        effectDescription: "Costs $300k in 'expedited processing fees'.",
        cashPenalty: 300000
      },
      {
        text: "Loop all the dialogue in post-production (ADR).",
        effectDescription: "Costs $500k and the performances feel slightly disconnected.",
        cashPenalty: 500000,
        buzzPenalty: 10
      },
      {
        text: "Wait for them to wrap their location shoot.",
        effectDescription: "Delays production by 1 week.",
        weeksDelay: 1
      }
    ]
  },
  {
    description: "The highly anticipated tie-in fast-food toys have leaked, and they look incredibly inappropriate due to a manufacturing error.",
    options: [
      {
        text: "Recall and redesign the toys globally.",
        effectDescription: "Costs a staggering $2M.",
        cashPenalty: 2000000
      },
      {
        text: "Cancel the toy line entirely.",
        effectDescription: "Breach of contract with the fast-food chain costs $800k in penalties.",
        cashPenalty: 800000
      },
      {
        text: "Let them hit the market. It's 'edgy'.",
        effectDescription: "Parents are outraged. Massive 45 buzz penalty.",
        buzzPenalty: 45
      }
    ]
  },
  {
    description: "Your foreign co-financing partner has suddenly been indicted for massive embezzlement in their home country.",
    options: [
      {
        text: "Scramble to find gap financing at predatory interest rates.",
        effectDescription: "Costs $1.5M immediately to cover the shortfall.",
        cashPenalty: 1500000
      },
      {
        text: "Halt production until legal clears the funds.",
        effectDescription: "Delays production by 4 weeks.",
        weeksDelay: 4
      },
      {
        text: "Distance the film completely. Strip their name from the credits.",
        effectDescription: "Legal fees and restructuring cost $750k.",
        cashPenalty: 750000
      }
    ]
  },
  {
    description: "An extra fell asleep in a background vehicle and woke up in the shot of your massive explosion stunt. They are fine, but traumatized.",
    options: [
      {
        text: "Settle out of court immediately with an ironclad NDA.",
        effectDescription: "Costs $800k.",
        cashPenalty: 800000
      },
      {
        text: "They go to the press. The safety investigation shuts down the set.",
        effectDescription: "Delays production by 3 weeks.",
        weeksDelay: 3
      },
      {
        text: "CGI them out of the explosion shot to hide evidence.",
        effectDescription: "VFX costs $300k, but the rumor mill still causes a 15 buzz drop.",
        cashPenalty: 300000,
        buzzPenalty: 15
      }
    ]
  },
  {
    description: "The showrunner's extremely messy public divorce is spilling onto the set, with their ex showing up to scream at them during takes.",
    options: [
      {
        text: "Hire elite private security to lock down the lot.",
        effectDescription: "Costs $150k.",
        cashPenalty: 150000
      },
      {
        text: "Give the showrunner a forced leave of absence.",
        effectDescription: "The production lacks leadership. Delays by 2 weeks.",
        weeksDelay: 2
      },
      {
        text: "Do nothing. The tabloids are eating it up.",
        effectDescription: "The crew is miserable, but the chaotic drama gives a weird 10 buzz boost.",
        buzzPenalty: -10
      }
    ]
  },
  {
    description: "A localized outbreak of an obscure stomach bug has decimated the camera department.",
    options: [
      {
        text: "Fly in an emergency replacement crew from out of state.",
        effectDescription: "Costs $400k in flights, rush rates, and per diems.",
        cashPenalty: 400000
      },
      {
        text: "Shut down the production until they recover.",
        effectDescription: "Delays production by 2 weeks.",
        weeksDelay: 2
      }
    ]
  },
  {
    description: "The method actor playing the villain went entirely too far during an improvisation and actually broke the hero's nose.",
    options: [
      {
        text: "Shut down until the hero's face heals.",
        effectDescription: "Delays production by 3 weeks.",
        weeksDelay: 3
      },
      {
        text: "Shoot around them with body doubles and fix the face in CGI later.",
        effectDescription: "Costs $900k in extensive digital face replacement.",
        cashPenalty: 900000
      },
      {
        text: "Write the broken nose into the script.",
        effectDescription: "Saves money, but the original script structure is compromised. Lose 15 buzz.",
        buzzPenalty: 15
      }
    ]
  },
  {
    description: "The 'child prodigy' actor you hired has hit a massive growth spurt midway through the shoot and no longer matches the earlier scenes.",
    options: [
      {
        text: "Use forced perspective and digital shrinking.",
        effectDescription: "Costs $600k in complex VFX.",
        cashPenalty: 600000
      },
      {
        text: "Reshoot the early scenes with the 'new' taller kid.",
        effectDescription: "Costs $1M and delays by 2 weeks.",
        cashPenalty: 1000000,
        weeksDelay: 2
      },
      {
        text: "Ignore it.",
        effectDescription: "The continuity errors become a massive meme. Lose 25 buzz.",
        buzzPenalty: 25
      }
    ]
  },
  {
    description: "Your highly touted 'cutting edge AI' script polishing software has hallucinated a completely nonsensical subplot into the shooting script, and they already filmed half of it.",
    options: [
      {
        text: "Scrap the AI scenes and reshoot with human pages.",
        effectDescription: "Costs $800k and delays by 2 weeks.",
        cashPenalty: 800000,
        weeksDelay: 2
      },
      {
        text: "Hire expensive human editors to try and make the footage make sense in post.",
        effectDescription: "Costs $400k in post-production scrambling.",
        cashPenalty: 400000
      },
      {
        text: "Leave it in. Claim it's 'surrealist commentary'.",
        effectDescription: "Audiences are deeply confused. Lose 30 buzz.",
        buzzPenalty: 30
      }
    ]
  },
  {
    description: "The studio's marketing department accidentally bought the domain name for the movie with a crucial typo, leading users to a very explicit site.",
    options: [
      {
        text: "Pay an extortionate fee to buy the typo domain from the squatters.",
        effectDescription: "Costs $750k.",
        cashPenalty: 750000
      },
      {
        text: "Completely rebrand the movie title to match a new domain.",
        effectDescription: "Costs $500k in new marketing materials and loses 20 buzz from brand confusion.",
        cashPenalty: 500000,
        buzzPenalty: 20
      },
      {
        text: "Ignore it. All press is good press?",
        effectDescription: "A family-friendly demographic is traumatized. Lose 40 buzz.",
        buzzPenalty: 40
      }
    ]
  }
,
  {
    description: "Your lead actor refuses to come out of their trailer because they discovered a secondary character has one more line than them in a pivotal scene.",
    options: [
      {
        text: "Rewrite the scene on the spot to give the lead a meaningless monologue.",
        effectDescription: "Costs $100k for the writers and the scene feels bloated, but the actor returns to set.",
        cashPenalty: 100000,
        buzzPenalty: 5
      },
      {
        text: "Tell the actor to grow up and get to the set.",
        effectDescription: "They comply, but bad-mouth the production on a popular podcast. Lose 15 buzz.",
        buzzPenalty: 15
      },
      {
        text: "Fire the secondary character and cut their line entirely.",
        effectDescription: "The narrative flow is ruined and you have to pay out their contract. Costs $250k.",
        cashPenalty: 250000,
        buzzPenalty: 10
      }
    ]
  },
  {
    description: "A prominent tech billionaire has aggressively started tweeting that your sci-fi film's science is 'fundamentally flawed' and 'insulting to physics'.",
    options: [
      {
        text: "Hire a team of expensive astrophysicists to publicly debunk the billionaire.",
        effectDescription: "Costs $300k in PR and consulting fees.",
        cashPenalty: 300000
      },
      {
        text: "Invite the billionaire to set for a cameo to stroke their ego.",
        effectDescription: "Delays production by 1 week as you accommodate their insane rider, but the negative tweets stop.",
        weeksDelay: 1
      },
      {
        text: "Ignore them entirely.",
        effectDescription: "Their tech-bro followers review-bomb your early trailers. Massive 35 buzz penalty.",
        buzzPenalty: 35
      }
    ]
  },
  {
    description: "The highly acclaimed 'intimacy coordinator' has declared that the script's romantic subplot is 'deeply toxic' and refuses to let the actors touch.",
    options: [
      {
        text: "Pay off the coordinator to look the other way.",
        effectDescription: "Costs $200k in hush money.",
        cashPenalty: 200000
      },
      {
        text: "Rewrite the romance into a platonic friendship.",
        effectDescription: "The chemistry is lost and audiences are confused. Lose 20 buzz.",
        buzzPenalty: 20
      },
      {
        text: "Fire them and hire a more 'flexible' coordinator.",
        effectDescription: "The trades catch wind of this and write a scathing exposé. Delays by 2 weeks and loses 25 buzz.",
        weeksDelay: 2,
        buzzPenalty: 25
      }
    ]
  },
  {
    description: "Your prestige period piece has been using genuine antique props, and it turns out several of them were stolen from a museum in the 1990s. The FBI is at the studio gates.",
    options: [
      {
        text: "Surrender the props and replace them with expensive modern replicas.",
        effectDescription: "Costs $800k in rush manufacturing and legal fees.",
        cashPenalty: 800000
      },
      {
        text: "Bribe the local authorities to 'lose' the search warrant.",
        effectDescription: "Costs $1.5M in under-the-table payments.",
        cashPenalty: 1500000
      },
      {
        text: "Halt production until the legal mess is sorted out.",
        effectDescription: "Delays production by an agonizing 4 weeks.",
        weeksDelay: 4
      }
    ]
  },
  {
    description: "A deepfake video of your lead actress endorsing a controversial political figure has gone viral, and sponsors are pulling out.",
    options: [
      {
        text: "Launch a massive, expensive counter-campaign proving it's a deepfake.",
        effectDescription: "Costs $600k in emergency PR.",
        cashPenalty: 600000
      },
      {
        text: "Lean into the controversy to generate free engagement.",
        effectDescription: "You gain massive but toxic exposure. The brand damage costs you 40 buzz.",
        buzzPenalty: 40
      },
      {
        text: "Halt marketing and lie low until the internet moves on.",
        effectDescription: "Delays the release schedule and momentum by 3 weeks.",
        weeksDelay: 3
      }
    ]
  },
  {
    description: "The 'method acting' villain insists on maintaining absolute silence between takes, deeply unsettling the crew and causing immense communication breakdowns.",
    options: [
      {
        text: "Hire an expensive 'actor whisperer' to mediate communication.",
        effectDescription: "Costs $150k but keeps the peace.",
        cashPenalty: 150000
      },
      {
        text: "Force the actor to attend mandatory communication seminars.",
        effectDescription: "They are furious and give a lackluster performance. Lose 15 buzz.",
        buzzPenalty: 15
      },
      {
        text: "Fire the AD who complained about it.",
        effectDescription: "Costs $50k in severance and delays production by 1 week as you find a replacement.",
        cashPenalty: 50000,
        weeksDelay: 1
      }
    ]
  },
  {
    description: "Your 'groundbreaking' CGI monster design bears a striking, accidental resemblance to a copyrighted Pokémon.",
    options: [
      {
        text: "Order a complete redesign and re-render of the monster.",
        effectDescription: "Costs $1.2M and delays post-production by 3 weeks.",
        cashPenalty: 1200000,
        weeksDelay: 3
      },
      {
        text: "Quietly settle out of court with the Japanese IP holders.",
        effectDescription: "Costs $2.5M in licensing fees.",
        cashPenalty: 2500000
      },
      {
        text: "Release it anyway and hope the lawyers don't notice.",
        effectDescription: "They notice. You are sued into oblivion and become a laughingstock. Massive 50 buzz penalty.",
        buzzPenalty: 50
      }
    ]
  },
  {
    description: "The director's overly involved mother has moved onto the set, constantly interrupting takes to give the actors unprompted notes on their posture.",
    options: [
      {
        text: "Give her an 'Associate Producer' credit and banish her to a trailer.",
        effectDescription: "Costs $100k for the vanity credit.",
        cashPenalty: 100000
      },
      {
        text: "Have security physically remove her from the lot.",
        effectDescription: "The director has a meltdown and refuses to work. Delays production by 2 weeks.",
        weeksDelay: 2
      },
      {
        text: "Let her keep directing the actors.",
        effectDescription: "The performances become incredibly stiff and weird. Lose 25 buzz.",
        buzzPenalty: 25
      }
    ]
  },
  {
    description: "An influencer hired for a brief cameo live-streamed a tour of the top-secret practical set, completely ruining the third act's twist.",
    options: [
      {
        text: "Scrap the practical set and rewrite the twist entirely.",
        effectDescription: "Costs $1M and delays production by 2 weeks.",
        cashPenalty: 1000000,
        weeksDelay: 2
      },
      {
        text: "Sue the influencer and launch a massive disinformation campaign.",
        effectDescription: "Costs $500k in legal and PR fees.",
        cashPenalty: 500000
      },
      {
        text: "Do nothing.",
        effectDescription: "The twist is spoiled for the core audience. Lose 30 buzz.",
        buzzPenalty: 30
      }
    ]
  },
  {
    description: "The studio's highly touted 'diversity and inclusion' initiative backfires spectacularly when the script is revealed to have been entirely written by four white guys named 'Matt'.",
    options: [
      {
        text: "Urgently hire a diverse writers room to completely overhaul the dialogue.",
        effectDescription: "Costs $800k and delays production by 3 weeks.",
        cashPenalty: 800000,
        weeksDelay: 3
      },
      {
        text: "Release a groveling, highly produced apology video.",
        effectDescription: "Costs $200k in PR and you still lose 20 buzz.",
        cashPenalty: 200000,
        buzzPenalty: 20
      },
      {
        text: "Double down and claim the 'Matts' represent 'diverse socioeconomic backgrounds'.",
        effectDescription: "The internet utterly destroys you. Lose 45 buzz.",
        buzzPenalty: 45
      }
    ]
  },
  {
    description: "Your big-budget action star insists on doing their own stunts, and they just spectacularly shattered their ankle jumping out of a prop helicopter.",
    options: [
      {
        text: "Halt production until they recover.",
        effectDescription: "Delays production by 6 weeks. The insurance company is furious.",
        weeksDelay: 6
      },
      {
        text: "Rewrite the rest of the movie so the hero is inexplicably in a wheelchair.",
        effectDescription: "The action scenes are ruined. Lose 30 buzz.",
        buzzPenalty: 30
      },
      {
        text: "Hire a body double and use extremely expensive face-replacement CGI.",
        effectDescription: "Costs $2M to fix it in post.",
        cashPenalty: 2000000
      }
    ]
  },
  {
    description: "The highly anticipated streaming release is derailed because the platform's servers crashed globally during the premiere due to a botched code update.",
    options: [
      {
        text: "Demand compensation from the streaming platform and relaunch with massive fanfare.",
        effectDescription: "Costs $500k in renewed marketing, but delays the drop by 1 week.",
        cashPenalty: 500000,
        weeksDelay: 1
      },
      {
        text: "Pivot to a hastily arranged, limited theatrical release.",
        effectDescription: "Costs $1.5M in sudden distribution fees.",
        cashPenalty: 1500000
      },
      {
        text: "Let the failed premiere stand. Blame 'unprecedented demand'.",
        effectDescription: "The audience feels cheated and the momentum dies. Lose 35 buzz.",
        buzzPenalty: 35
      }
    ]
  },
  {
    description: "A bizarre cult has convinced themselves that your film contains coded prophecies and they have set up a massive, disruptive encampment outside the studio gates.",
    options: [
      {
        text: "Hire private military contractors to clear the encampment.",
        effectDescription: "Costs $400k and looks terrible in the press. Lose 15 buzz.",
        cashPenalty: 400000,
        buzzPenalty: 15
      },
      {
        text: "Embrace them. Sell them exclusive 'prophecy' merchandise.",
        effectDescription: "Costs $100k to produce the merch, but the bizarre viral marketing offsets the buzz drop.",
        cashPenalty: 100000
      },
      {
        text: "Halt production until they lose interest and leave.",
        effectDescription: "Delays production by 3 weeks.",
        weeksDelay: 3
      }
    ]
  },
  {
    description: "The studio executives are demanding that you digitally insert a newly acquired, completely unrelated IP character into the background of a key emotional scene for 'synergy'.",
    options: [
      {
        text: "Comply and ruin the scene.",
        effectDescription: "Costs $300k in forced VFX and ruins the emotional tone. Lose 25 buzz.",
        cashPenalty: 300000,
        buzzPenalty: 25
      },
      {
        text: "Refuse and fight the executives.",
        effectDescription: "The studio retaliates by slashing your marketing budget. Lose 20 buzz.",
        buzzPenalty: 20
      },
      {
        text: "Compromise and hide the character in a blink-and-you-miss-it easter egg.",
        effectDescription: "Costs $150k in subtle VFX work, but avoids the buzz penalty.",
        cashPenalty: 150000
      }
    ]
  },
  {
    description: "Your composer, suffering from extreme burnout, has delivered a final score that is just 90 minutes of an industrial washing machine recorded on an iPhone.",
    options: [
      {
        text: "Urgently hire a competent ghostwriter to replace the score.",
        effectDescription: "Costs $800k and delays the final mix by 2 weeks.",
        cashPenalty: 800000,
        weeksDelay: 2
      },
      {
        text: "Use generic, royalty-free stock music.",
        effectDescription: "The movie sounds cheap. Lose 20 buzz.",
        buzzPenalty: 20
      },
      {
        text: "Release it. Claim it's a 'bold, avant-garde sonic soundscape'.",
        effectDescription: "Audiences get headaches and walk out. Massive 40 buzz penalty.",
        buzzPenalty: 40
      }
    ]
  }

, {
    description: "Your director's old, highly offensive tweets from 2011 have just resurfaced, and the internet is demanding a boycott.",
    options: [
      {
        text: "Issue a generic notes-app apology and hope it blows over.",
        effectDescription: "It doesn't blow over. Lose 30 buzz.",
        buzzPenalty: 30
      },
      {
        text: "Fire the director immediately.",
        effectDescription: "Halts production for 4 weeks and costs $2M to replace them.",
        weeksDelay: 4,
        cashPenalty: 2000000
      },
      {
        text: "Hire an elite crisis PR firm to scrub the internet and spin the narrative.",
        effectDescription: "Costs $750k but minimizes the damage.",
        cashPenalty: 750000,
        buzzPenalty: 5
      }
    ]
  },
  {
    description: "The lead actress has started a controversial lifestyle wellness brand on set, selling unapproved 'healing crystals' to the crew.",
    options: [
      {
        text: "Let her do it to keep her happy.",
        effectDescription: "Several crew members get mysterious rashes. Delays production by 1 week.",
        weeksDelay: 1
      },
      {
        text: "Shut down the operation.",
        effectDescription: "She throws a fit and refuses to do promotional interviews. Lose 15 buzz.",
        buzzPenalty: 15
      },
      {
        text: "Invest in the brand and integrate it into the movie as product placement.",
        effectDescription: "Costs $250k. The fans hate the blatant advertising, losing 10 buzz.",
        cashPenalty: 250000,
        buzzPenalty: 10
      }
    ]
  },
  {
    description: "A rogue extra secretly recorded the highly-anticipated finale and leaked it on TikTok.",
    options: [
      {
        text: "Ignore it. Hope nobody sees it.",
        effectDescription: "It goes viral. Massive 35 buzz penalty.",
        buzzPenalty: 35
      },
      {
        text: "Rewrite and reshoot the finale.",
        effectDescription: "Costs $1.5M and delays the project by 3 weeks.",
        cashPenalty: 1500000,
        weeksDelay: 3
      },
      {
        text: "Leak a fake, even worse finale to confuse the internet.",
        effectDescription: "Costs $100k for the quick edit. The confusion works, mostly.",
        cashPenalty: 100000,
        buzzPenalty: 10
      }
    ]
  },
  {
    description: "The primary catering company was shut down by the health department after serving 'questionable' craft services.",
    options: [
      {
        text: "Order pizza for the rest of the shoot.",
        effectDescription: "Morale plummets, resulting in lazy performances. Lose 10 buzz.",
        buzzPenalty: 10
      },
      {
        text: "Hire a premium private chef.",
        effectDescription: "Costs an outrageous $300k, but keeps the A-listers thrilled.",
        cashPenalty: 300000
      },
      {
        text: "Force the crew to forage locally.",
        effectDescription: "Several key grips get food poisoning. Delays production by 2 weeks.",
        weeksDelay: 2
      }
    ]
  },
  {
    description: "The studio's highly expensive 'proprietary AI script doctor' has randomly rewritten the entire third act into a musical.",
    options: [
      {
        text: "Follow the AI's script.",
        effectDescription: "The sudden musical shift alienates the core audience. Lose 25 buzz.",
        buzzPenalty: 25
      },
      {
        text: "Hire human writers to fix the mess.",
        effectDescription: "Costs $400k and delays the shoot by 2 weeks.",
        cashPenalty: 400000,
        weeksDelay: 2
      },
      {
        text: "Ignore the script completely and improvise.",
        effectDescription: "Saves money, but the disjointed ending loses 15 buzz.",
        buzzPenalty: 15
      }
    ]
  },
  {
    description: "Your A-list actor insists on performing their own highly dangerous stunts despite having zero training.",
    options: [
      {
        text: "Allow it.",
        effectDescription: "They break their leg immediately. Production halts for 5 weeks.",
        weeksDelay: 5
      },
      {
        text: "Use a stunt double and use deepfake face replacement.",
        effectDescription: "Costs $500k for the VFX.",
        cashPenalty: 500000
      },
      {
        text: "Refuse and threaten a breach of contract.",
        effectDescription: "They comply, but badmouth the studio to the press. Lose 20 buzz.",
        buzzPenalty: 20
      }
    ]
  },
  {
    description: "A massive rights dispute has suddenly erupted over the IP halfway through filming.",
    options: [
      {
        text: "Settle out of court.",
        effectDescription: "Costs a staggering $3M to make the problem disappear.",
        cashPenalty: 3000000
      },
      {
        text: "Change the character names and designs just enough to avoid a lawsuit.",
        effectDescription: "Costs $800k in reshoots and the blatant knock-off feel loses 25 buzz.",
        cashPenalty: 800000,
        buzzPenalty: 25
      },
      {
        text: "Pause production and fight it in court.",
        effectDescription: "Legal fees are $1M and the delay is 6 weeks.",
        cashPenalty: 1000000,
        weeksDelay: 6
      }
    ]
  },
  {
    description: "The film's 'edgy' marketing campaign accidentally triggered a real-life international diplomatic incident.",
    options: [
      {
        text: "Lean into the controversy.",
        effectDescription: "Banned in several countries, massive 40 buzz penalty.",
        buzzPenalty: 40
      },
      {
        text: "Issue a groveling public apology and recall all materials.",
        effectDescription: "Costs $1.2M to scrap and restart the campaign.",
        cashPenalty: 1200000
      },
      {
        text: "Blame it entirely on a rogue intern.",
        effectDescription: "The intern sues for $500k and the internet hates you. Lose 20 buzz.",
        cashPenalty: 500000,
        buzzPenalty: 20
      }
    ]
  },
  {
    description: "The director of photography has fallen madly in love with the lead actor and is refusing to light anyone else properly.",
    options: [
      {
        text: "Fire the DP.",
        effectDescription: "Delays production by 2 weeks and costs $200k to replace them.",
        weeksDelay: 2,
        cashPenalty: 200000
      },
      {
        text: "Fix the lighting in post-production.",
        effectDescription: "Costs $600k in tedious VFX color grading.",
        cashPenalty: 600000
      },
      {
        text: "Leave it as is. Claim it's a 'subjective visual narrative'.",
        effectDescription: "Critics mock the terrible lighting. Lose 15 buzz.",
        buzzPenalty: 15
      }
    ]
  },
  {
    description: "A prominent religious group is protesting outside the studio gates, claiming the movie is blasphemous.",
    options: [
      {
        text: "Ignore them.",
        effectDescription: "The protests gain traction on national news. Lose 20 buzz.",
        buzzPenalty: 20
      },
      {
        text: "Hire extra security to clear the gates.",
        effectDescription: "Costs $150k but keeps the production on schedule.",
        cashPenalty: 150000
      },
      {
        text: "Use the protests as free marketing.",
        effectDescription: "Gain massive notoriety, but alienate mainstream demographics. Lose 10 buzz.",
        buzzPenalty: 10
      }
    ]
  },
  {
    description: "The child star has hit an unexpected growth spurt over the weekend and no longer matches continuity.",
    options: [
      {
        text: "Digitally shrink them in post-production.",
        effectDescription: "Costs $1.5M for terrifying 'uncanny valley' CGI.",
        cashPenalty: 1500000
      },
      {
        text: "Reshoot their previous scenes.",
        effectDescription: "Delays production by 3 weeks and costs $800k.",
        weeksDelay: 3,
        cashPenalty: 800000
      },
      {
        text: "Ignore it and hope the audience is dumb.",
        effectDescription: "They aren't. Memes of the giant child flood the internet. Lose 25 buzz.",
        buzzPenalty: 25
      }
    ]
  },
  {
    description: "The animal wrangler lost the highly trained panther, and it's currently roaming the soundstages.",
    options: [
      {
        text: "Shut down the lot and call animal control.",
        effectDescription: "Production halts for 1 week.",
        weeksDelay: 1
      },
      {
        text: "Hire elite private hunters to capture it quietly.",
        effectDescription: "Costs $250k but avoids a media panic.",
        cashPenalty: 250000
      },
      {
        text: "Rewrite the script to include more scenes of actors looking nervously at the ceiling.",
        effectDescription: "The tension is real, but the confusing plot loses 15 buzz.",
        buzzPenalty: 15
      }
    ]
  },
  {
    description: "A rival studio has just fast-tracked an identical movie, 'Twin Films' style, and they release next month.",
    options: [
      {
        text: "Accelerate post-production to beat them to theaters.",
        effectDescription: "Costs $2M in overtime and corners are cut. Lose 10 buzz.",
        cashPenalty: 2000000,
        buzzPenalty: 10
      },
      {
        text: "Delay release by a year to let theirs bomb first.",
        effectDescription: "Massive 8-week delay penalty to re-market later.",
        weeksDelay: 8
      },
      {
        text: "Start a smear campaign against their movie.",
        effectDescription: "Costs $500k in 'anonymous' PR hits, but risks backlash. Lose 15 buzz.",
        cashPenalty: 500000,
        buzzPenalty: 15
      }
    ]
  },
  {
    description: "The lead actor was just arrested for a highly embarrassing, albeit non-violent, crime involving a stolen golf cart and a flamingo.",
    options: [
      {
        text: "Post bail and hire a fixer.",
        effectDescription: "Costs $400k to keep the police report quiet.",
        cashPenalty: 400000
      },
      {
        text: "Fire them and recast.",
        effectDescription: "Delays production by 4 weeks and costs $1M.",
        weeksDelay: 4,
        cashPenalty: 1000000
      },
      {
        text: "Lean into the bad boy image.",
        effectDescription: "The public finds it hilarious, but prestige critics loathe it. Lose 10 buzz.",
        buzzPenalty: 10
      }
    ]
  },
  {
    description: "The entire production server has been hit by ransomware, encrypting all dailies and VFX assets.",
    options: [
      {
        text: "Pay the ransom via cryptocurrency.",
        effectDescription: "Costs $1.5M in untraceable funds.",
        cashPenalty: 1500000
      },
      {
        text: "Refuse to pay and attempt to restore from a month-old backup.",
        effectDescription: "Delays production by 4 weeks to recreate lost work.",
        weeksDelay: 4
      },
      {
        text: "Release the corrupted, glitchy footage as an 'NFT Art Film'.",
        effectDescription: "Saves money, but the audience is furious. Lose 45 buzz.",
        buzzPenalty: 45
      }
    ]
  },
  {
    description: "The A-list lead actor insists that their pet iguana must be written into every scene as a crucial supporting character.",
    options: [
      {
        text: "Hire writers to rewrite the script and add a tiny custom trailer for the iguana.",
        effectDescription: "Costs $120k for the rewrites and iguana accommodations.",
        cashPenalty: 120000
      },
      {
        text: "Flatly refuse.",
        effectDescription: "The actor sulks, tanking their performance. Lose 15 buzz.",
        buzzPenalty: 15
      },
      {
        text: "CGI the iguana out in post.",
        effectDescription: "Costs $400k in tedious VFX and delays the edit by 1 week.",
        cashPenalty: 400000,
        weeksDelay: 1
      }
    ]
  },
  {
    description: "Your 'visionary' director has mandated that everyone on set communicate solely in archaic Latin to 'maintain the atmosphere'.",
    options: [
      {
        text: "Hire translators for every department head.",
        effectDescription: "Costs $250k in rush fees.",
        cashPenalty: 250000
      },
      {
        text: "Force them to speak English.",
        effectDescription: "The director has a breakdown, halting production for 2 weeks.",
        weeksDelay: 2
      },
      {
        text: "Let the chaos unfold.",
        effectDescription: "No one knows what is going on. Continuity errors abound. Lose 20 buzz.",
        buzzPenalty: 20
      }
    ]
  },
  {
    description: "A crucial action sequence was accidentally filmed with the lens cap on, and the explosive set piece was completely destroyed.",
    options: [
      {
        text: "Rebuild the set and reshoot the entire sequence.",
        effectDescription: "Costs a brutal $1.8M and adds 3 weeks to production.",
        cashPenalty: 1800000,
        weeksDelay: 3
      },
      {
        text: "Replace the scene with an incomprehensible CGI blur.",
        effectDescription: "Costs $500k, but looks terrible. Lose 25 buzz.",
        cashPenalty: 500000,
        buzzPenalty: 25
      },
      {
        text: "Write it off as an off-screen explosion.",
        effectDescription: "Saves money, but the audience feels cheated. Lose 35 buzz.",
        buzzPenalty: 35
      }
    ]
  },
  {
    description: "The film's 'breakout star' just dropped a deeply embarrassing, self-produced rap album that is getting roasted globally.",
    options: [
      {
        text: "Launch a PR campaign to frame it as a 'satirical performance art piece'.",
        effectDescription: "Costs $300k to spin the narrative.",
        cashPenalty: 300000
      },
      {
        text: "Ignore it and hope the news cycle moves on.",
        effectDescription: "It does not. The cringe factor drops your project's buzz by 25.",
        buzzPenalty: 25
      },
      {
        text: "Pay the streaming platforms to bury the album.",
        effectDescription: "Costs $800k in backroom deals, but protects their image.",
        cashPenalty: 800000
      }
    ]
  },
  {
    description: "A rogue marketing agency accidentally promoted the film as a heartwarming family comedy instead of a terrifying psychological thriller.",
    options: [
      {
        text: "Urgently recall and replace all marketing materials globally.",
        effectDescription: "Costs an eye-watering $1.5M.",
        cashPenalty: 1500000
      },
      {
        text: "Recut the film to actually make it a family comedy.",
        effectDescription: "Costs $500k in editing and ADR, but creates an incomprehensible mess. Lose 40 buzz.",
        cashPenalty: 500000,
        buzzPenalty: 40
      },
      {
        text: "Lean into it. Let the families show up.",
        effectDescription: "Massive traumatized walkouts generate infamy, but severe brand damage. Lose 30 buzz.",
        buzzPenalty: 30
      }
    ]
  },
  {
    description: "The lead actress demands that the script be restructured so her character never loses an argument, fundamentally breaking the narrative arc.",
    options: [
      {
        text: "Hire expensive script doctors to make it somewhat coherent.",
        effectDescription: "Costs $250k and delays production by 1 week.",
        cashPenalty: 250000,
        weeksDelay: 1
      },
      {
        text: "Give in and shoot the terrible new pages.",
        effectDescription: "The character becomes insufferable. Lose 20 buzz.",
        buzzPenalty: 20
      },
      {
        text: "Call her bluff and threaten breach of contract.",
        effectDescription: "She complies, but her performance is completely phoned-in. Lose 15 buzz.",
        buzzPenalty: 15
      }
    ]
  },
  {
    description: "An eccentric billionaire investor demands a 5-minute cameo where he defeats the main villain single-handedly, or he pulls his funding.",
    options: [
      {
        text: "Shoot the scene exactly as he wants it.",
        effectDescription: "The scene is embarrassingly bad and ruins the climax. Lose 35 buzz.",
        buzzPenalty: 35
      },
      {
        text: "Shoot it, then pay a massive legal penalty to cut him in post.",
        effectDescription: "Costs $1.2M in contractual fines.",
        cashPenalty: 1200000
      },
      {
        text: "Refuse and scramble for bridge financing.",
        effectDescription: "Costs $500k in high-interest loans and delays production by 3 weeks.",
        cashPenalty: 500000,
        weeksDelay: 3
      }
    ]
  },
  {
    description: "The crucial period-accurate costumes were 'accidentally' destroyed by a disgruntled former wardrobe assistant.",
    options: [
      {
        text: "Rush order historically accurate replacements from overseas.",
        effectDescription: "Costs $600k and delays the shoot by 2 weeks.",
        cashPenalty: 600000,
        weeksDelay: 2
      },
      {
        text: "Raid a local theater company's generic costume rack.",
        effectDescription: "The movie looks unbelievably cheap. Lose 25 buzz.",
        buzzPenalty: 25
      },
      {
        text: "Shoot the scenes entirely in extreme close-ups to hide the lack of costumes.",
        effectDescription: "Saves money, but the visual style is claustrophobic and bizarre. Lose 15 buzz.",
        buzzPenalty: 15
      }
    ]
  },
  {
    description: "A prominent trade publication is threatening to publish an exposé on the 'toxic, chaotic' environment on your set.",
    options: [
      {
        text: "Pay the publication off with 'exclusive advertising commitments'.",
        effectDescription: "Costs $400k in forced ad buys.",
        cashPenalty: 400000
      },
      {
        text: "Launch a pre-emptive PR strike painting the set as 'passionate and intense'.",
        effectDescription: "Costs $150k but mitigates the damage.",
        cashPenalty: 150000
      },
      {
        text: "Ignore it. Let them publish.",
        effectDescription: "The exposé goes viral. Lose 30 buzz.",
        buzzPenalty: 30
      }
    ]
  },
  {
    description: "The 'method' actor playing the gritty detective refuses to shower for authenticity, and the crew is threatening to walk out due to the smell.",
    options: [
      {
        text: "Hire a dedicated hazmat cleaning crew to follow them around.",
        effectDescription: "Costs $100k in specialized sanitation.",
        cashPenalty: 100000
      },
      {
        text: "Shut down production until they bathe.",
        effectDescription: "Delays production by 1 week.",
        weeksDelay: 1
      },
      {
        text: "Force the crew to work through it.",
        effectDescription: "Morale completely collapses, leading to terrible work. Lose 20 buzz.",
        buzzPenalty: 20
      }
    ]
  },
  {
    description: "The studio mandates the sudden inclusion of a 'hilarious' CGI sidekick to appeal to international toy markets.",
    options: [
      {
        text: "Hire top-tier animators to make the sidekick somewhat tolerable.",
        effectDescription: "Costs $900k and delays post-production by 2 weeks.",
        cashPenalty: 900000,
        weeksDelay: 2
      },
      {
        text: "Use a cheap, rushed animation studio.",
        effectDescription: "Costs $200k, but the sidekick is nightmare fuel. Lose 35 buzz.",
        cashPenalty: 200000,
        buzzPenalty: 35
      },
      {
        text: "Refuse the mandate.",
        effectDescription: "The studio retaliates by pulling P&A (marketing) funds. Lose 25 buzz.",
        buzzPenalty: 25
      }
    ]
  },
  {
    description: "An unexpected meteor shower completely ruined a week's worth of crucial night shoots by lighting up the sky.",
    options: [
      {
        text: "Wait it out and reshoot the scenes.",
        effectDescription: "Delays production by 2 weeks.",
        weeksDelay: 2
      },
      {
        text: "Digitally remove the meteors in post.",
        effectDescription: "Costs $300k in VFX cleanup.",
        cashPenalty: 300000
      },
      {
        text: "Claim the meteors are part of the story now.",
        effectDescription: "The script makes no sense anymore. Lose 20 buzz.",
        buzzPenalty: 20
      }
    ]
  },
  {
    description: "The lead actor has secretly been wearing a high-tech earpiece to be fed their lines, and the signal just got crossed with a local sports radio station during a dramatic monologue.",
    options: [
      {
        text: "Shut down the set and force them to actually learn their lines.",
        effectDescription: "Delays production by 2 weeks.",
        weeksDelay: 2
      },
      {
        text: "Hire an elite audio team to isolate and remove the sports commentary in post.",
        effectDescription: "Costs $400k in complex sound design.",
        cashPenalty: 400000
      },
      {
        text: "Keep the take. Claim it's a 'bold, postmodern audio choice'.",
        effectDescription: "Critics are bewildered. Lose 25 buzz.",
        buzzPenalty: 25
      }
    ]
  },
  {
    description: "Your 'cutting-edge' practical effects robot went berserk and smashed through the catering tent.",
    options: [
      {
        text: "Repair the robot and rebuild the tent.",
        effectDescription: "Costs $250k and delays the shoot by 1 week.",
        cashPenalty: 250000,
        weeksDelay: 1
      },
      {
        text: "Scrap the robot and replace it with CGI.",
        effectDescription: "Costs $800k in VFX and loses the 'practical' marketing angle. Lose 10 buzz.",
        cashPenalty: 800000,
        buzzPenalty: 10
      },
      {
        text: "Leak the footage to TikTok.",
        effectDescription: "Costs nothing. Generates a weird 10 buzz boost, but delays the shoot by 1 week.",
        weeksDelay: 1,
        buzzPenalty: -10
      }
    ]
  },
  {
    description: "The director vanished into the jungle to 'find the true ending' and hasn't been seen in four days.",
    options: [
      {
        text: "Hire a private search and rescue team.",
        effectDescription: "Costs $150k and delays production by 1 week.",
        cashPenalty: 150000,
        weeksDelay: 1
      },
      {
        text: "Promote the Assistant Director to finish the film.",
        effectDescription: "Saves money, but the movie loses its distinct voice. Lose 20 buzz.",
        buzzPenalty: 20
      },
      {
        text: "Wait for them to return.",
        effectDescription: "They return 3 weeks later with a terrible new script. 3 week delay, lose 15 buzz.",
        weeksDelay: 3,
        buzzPenalty: 15
      }
    ]
  }
];

export function checkAndTriggerCrisis(project: Project): ActiveCrisis | undefined {
  if (project.status !== 'production') return undefined;

  if (Math.random() < 0.05) {
    const crisisTemplate = pick(CRISIS_POOLS);

    // Calculate severity dynamically based on worst-case penalties
    let maxDelay = 0;
    let maxCash = 0;
    let maxBuzz = 0;

    for (const option of crisisTemplate.options) {
        const opt = option as import('../types').CrisisOption;
        if (opt.weeksDelay && opt.weeksDelay > maxDelay) maxDelay = opt.weeksDelay;
        if (opt.cashPenalty && opt.cashPenalty > maxCash) maxCash = opt.cashPenalty;
        if (opt.buzzPenalty && opt.buzzPenalty > maxBuzz) maxBuzz = opt.buzzPenalty;
    }

    let severity: 'low' | 'medium' | 'high' | 'catastrophic' = 'low';
    if (maxCash >= 2_000_000 || maxDelay >= 5 || maxBuzz >= 40) {
        severity = 'catastrophic';
    } else if (maxCash >= 800_000 || maxDelay >= 3 || maxBuzz >= 25) {
        severity = 'high';
    } else if (maxCash >= 300_000 || maxDelay >= 1 || maxBuzz >= 10) {
        severity = 'medium';
    }

    return {
      description: crisisTemplate.description,
      options: [...crisisTemplate.options] as import('../types').CrisisOption[], // Clone options
      resolved: false,
      severity
    };
  }

  return undefined;
}

export function resolveCrisis(state: GameState, projectId: string, optionIndex: number): GameState {
  const projectIndex = state.studio.internal.projects.findIndex(p => p.id === projectId);
  if (projectIndex === -1) return state;

  const project = state.studio.internal.projects[projectIndex];
  if (!project.activeCrisis || project.activeCrisis.resolved) return state;

  const option = project.activeCrisis.options[optionIndex];
  if (!option) return state;

  // Apply penalties
  const cashChange = option.cashPenalty ? -option.cashPenalty : 0;

  const updatedProject = { ...project };

  if (option.weeksDelay) {
    updatedProject.productionWeeks += option.weeksDelay;
  }

  if (option.buzzPenalty) {
    updatedProject.buzz = Math.max(0, updatedProject.buzz - option.buzzPenalty);
  }

  // Mark resolved
  updatedProject.activeCrisis = {
    ...project.activeCrisis,
    resolved: true
  };

  const newProjects = [...state.studio.internal.projects];
  newProjects[projectIndex] = updatedProject;

  return {
    ...state,
    studio: {
      ...state.studio,
      internal: {
        ...state.studio.internal,
        projects: newProjects
      }
    },
    cash: state.cash + cashChange, // Apply cash change (penalty means negative)
    industry: {
      ...state.industry,
      headlines: [
        ...(state.industry.headlines || []),
        { id: `crisis-${crypto.randomUUID()}`, text: `Crisis resolved for "${project.title}": ${option.text}`, week: state.week, category: 'general' as const }
      ]
    }
  } as GameState;
}
