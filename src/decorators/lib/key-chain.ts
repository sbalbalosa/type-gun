import { node, field, edge } from '../index';
import MapQuery from '../query/map';
import ReadAccess from './read-access';

@node
export default class KeyChain {
    @field
    owner?: string;

    @edge(() => ReadAccess)
    readAccess?: MapQuery;
}