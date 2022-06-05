import Gun from "gun";
import "gun/lib/then.js";
import "reflect-metadata";

import { getGlobal } from "./helpers";

const global = getGlobal();

const gun = global.typeGunInstance || Gun([]);

global.typeGunInstance = gun;
