# base-unit-action-clean-pollution

The `CleanPollution` unit action: a worker cleans the `Pollution` off its tile (civ-clone/web-renderer#32).

- `CleanPollution`: `new CleanPollution(from, to, unit, ruleRegistry, tileImprovementRegistry, turn)`. A
  `DelayedAction`: the unit is `CleaningPollution` for as long as the ruleset's `MovementCost` says, as for the other
  terrain jobs.
- When it finishes, each `Pollution` on the tile goes through `core-tile-improvement`'s `Removed` rules, which take it
  off the tile.
- Saved games: the busy rule is registered with `core-unit`'s `BusyRegistry` through `registerDelayedAction`, so a unit
  part-way through carries on after a load.
