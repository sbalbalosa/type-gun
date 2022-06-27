import { map, field } from '../../decorators';

@map
export default class Employees {

    @field
    firstName?: string;

}