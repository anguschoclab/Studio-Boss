import { pick } from '../utils';

const GENRE_PATTERNS: Record<string, string[][]> = {
  Action: [
    ['The', 'ADJECTIVE', 'NOUN'],
    ['NOUN', 'of', 'NOUN'],
    ['Operation', 'NOUN'],
    ['VERB', 'Hard'],
    ['ADJECTIVE', 'NOUN', 'Protocol']
  ],
  Comedy: [
    ['The', 'ADJECTIVE', 'NOUN'],
    ['My', 'ADJECTIVE', 'NOUN'],
    ['Don\'t', 'VERB', 'the', 'NOUN'],
    ['NOUN', 'Trouble'],
    ['ADJECTIVE', 'Business']
  ],
  Drama: [
    ['The', 'NOUN', 'of', 'NAME'],
    ['A', 'ADJECTIVE', 'NOUN'],
    ['The', 'NOUN'],
    ['NAME', 'and', 'NAME'],
    ['Echoes', 'of', 'NOUN']
  ],
  Horror: [
    ['The', 'NOUN', 'in the', 'PLACE'],
    ['ADJECTIVE', 'NOUN'],
    ['It', 'VERBS', 'at', 'TIME'],
    ['The', 'PLACE'],
    ['Curse of the', 'NOUN']
  ],
  'Sci-Fi': [
    ['Project', 'NOUN'],
    ['The', 'PLACE', 'Chronicles'],
    ['Beyond the', 'PLACE'],
    ['ADJECTIVE', 'Frontier'],
    ['Star', 'NOUN']
  ],
  Thriller: [
    ['The', 'ADJECTIVE', 'NOUN'],
    ['No', 'NOUN', 'Left'],
    ['Kill', 'the', 'NOUN'],
    ['The', 'NAME', 'Identity'],
    ['Deadly', 'NOUN']
  ],
  Romance: [
    ['Love in', 'PLACE'],
    ['The', 'ADJECTIVE', 'Heart'],
    ['A', 'NOUN', 'to Remember'],
    ['Meet me at', 'TIME'],
    ['NAME', 'and', 'NAME']
  ],
  Animation: [
    ['The', 'ADJECTIVE', 'ANIMAL'],
    ['ANIMAL', 'Tales'],
    ['The Great', 'NOUN', 'Adventure'],
    ['Adventures of', 'NAME'],
    ['Magical', 'PLACE']
  ],
  Documentary: [
    ['The Truth About', 'NOUN'],
    ['Inside the', 'PLACE'],
    ['The', 'NOUN', 'Paradox'],
    ['Rise of the', 'NOUN'],
    ['Uncovering', 'NAME']
  ],
  Fantasy: [
    ['The', 'NOUN', 'of', 'PLACE'],
    ['Realm of', 'NOUN'],
    ['The', 'ADJECTIVE', 'King'],
    ['Legends of', 'PLACE'],
    ['The Magic', 'NOUN']
  ],
  Crime: [
    ['The', 'PLACE', 'Murders'],
    ['Blood on the', 'NOUN'],
    ['The', 'NAME', 'Syndicate'],
    ['Heist in', 'PLACE'],
    ['To Catch a', 'NOUN']
  ],
  Musical: [
    ['Singing in the', 'PLACE'],
    ['The', 'ADJECTIVE', 'Melody'],
    ['Rhythm of', 'PLACE'],
    ['Dance', 'with', 'NAME'],
    ['Song of the', 'NOUN']
  ]
};

const WORDS: Record<string, string[]> = {
  ADJECTIVE: ['Dark', 'Silent', 'Golden', 'Broken', 'Hidden', 'Last', 'Lost', 'Secret', 'Lethal', 'Final', 'Red', 'Black', 'Wild', 'Crazy', 'Funny', 'Beautiful', 'Brave', 'Fierce'],
  NOUN: ['Shadow', 'Mirror', 'Ghost', 'Knight', 'City', 'Storm', 'Weapon', 'Target', 'Agent', 'Game', 'House', 'Night', 'Day', 'Star', 'Dream', 'Heart', 'World', 'Man', 'Woman', 'Boy', 'Girl'],
  VERB: ['Die', 'Run', 'Shoot', 'Hide', 'Seek', 'Find', 'Kill', 'Save', 'Love', 'Kiss', 'Dance', 'Sing', 'Fly', 'Fall'],
  VERBS: ['Waits', 'Hides', 'Kills', 'Watches', 'Screams', 'Comes', 'Walks'],
  PLACE: ['Darkness', 'City', 'Woods', 'Space', 'Future', 'Mars', 'London', 'Paris', 'New York', 'Moon', 'Sun', 'Island', 'Village'],
  NAME: ['John', 'Mary', 'Bourne', 'Bond', 'Ripley', 'Neo', 'Trinity', 'Luke', 'Leia', 'Harry', 'Hermione', 'Gatsby', 'Holmes'],
  TIME: ['Midnight', 'Dawn', 'Dusk', 'Night', 'Tomorrow', 'Yesterday'],
  ANIMAL: ['Bear', 'Dog', 'Cat', 'Lion', 'Tiger', 'Dragon', 'Unicorn', 'Dinosaur']
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
