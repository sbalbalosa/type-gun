import { map, field } from '../index';

@map
export default class Properties {
    @field
    key: string | null = null;

    @field
    grantedAt: string | null = null;
}