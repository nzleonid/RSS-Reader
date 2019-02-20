import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import isURL from 'validator/lib/isURL';
import { watch } from 'melanke-watchjs';
import axios from 'axios';
import render from './render';

export default () => {
  const state = {
    inputCheckValid: '',
    currentFeed: '',
    causeOfError: '',
    listFeed: [],
    inputAndSubmit: '',
    feed: '',
    connection: '',
    numberList: 1,
    numberButton: 1,
  };

  const input = document.querySelector('#address');
  const spanError = document.querySelector('#error');
  input.addEventListener('input', (e) => {
    if (isURL(e.target.value) && !state.listFeed.includes(e.target.value)) {
      state.causeOfError = '';
      state.inputCheckValid = 'is-valid';
      state.currentFeed = e.target.value;
    }
    if (!isURL(e.target.value)) {
      state.causeOfError = 'Invalid URL';
      state.inputCheckValid = 'is-invalid';
    }
    if (state.listFeed.includes(e.target.value)) {
      state.causeOfError = 'This feed has already been added';
      state.inputCheckValid = 'is-invalid';
    }
    if (e.target.value.length === 0) {
      state.causeOfError = '';
      state.inputCheckValid = '';
    }
  });

  watch(state, 'feed', () => {
    state.numberList = render(state);
  });

  const parse = (data) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, 'application/xml');
    if (!doc.querySelector('rss')) {
      state.causeOfError = 'This address is not RSS feed.';
      return 'error';
    }
    return doc;
  };

  const submit = document.querySelector('#submit');
  submit.addEventListener('click', () => {
    if (state.inputCheckValid === 'is-valid' && !state.listFeed.includes(state.currentFeed)) {
      state.listFeed = [state.currentFeed, ...state.listFeed];
      state.inputAndSubmit = 'disabled';
      axios.get(`http://cors-anywhere.herokuapp.com/${state.currentFeed}`)
        .then((response) => {
          const data = parse(response.data);
          if (data === 'error') {
            state.inputAndSubmit = 'enabled';
            state.inputCheckValid = 'is-invalid';
            state.connection = '';
          } else {
            state.inputAndSubmit = 'enabled';
            state.inputCheckValid = '';
            state.feed = data;
            state.connection = '';
          }
        })
        .catch(() => {
          state.connection = 'error';
        });
    }
  });
  watch(state, 'connection', () => {
    if (state.connection === 'error') {
      state.causeOfError = 'Network error, try again';
      state.inputCheckValid = 'is-invalid';
      state.inputAndSubmit = 'enabled';
    } else {
      state.causeOfError = '';
    }
  });
  watch(state, 'inputAndSubmit', () => {
    if (state.inputAndSubmit === 'enabled' && state.inputCheckValid === 'is-invalid') {
      input.removeAttribute('disabled', 'disabled');
      submit.removeAttribute('disabled', 'disabled');
      submit.innerHTML = 'Submit';
    }
    if (state.inputAndSubmit === 'disabled') {
      input.setAttribute('disabled', 'disabled');
      submit.setAttribute('disabled', 'disabled');
      submit.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Loading...';
    }
    if (state.inputAndSubmit === 'enabled' && state.inputCheckValid === '') {
      input.removeAttribute('disabled', 'disabled');
      submit.removeAttribute('disabled', 'disabled');
      submit.innerHTML = 'Submit';
      input.value = ('');
    }
  });

  watch(state, 'inputCheckValid', () => {
    input.classList.remove('is-valid', 'is-invalid');
    spanError.textContent = state.causeOfError;
    if (state.inputCheckValid !== '') {
      input.classList.add(state.inputCheckValid);
    }
  });
};
