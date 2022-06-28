import { node, field, edge } from '../index';
import MapQuery from '../query/map';
import Read from './read';
import Keys from './keys';

@node
export default class Keychain {
    @field
    owner?: string;

    @edge(() => Keys)
    keys?: MapQuery;

    @edge(() => Read)
    read?: MapQuery;
}