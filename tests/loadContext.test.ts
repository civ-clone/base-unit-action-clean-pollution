import { COMPLETE } from '../CleanPollution';
import Effect from '@civ-clone/core-rule/Effect';
import Generator from '@civ-clone/core-world-generator/Generator';
import PendingEffect from '@civ-clone/core-pending-effect/PendingEffect';
import PendingEffectRegistry from '@civ-clone/core-pending-effect/PendingEffectRegistry';
import Player from '@civ-clone/core-player/Player';
import Pollution from '@civ-clone/base-tile-improvement-pollution/Pollution';
import Removed from '@civ-clone/core-tile-improvement/Rules/Removed';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import Unit from '@civ-clone/core-unit/Unit';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';
import { instance as busyRegistryInstance } from '@civ-clone/core-unit/BusyRegistry';

// civ-clone/web-renderer#248
describe('CleanPollution, loaded into a game with its own registries', (): void => {
  it("cleans the pollution in the context's `tileImprovements`, not the module instance", (): void => {
    const context = {
        pendingEffects: new PendingEffectRegistry(),
        rules: new RuleRegistry(),
        tileImprovements: new TileImprovementRegistry(),
        turn: new Turn(),
      },
      tile = new Tile(0, 0, new Terrain(), new World(new Generator(1, 1))),
      unit = new Unit(null, new Player(), tile, context.rules),
      pollution = new Pollution(tile, context.rules),
      removed: TileImprovement[] = [];

    context.tileImprovements.register(pollution);
    context.rules.register(
      new Removed(
        new Effect((removedTile: Tile, improvement: TileImprovement): void => {
          removed.push(improvement);

          context.tileImprovements.unregister(improvement);
        })
      )
    );
    context.pendingEffects.register(
      new PendingEffect(COMPLETE, unit, { endTurn: '1' })
    );
    context.turn.set(1);

    busyRegistryInstance.rebuild('CleaningPollution', unit, context).process();

    expect(removed).to.deep.equal([pollution]);
    expect(context.tileImprovements.getByTile(tile)).to.deep.equal([]);
  });
});
