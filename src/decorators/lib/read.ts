import { map, edge, field } from '../index';
import MapQuery from '../query/map';
import Properties from './properties';

@map
export default class Read {

   @field
   pub?: string;

   @field
   epub?: string;

   @edge(() => Properties)
   properties?: MapQuery;
}