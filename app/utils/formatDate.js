import { format } from 'date-fns';

const formatDate = (date) => {
    return format(date, 'EEEE d/M yy');
}

export default formatDate