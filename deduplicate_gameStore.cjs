const fs = require('fs');
const file = 'src/test/store/gameStore.test.ts';
let code = fs.readFileSync(file, 'utf8');

const target = `  it("signs a contract if sufficient funds", () => {
    useGameStore.getState().newGame("My Studio", "major");

    // Setup state for contract signing
    const state = useGameStore.getState().gameState!;
    state.cash = 1000;
    state.contracts = [];
    state.talentPool = [
      { id: "t1", name: "Star", type: "actor", prestige: 85, draw: 80, fee: 500, accessLevel: "outsider", temperament: "normal" }
    ];
    useGameStore.setState({ gameState: state });

    useGameStore.getState().signContract("t1", "p1");

    const newState = useGameStore.getState().gameState!;
    expect(newState.cash).toBe(500);
    expect(newState.contracts).toHaveLength(1);
    expect(newState.contracts[0].talentId).toBe("t1");
    expect(newState.contracts[0].backendPercent).toBe(10);
  });

  it("fails to sign contract if insufficient funds", () => {
    useGameStore.getState().newGame("My Studio", "major");

    // Setup state for contract signing
    const state = useGameStore.getState().gameState!;
    state.cash = 100; // Not enough for fee of 500
    state.contracts = [];
    state.talentPool = [
      { id: "t1", name: "Star", type: "actor", prestige: 85, draw: 80, fee: 500, accessLevel: "outsider", temperament: "normal" }
    ];
    useGameStore.setState({ gameState: state });

    useGameStore.getState().signContract("t1", "p1");

    const newState = useGameStore.getState().gameState!;
    expect(newState.cash).toBe(100);
    expect(newState.contracts).toHaveLength(0);
  });`;

const replace = `  const setupSignContractState = (initialCash: number) => {
    useGameStore.getState().newGame("My Studio", "major");
    const state = useGameStore.getState().gameState!;
    state.cash = initialCash;
    state.contracts = [];
    state.talentPool = [
      { id: "t1", name: "Star", type: "actor", prestige: 85, draw: 80, fee: 500, accessLevel: "outsider", temperament: "normal" }
    ];
    useGameStore.setState({ gameState: state });
  };

  it("signs a contract if sufficient funds", () => {
    setupSignContractState(1000);

    useGameStore.getState().signContract("t1", "p1");

    const newState = useGameStore.getState().gameState!;
    expect(newState.cash).toBe(500);
    expect(newState.contracts).toHaveLength(1);
    expect(newState.contracts[0].talentId).toBe("t1");
    expect(newState.contracts[0].backendPercent).toBe(10);
  });

  it("fails to sign contract if insufficient funds", () => {
    setupSignContractState(100); // Not enough for fee of 500

    useGameStore.getState().signContract("t1", "p1");

    const newState = useGameStore.getState().gameState!;
    expect(newState.cash).toBe(100);
    expect(newState.contracts).toHaveLength(0);
  });`;

code = code.replace(target, replace);
fs.writeFileSync(file, code);
