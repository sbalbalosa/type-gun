import Gun from "gun";
import "gun/sea";
import "gun/lib/then.js";
import "gun/lib/unset.js";
import "reflect-metadata";

import { getGlobal } from "./helpers";

const global = getGlobal();

const gun = global.typeGunInstance || Gun([]);

const sea = Gun.SEA;

global.typeGunInstance = gun;
global.typeGunSeaInstance = sea;
