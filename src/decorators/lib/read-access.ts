import { map, field, edge } from '../index';
import PropertyAccess from './property-access';
import PublicAccess from './public-access';
import MapQuery from '../query/map';

@map
export default class ReadAccess {

   @edge(() => PublicAccess)
    publicAccess?: MapQuery;
}