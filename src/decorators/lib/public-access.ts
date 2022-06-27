import { map, field } from '../index';

@map
export default class PublicAccess {

    @field
    key?: string;

    @field
    grantedAt?: string;
}