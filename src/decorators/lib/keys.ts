import { list, field, link } from '../index';

@list
export default class Keys {
   @field
   key?: string;

   @link
   master?: null;
}