import { map, edge } from '../index';
import PublicAccess from './public-access';
import MapQuery from '../query/map';

@map
export default class PropertyAccess {

    @edge(() => PublicAccess)
    publicAccess?: MapQuery;
}
