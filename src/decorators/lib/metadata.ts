import { root, field, edge } from '../index';
import Keychain from './keychain';
import SetQuery from '../query/set';

@root
export default class Metadata {

   @field
   pub?: string;

   @edge(() => Keychain)
   keychain?: SetQuery;
}