import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { TileImprovementRegistry } from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
import DelayedAction from '@civ-clone/core-unit/DelayedAction';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
export declare const COMPLETE = 'base-unit-action-clean-pollution:complete';
export declare class CleanPollution extends DelayedAction {
  private _tileImprovementRegistry;
  constructor(
    from: Tile,
    to: Tile,
    unit: Unit,
    ruleRegistry?: RuleRegistry,
    tileImprovementRegistry?: TileImprovementRegistry,
    turn?: Turn
  );
  perform(): void;
  static complete(action: CleanPollution): void;
}
export default CleanPollution;
