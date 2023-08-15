import moment from 'moment';
moment.locale('uz-latn');
export const createDate = (date: string) => {
    return moment(date).format('llll');
};
