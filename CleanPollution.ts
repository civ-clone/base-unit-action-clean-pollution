import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  TileImprovementRegistry,
  instance as tileImprovementRegistryInstance,
} from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import {
  Turn,
  instance as turnInstance,
} from '@civ-clone/core-turn-based-game/Turn';
import CleaningPollution from './Rules/CleaningPollution';
import DelayedAction from '@civ-clone/core-unit/DelayedAction';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import MovementCost from '@civ-clone/core-unit/Rules/MovementCost';
import Pollution from '@civ-clone/base-tile-improvement-pollution/Pollution';
import Removed from '@civ-clone/core-tile-improvement/Rules/Removed';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import Unit from '@civ-clone/core-unit/Unit';
import registerDelayedAction from '@civ-clone/core-unit/registerDelayedAction';

export const COMPLETE = 'base-unit-action-clean-pollution:complete';

// A worker cleans the pollution off its tile (civ-clone/web-renderer#32). How long that takes is the ruleset's
//  `MovementCost`, as for the other terrain jobs.
export class CleanPollution extends DelayedAction {
  private _tileImprovementRegistry: TileImprovementRegistry;

  constructor(
    from: Tile,
    to: Tile,
    unit: Unit,
    ruleRegistry: RuleRegistry = ruleRegistryInstance,
    tileImprovementRegistry: TileImprovementRegistry = tileImprovementRegistryInstance,
    turn: Turn = turnInstance
  ) {
    super(from, to, unit, ruleRegistry, turn);

    this._tileImprovementRegistry = tileImprovementRegistry;
  }

  perform(): void {
    const [moveCost]: number[] = this.ruleRegistry()
      .process(MovementCost, this.unit(), this)
      .sort((a: number, b: number): number => b - a);

    super.perform(moveCost || 0, COMPLETE, CleaningPollution);

    this.ruleRegistry().process(Moved, this.unit(), this);
  }

  // Static, as the other delayed actions' are: an instance method would make the class unassignable to `Action`
  //  (civ-clone/web-renderer#21).
  static complete(action: CleanPollution): void {
    action._tileImprovementRegistry
      .getByTile(action.from())
      .filter(
        (improvement: TileImprovement): boolean =>
          improvement instanceof Pollution
      )
      .forEach((pollution: TileImprovement): void => {
        action.ruleRegistry().process(Removed, action.from(), pollution);
      });
  }
}

// Registered here rather than passed to `perform` as a closure, so a unit part-way through can be saved.
registerDelayedAction({
  BusyRule: CleaningPollution,
  handler: COMPLETE,
  action: (unit: Unit) => new CleanPollution(unit.tile(), unit.tile(), unit),
  complete: (unit, pendingEffect, action) => CleanPollution.complete(action),
});

export default CleanPollution;
