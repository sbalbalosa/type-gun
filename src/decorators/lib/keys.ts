import { map, field } from '../index';

@map
export default class Keys {

   @field
   key?: string;

   @field
   generatedAt?: string;
}