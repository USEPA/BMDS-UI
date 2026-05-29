export const options = {
    seed: 18,
    num_chains: 1,
    iterations_per_chain: 10000,
    burnin: 1000,
  },
  chainOptions = [
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
  ],
  limits = {
    seed: { min: 0, max: 999999 },
    iterations_per_chain: { min: 10000, max: 999999 },
    burnin: { min: 1000, max: 999999 },
  };
