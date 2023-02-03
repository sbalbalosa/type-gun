import Gun from "gun";
import "gun/sea";
import "gun/lib/then.js";
import "gun/lib/unset.js";
import "reflect-metadata";

import { getGlobal } from "./helpers";

const global = getGlobal();
const gun = global.gun || Gun([]);
const sea = Gun.SEA;

global.gun = gun;
global.sea = sea;
