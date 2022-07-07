import { root, field, edge } from '../index';
import Keychain from './keychain';
import MapQuery from '../query/map';

@root
export default class metadata {

   @field
   pub?: string;

   @edge(() => Keychain)
   keychain?: MapQuery;
}