"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanPollution = exports.COMPLETE = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const Turn_1 = require("@civ-clone/core-turn-based-game/Turn");
const CleaningPollution_1 = require("./Rules/CleaningPollution");
const DelayedAction_1 = require("@civ-clone/core-unit/DelayedAction");
const Moved_1 = require("@civ-clone/core-unit/Rules/Moved");
const MovementCost_1 = require("@civ-clone/core-unit/Rules/MovementCost");
const Pollution_1 = require("@civ-clone/base-tile-improvement-pollution/Pollution");
const Removed_1 = require("@civ-clone/core-tile-improvement/Rules/Removed");
const registerDelayedAction_1 = require("@civ-clone/core-unit/registerDelayedAction");
exports.COMPLETE = 'base-unit-action-clean-pollution:complete';
// A worker cleans the pollution off its tile (civ-clone/web-renderer#32). How long that takes is the ruleset's
//  `MovementCost`, as for the other terrain jobs.
class CleanPollution extends DelayedAction_1.default {
    constructor(from, to, unit, ruleRegistry = RuleRegistry_1.instance, tileImprovementRegistry = TileImprovementRegistry_1.instance, turn = Turn_1.instance) {
        super(from, to, unit, ruleRegistry, turn);
        this._tileImprovementRegistry = tileImprovementRegistry;
    }
    perform() {
        const [moveCost] = this.ruleRegistry()
            .process(MovementCost_1.default, this.unit(), this)
            .sort((a, b) => b - a);
        super.perform(moveCost || 0, exports.COMPLETE, CleaningPollution_1.default);
        this.ruleRegistry().process(Moved_1.default, this.unit(), this);
    }
    // Static, as the other delayed actions' are: an instance method would make the class unassignable to `Action`
    //  (civ-clone/web-renderer#21).
    static complete(action) {
        action._tileImprovementRegistry
            .getByTile(action.from())
            .filter((improvement) => improvement instanceof Pollution_1.default)
            .forEach((pollution) => {
            action.ruleRegistry().process(Removed_1.default, action.from(), pollution);
        });
    }
}
exports.CleanPollution = CleanPollution;
// Registered here rather than passed to `perform` as a closure, so a unit part-way through can be saved.
(0, registerDelayedAction_1.default)({
    BusyRule: CleaningPollution_1.default,
    handler: exports.COMPLETE,
    action: (unit) => new CleanPollution(unit.tile(), unit.tile(), unit),
    complete: (unit, pendingEffect, action) => CleanPollution.complete(action),
});
exports.default = CleanPollution;
//# sourceMappingURL=CleanPollution.js.map