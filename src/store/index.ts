import Vue from 'vue';
import Vuex from 'vuex';
// import auth from './modules/auth';
// import booking from './modules/booking';
// import payment from './modules/payment';
import layout from './modules/layout';
// import language from './modules/language';
import page from './modules/page';
// import category from './modules/category';
import loading from './modules/loading';
import snackbar from './modules/snackbar';
import landing from './modules/landing';
import VuexPersistence from 'vuex-persist';

const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
  // modules: ['auth', 'booking', 'resort', 'language'],
  modules: ['page', 'landing'],
  key: 'store'
});

Vue.use(Vuex);

export default new Vuex.Store({
  plugins: [vuexLocal.plugin],
  modules: {
    snackbar,
    loading,
    // auth,
    page,
    // category,
    // booking,
    // payment,
    layout,
    landing
    // language
  }
});
