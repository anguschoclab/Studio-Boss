import { setDeterministicSeed, rand } from "../engine/utils";

setDeterministicSeed(777);
console.log("Rand 1:", rand());
console.log("Rand 2:", rand());
console.log("Rand 3:", rand());
console.log("Rand 4:", rand());
