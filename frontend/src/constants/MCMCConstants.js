export const options = {
    seed: 18,
    num_chains: 1,
    iterations_per_chain: 50000,
    burnin: 5000,
  },
  chainOptions = [
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
  ],
  limits = {
    seed: { min: 0, max: 100000 },
    iterations_per_chain: { min: 0, max: 100000 },
    burnin: { min: 5, max: 100000 },
  };
