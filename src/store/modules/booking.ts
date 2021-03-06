import { addDays } from 'date-fns';
import { RoomTypeService, ReservationService } from '@/connection/resources.js';
import { bookingStep } from '@/types';
import { setDocumentClassesOnToggleDialog, formatDate, removeOtherLanguagesExcept, toFixedNumber } from '@/helpers';
import { cloneDeep } from 'lodash-es';
import store from '@/store';
import {
  emailAPIBase,
  reservationEmailsBcc,
  reservationSuccessEmailTemplateId,
  reservationFailEmailTemplateId
} from '@/constants/app';
import { ajax } from '@/connection/ajax';

const steps: { [name: string]: bookingStep } = {
  notStarted: {
    id: 0
  },
  confirmDates: {
    id: 1
  },
  confirmGuests: {
    id: 2
  },
  confirmBooking: {
    id: 3
  },
  reviewPolicies: {
    id: 4,
    title: 'Review Rules'
  },
  customerInfo: {
    id: 5,
    title: 'Contact Info'
  },
  paymentInfo: {
    id: 6,
    title: 'Payment'
  },
  thankYou: {
    id: 7,
    title: 'Thank You!'
  }
};

const defaultState = {
  currentStep: {
    id: 0
  },
  steps,
  dialog: {
    isOpen: false
  },
  countriesList: [],
  bookingInfo: {
    returnUrl: '/',
    subjectItem: {},
    roomDescriptionHTML: '',
    guests: {
      adults: 1,
      children: 0,
      total: 1
    },
    message: '',
    name: '',
    email: '',
    phoneNumber: '',
    phoneCountry: {},
    payWith: 'card',
    roomType: {},
    dateOne: '',
    dateTwo: '',
    checkOut: '',
    prices: [],
    fullName: '',
    addressCity: '',
    addressState: '',
    addressLine: '',
    addressZip: ''
  },
  vat: 0,
  finalPrice: 0,
  reservationId: 0,
  reservationDetails: {},
  isNextStepLoading: false,
  contactInfoError: ''
};

export default {
  namespaced: true,
  state: cloneDeep(defaultState),
  mutations: {
    updateCountriesList(state, payload) {
      state.countriesList = payload;
    },
    updateContactInfoError(state, payload) {
      state.contactInfoError = payload;
    },
    updateIsNextStepLoading(state, payload) {
      state.isNextStepLoading = payload;
    },
    updateDialog(state, payload) {
      state.dialog = payload;
    },
    updateCurrentStep(state, payload) {
      state.currentStep = payload;
    },
    updateGuests(state, payload) {
      state.bookingInfo.guests = payload;
    },
    updateDateOne(state, payload) {
      state.bookingInfo.dateOne = payload;
    },
    updateDateTwo(state, payload) {
      state.bookingInfo.dateTwo = payload;
      state.bookingInfo.checkOut = formatDate(new Date(addDays(payload, 1)), 'YYYY-MM-DD');
    },
    updatePrices(state, payload) {
      state.bookingInfo.prices = payload;
    },
    updateMessage(state, payload) {
      state.bookingInfo.message = payload;
    },
    updateName(state, payload) {
      state.bookingInfo.name = payload;
    },
    updateEmail(state, payload) {
      state.bookingInfo.email = payload;
    },
    updatePhoneNumber(state, payload) {
      state.bookingInfo.phoneNumber = payload;
    },
    updatePhoneCountry(state, payload) {
      state.bookingInfo.phoneCountry = payload;
    },
    updatePayWith(state, payload) {
      state.bookingInfo.payWith = payload;
    },
    updateFullName(state, payload) {
      state.bookingInfo.fullName = payload;
    },
    updateAddressLine(state, payload) {
      state.bookingInfo.addressLine = payload;
    },
    updateAddressZip(state, payload) {
      state.bookingInfo.addressZip = payload;
    },
    updateAddressCity(state, payload) {
      state.bookingInfo.addressCity = payload;
    },
    updateAddressState(state, payload) {
      state.bookingInfo.addressState = payload;
    },
    updateRoomType(state, payload) {
      state.bookingInfo.roomType = payload;
    },
    updateReturnUrl(state, payload) {
      state.bookingInfo.returnUrl = payload;
    },
    updateSubjectItem(state, payload) {
      state.bookingInfo.subjectItem = payload;
    },
    updateReservationId(state, payload) {
      state.reservationId = payload;
    },
    updateReservationDetails(state, payload) {
      state.reservationDetails = payload;
    },
    updateRoomDescriptionHTML(state, payload) {
      const englishDescription = removeOtherLanguagesExcept('en', payload).outerHTML;
      state.bookingInfo.roomDescriptionHTML = englishDescription;
    },
    resetState(state) {
      for (const key in defaultState) {
        if (defaultState.hasOwnProperty(key)) {
          state[key] = cloneDeep(defaultState[key]);
        }
      }
    }
  },
  actions: {
    updateContactInfoError(context, payload) {
      context.commit('updateContactInfoError', payload);
    },
    updateIsNextStepLoading(context, payload) {
      context.commit('updateIsNextStepLoading', payload);
    },
    updateCountriesList(context, payload) {
      context.commit('updateCountriesList', payload);
    },
    updateDialog(context, payload) {
      const dialog = {
        ...context.state.dialog,
        ...payload
      };

      setDocumentClassesOnToggleDialog(dialog.isOpen);
      context.commit('updateDialog', dialog);
    },
    cancelBooking(context) {
      context.commit('resetState');
    },
    startBooking(context, { subjectItem, returnUrl }) {
      context.commit('updateSubjectItem', subjectItem);
      context.commit('updateReturnUrl', returnUrl);
      context.commit('updateCurrentStep', context.state.steps.confirmDates);
    },
    endBooking(context) {
      context.commit('resetState');
    },
    updateCurrentStep(context, payload) {
      context.commit('updateCurrentStep', payload);
    },
    updateGuests(context, payload) {
      context.commit('updateGuests', payload);
    },
    updateDateOne(context, payload) {
      context.commit('updateDateOne', payload);
    },
    updateDateTwo(context, payload) {
      context.commit('updateDateTwo', payload);
    },
    clearDateTwo(context) {
      context.commit('updateDateTwo', defaultState.bookingInfo.dateTwo);
    },
    updateVat(context, payload) {
      context.commit('updateVat', payload);
    },
    updateFinalPrice(context, payload) {
      context.commit('updateFinalPrice', payload);
    },
    updatePrices(context, payload) {
      context.commit('updatePrices', payload);
    },
    updateMessage(context, payload) {
      context.commit('updateMessage', payload);
    },
    updateName(context, payload) {
      context.commit('updateName', payload);
    },
    updateEmail(context, payload) {
      context.commit('updateEmail', payload);
    },
    updatePhoneNumber(context, payload) {
      context.commit('updatePhoneNumber', payload);
    },
    updatePhoneCountry(context, payload) {
      context.commit('updatePhoneCountry', payload);
    },
    updatePayWith(context, payload) {
      context.commit('updatePayWith', payload);
    },
    updateFullName(context, payload) {
      context.commit('updateFullName', payload);
    },
    updateAddressLine(context, payload) {
      context.commit('updateAddressLine', payload);
    },
    updateAddressZip(context, payload) {
      context.commit('updateAddressZip', payload);
    },
    updateAddressCity(context, payload) {
      context.commit('updateAddressCity', payload);
    },
    updateAddressState(context, payload) {
      context.commit('updateAddressState', payload);
    },
    updateRoomType(context, payload) {
      context.commit('updateRoomType', payload);
    },
    clearPrices(context) {
      context.commit('updatePrices', defaultState.bookingInfo.prices);
    },
    getPrices(context, { roomTypeId, dateOne, dateTwo }) {
      return RoomTypeService.prices({
        roomTypeId,
        startDate: dateOne,
        endDate: dateTwo
      }).then(prices => {
        context.commit('updatePrices', prices);
      });
    },
    async reserveRoom(context) {
      const customBookingInfo = cloneDeep(context.getters['customBookingInfo']);
      try {
        const { reservationId } = await ReservationService.reserve(customBookingInfo);
        context.commit('updateReservationId', reservationId);
        return { reserve: true };
      } catch (error) {
        try {
          await context.dispatch('sendReservationFailEmail', { notificationType: 'CARD PAYMENT' });
          store.dispatch(
            'payment/updatePaymentError',
            'There was an error with your booking, we will be in contact via email soon to complete your booking.'
          );
          return { reserve: false, email: true };
        } catch (error) {
          store.dispatch(
            'payment/updatePaymentError',
            'There was an error with your booking, please <a href="/contact">contact us</a>'
          );
          return { reserve: false, email: false };
        }
      }
    },
    /*
    reserve-room:
      success:
        send-email-success:
          success:
            go next step
          fail:
            go to next step (maybe using retry-axios for email)
      fail:
        send-email-fail:
          success:
            show error (we got your booking data, will call you)
          fail:
            show error (please contact us)
    */
    // TODO: Separate logic of email and reservation
    async reserveRoomAndNotify(context) {
      const customBookingInfo = cloneDeep(context.getters['customBookingInfo']);
      try {
        const { reservationId } = await ReservationService.reserve(customBookingInfo);
        context.commit('updateReservationId', reservationId);
        try {
          await context.dispatch('sendReservationSuccessEmail', { notificationType: 'CASH PAYMENT' });
          return { reserve: true, email: true };
        } catch (error) {
          console.log('Sending reservation email failed');
          return { reserve: true, email: false };
        }
      } catch (error) {
        try {
          await context.dispatch('sendReservationFailEmail', { notificationType: 'CASH PAYMENT' });
          store.dispatch(
            'payment/updatePaymentError',
            'There was an error with your booking, we will be in contact via email soon to complete your booking.'
          );
          return {
            reserve: false,
            email: true
          };
        } catch (error) {
          store.dispatch(
            'payment/updatePaymentError',
            'There was an error with your booking, please <a href="/contact">contact us</a>'
          );
          return {
            reserve: false,
            email: false
          };
        }
      }
    },
    updateRoomDescriptionHTML(context, payload) {
      context.commit('updateRoomDescriptionHTML', payload);
    },
    sendReservationSuccessEmail(context, { notificationType }) {
      const reservationSuccessEmailData = context.getters.reservationSuccessEmailData({ notificationType });
      return ajax({
        method: 'post',
        url: `${emailAPIBase}/mail/send`,
        data: reservationSuccessEmailData,
        withCredentials: false,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    sendReservationFailEmail(context, { notificationType }) {
      const reservationFailEmailData = context.getters.reservationFailEmailData({ notificationType });
      return ajax({
        method: 'post',
        url: `${emailAPIBase}/mail/send`,
        data: reservationFailEmailData,
        withCredentials: false,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    evaluateValidation(context) {
      const bookingInfo = context.getters.bookingInfo;
      const computedTotalPrice = context.getters.computedTotalPrice({ all: true });
      const now = new Date();
      const { dateOne, dateTwo } = bookingInfo;
      if (!(new Date(dateOne) > now && new Date(dateTwo) > now)) {
        throw new Error('Check in and check out dates are not valid. Please starting your booking again.');
      }
      if (!(computedTotalPrice >= 0)) {
        throw new Error('Total price is not valid. Please starting your booking again.');
      }
      return true;
    }
  },
  getters: {
    dialog: state => {
      return state.dialog;
    },
    countriesList: state => {
      return state.countriesList || [];
    },
    contactInfoError: state => {
      return state.contactInfoError;
    },
    isNextStepLoading: state => {
      return state.isNextStepLoading;
    },
    bookingInfo(state) {
      return state.bookingInfo;
    },
    customBookingInfo(state, getters) {
      const bookingInfo = state.bookingInfo;
      const amount = getters.computedTotalPrice({ all: true });

      return {
        roomTypeId: bookingInfo.roomType.id,
        body: {
          name: bookingInfo.fullName,
          message: bookingInfo.message,
          numberOfGuests: bookingInfo.guests.total,
          start: bookingInfo.dateOne,
          end: bookingInfo.checkOut,
          payment: {
            amount
          },
          email: store.getters['auth/user'].userName,
          phone: `+${bookingInfo.phoneCountry && bookingInfo.phoneCountry.callingCodes[0]}` + bookingInfo.phoneNumber
        }
      };
    },
    reservationSuccessEmailData: (state, getters) => ({ notificationType }) => {
      const bookingInfo = state.bookingInfo;
      const prices = getters.prices({ decimalDigits: 2, formattedDate: true });
      const email_to = [
        {
          email: store.getters['auth/user'].userName,
          name: bookingInfo.fullName
        }
      ];
      return {
        email_subject: 'automated',
        email_bcc: reservationEmailsBcc,
        email_to,
        template_id: reservationSuccessEmailTemplateId,
        dynamic_template_data: {
          notificationType,
          name: bookingInfo.fullName,
          message: bookingInfo.message,
          numberOfGuests: bookingInfo.guests.total,
          checkIn: formatDate(bookingInfo.dateOne, 'ddd, D MMM'),
          checkOut: formatDate(bookingInfo.checkOut, 'ddd, D MMM'),
          email: store.getters['auth/user'].userName,
          phoneCountry: bookingInfo.phoneCountry.name,
          phone: `+ (${bookingInfo.phoneCountry.callingCodes[0]}) ` + bookingInfo.phoneNumber,
          guests: bookingInfo.guests,
          resort: bookingInfo.subjectItem,
          roomDescriptionHTML: bookingInfo.roomDescriptionHTML,
          nightsCount: prices.length,
          prices,
          vat: getters.computedVAT(),
          amount: getters.computedTotalPrice({ all: true })
        }
      };
    },
    reservationFailEmailData: (state, getters) => ({ notificationType }) => {
      const bookingInfo = state.bookingInfo;
      const prices = getters.prices({ decimalDigits: 2, formattedDate: true });
      return {
        email_to: reservationEmailsBcc,
        template_id: reservationFailEmailTemplateId,
        dynamic_template_data: {
          notificationType,
          name: bookingInfo.fullName,
          message: bookingInfo.message,
          numberOfGuests: bookingInfo.guests.total,
          checkIn: formatDate(bookingInfo.dateOne, 'ddd, D MMM'),
          checkOut: formatDate(bookingInfo.checkOut, 'ddd, D MMM'),
          email: store.getters['auth/user'].userName,
          phoneCountry: bookingInfo.phoneCountry.name,
          phone: `+ (${bookingInfo.phoneCountry.callingCodes[0]}) ` + bookingInfo.phoneNumber,
          guests: bookingInfo.guests,
          resort: bookingInfo.subjectItem,
          nightsCount: prices.length,
          prices,
          vat: getters.computedVAT(),
          amount: getters.computedTotalPrice({ all: true })
        }
      };
    },
    prices: state => ({ decimalDigits = 0, formattedDate = false } = {}) => {
      let prices = state.bookingInfo.prices;
      prices = prices.map(price => {
        const amount = toFixedNumber(price.amount, decimalDigits);
        return {
          ...price,
          amount
        };
      });
      if (formattedDate) {
        prices = prices.map(price => {
          const date = formatDate(price.date, 'ddd, D MMM');
          return {
            ...price,
            date
          };
        });
      }
      return prices;
    },
    computedRoomPrice(state) {
      const prices = state.bookingInfo.prices;
      let roomPrice = 0;
      for (let i = 0; i < prices.length; i++) {
        roomPrice += prices[i].amount;
      }
      return roomPrice;
    },
    computedVAT: (state, getters) => ({ decimalDigits = 2 } = {}) => {
      let prices = getters.computedRoomPrice;
      const VAT_RATE = 0.1;
      return toFixedNumber(prices * VAT_RATE, decimalDigits);
    },
    computedTotalPrice: (state, getters) => ({ all = false, hasVAT = false, decimalDigits = 2 } = {}) => {
      let totalPrice = getters.computedRoomPrice;
      if (all || hasVAT) {
        totalPrice += getters.computedVAT();
      }
      return toFixedNumber(totalPrice, decimalDigits);
    },
    currentStep(state) {
      return state.currentStep;
    },
    steps(state) {
      return state.steps;
    },
    reservationId(state) {
      return state.reservationId;
    }
  }
};
