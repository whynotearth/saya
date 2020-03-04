import { EmailAddress } from '@/types';

export const companyId = 555555555;
export const appTitle = 'Saya Booking System';
export const appTitleTemplate = `%s | ${appTitle}`;
export const companySlug = 'Saya';
export const emailAPIBase = 'https://express-502501.netlify.com/.netlify/functions/server';
export const reservationSuccessEmailTemplateId = 'd-111111111111111111';
export const reservationFailEmailTemplateId = 'd-22222222222222';
export const languageCodes = ['en', 'kh'];
export const countriesListUrl =
  'https://res.cloudinary.com/die9ji2vn/raw/upload/v1582139305/website-static/API/countries-list.json';
export const countryDefault = 'Cambodia';

let reservationEmailsBcc: EmailAddress[] = process.env.VUE_APP_EMAIL_BCC_LIST.split(',').map(item => ({
  email: item
}));

if (process.env.VUE_APP_DEV_MODE == 1) {
  reservationEmailsBcc = [
    {
      email: process.env.VUE_APP_EMAIL_DEV
    }
  ];
}
export { reservationEmailsBcc };
