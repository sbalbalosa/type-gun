import { map, edge, field } from '../index';
import ListQuery from '../query/list';
import Keys from './keys';

@map
export default class Properties {
    @field
    name?: string;

    @edge(() => Keys)
    keys?: ListQuery
}