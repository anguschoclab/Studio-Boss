function test() {
  const state = {
    market: {
      buyers: []
    }
  };

  for(let i=0; i<100; i++) {
    state.market.buyers.push({
      archetype: i % 2 === 0 ? 'streamer' : 'network',
      cash: 1000
    });
  }

  const start1 = performance.now();
  for(let j=0; j<10000; j++) {
    const platforms = state.market.buyers.filter(
      (b) => b.archetype === "streamer"
    );
    const platformTotalCash = platforms.reduce((sum, p) => sum + (Number(p.cash) || 0), 0);
  }
  const end1 = performance.now();
  console.log(`Filter + Reduce: ${end1 - start1}ms`);

  const start2 = performance.now();
  for(let j=0; j<10000; j++) {
    let platformTotalCash = 0;
    const buyers = state.market.buyers;
    const platforms = []; // Still need platforms for later?
    for (let i = 0; i < buyers.length; i++) {
        if (buyers[i].archetype === "streamer") {
            platforms.push(buyers[i]);
            platformTotalCash += (Number(buyers[i].cash) || 0);
        }
    }
  }
  const end2 = performance.now();
  console.log(`Direct loop: ${end2 - start2}ms`);
}
test();
