import CleanPollution from '../CleanPollution';
import Effect from '@civ-clone/core-rule/Effect';
import Generator from '@civ-clone/core-world-generator/Generator';
import Player from '@civ-clone/core-player/Player';
import Pollution from '@civ-clone/base-tile-improvement-pollution/Pollution';
import Removed from '@civ-clone/core-tile-improvement/Rules/Removed';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';

describe('CleanPollution', (): void => {
  it('removes the pollution on its tile when it completes, and nothing else', (): void => {
    const ruleRegistry = new RuleRegistry(),
      tileImprovementRegistry = new TileImprovementRegistry(),
      tile = new Tile(0, 0, new Terrain(), new World(new Generator(1, 1))),
      unit = new Unit(null, new Player(), tile, ruleRegistry),
      pollution = new Pollution(tile, ruleRegistry),
      other = new TileImprovement(tile, ruleRegistry),
      removed: TileImprovement[] = [];

    tileImprovementRegistry.register(pollution, other);
    ruleRegistry.register(
      new Removed(
        new Effect((removedTile: Tile, improvement: TileImprovement): void => {
          expect(removedTile).to.equal(tile);

          removed.push(improvement);
        })
      )
    );

    CleanPollution.complete(
      new CleanPollution(
        tile,
        tile,
        unit,
        ruleRegistry,
        tileImprovementRegistry
      )
    );

    expect(removed).to.deep.equal([pollution]);
  });
});
