import { field, edge, map } from '../index';
import MapQuery from '../query/map';
import Read from './read';
import Keys from './keys';

@map
export default class Keychain {
    @field
    pub?: string;

    @field
    epub?: string;

    @edge(() => Keys)
    keys?: MapQuery;

    @edge(() => Read)
    read?: MapQuery;
}