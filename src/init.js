import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import isURL from 'validator/lib/isURL';
import { watch } from 'melanke-watchjs';
import _ from 'lodash';
import axios from 'axios';
import render from './render';

export default () => {
  const state = {
    inputCheckValid: '',
    currentFeed: '',
    listFeed: [],
    inputAndSubmit: '',
    feeds: [],
    numberList: 1,
  };

  const input = document.querySelector('#address');
  const spanError = document.querySelector('#error');
  input.addEventListener('input', (e) => {
    if (isURL(e.target.value) && !state.listFeed.includes(e.target.value)) {
      state.inputCheckValid = 'valid';
      state.currentFeed = e.target.value;
    }
    if (!isURL(e.target.value)) {
      state.inputCheckValid = 'invalid url';
    }
    if (state.listFeed.includes(e.target.value)) {
      state.inputCheckValid = 'feed has already';
    }
    if (e.target.value.length === 0) {
      state.inputCheckValid = '';
    }
  });

  watch(state, 'feeds', () => {
    render(state);
  });

  const parse = (str) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(str, 'application/xml');
    if (!doc.querySelector('rss')) {
      return 'error';
    }
    const parsNameFeed = doc.querySelector('title').textContent;
    const [...itemList] = doc.querySelectorAll('item');
    const arrayData = itemList.reduce((acc, item) => {
      const parsTitle = item.querySelector('title').textContent;
      const parsLink = item.querySelector('link').textContent;
      const parsDescription = item.querySelector('description').textContent;
      const currentData = {
        nameFeed: parsNameFeed, title: parsTitle, link: parsLink, description: parsDescription,
      };
      return [...acc, currentData];
    }, []);
    return arrayData;
  };
  const proxy = 'http://cors-anywhere.herokuapp.com/';
  const submit = document.querySelector('#submit');
  submit.addEventListener('click', () => {
    if (state.inputCheckValid === 'valid' && !state.listFeed.includes(state.currentFeed)) {
      state.listFeed = [state.currentFeed, ...state.listFeed];
      state.inputAndSubmit = 'processing';
      axios.get(`${proxy}${state.currentFeed}`)
        .then((response) => {
          const data = parse(response.data);
          if (data === 'error') {
            state.inputAndSubmit = 'enabled';
            state.inputCheckValid = 'its not rss';
          } else {
            state.inputAndSubmit = 'enabled';
            state.inputCheckValid = '';
            state.numberList += 1;
            state.feeds = [data, ...state.feeds];
          }
        })
        .catch(() => {
          state.inputAndSubmit = 'enabled';
          state.inputCheckValid = 'network error';
        });
    }
  });
  watch(state, 'inputAndSubmit', () => {
    if (state.inputAndSubmit === 'enabled' && state.inputCheckValid !== 'valid') {
      input.removeAttribute('disabled', 'disabled');
      submit.removeAttribute('disabled', 'disabled');
      submit.innerHTML = 'Submit';
    }
    if (state.inputAndSubmit === 'processing') {
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

    switch (state.inputCheckValid) {
      case 'network error':
        spanError.textContent = 'Network error, try again';
        input.classList.add('is-invalid');
        break;
      case 'its not rss':
        spanError.textContent = 'This address is not RSS feed';
        submit.setAttribute('disabled', 'disabled');
        input.classList.add('is-invalid');
        break;
      case 'feed has already':
        spanError.textContent = 'This feed has already been added';
        submit.setAttribute('disabled', 'disabled');
        input.classList.add('is-invalid');
        break;
      case 'invalid url':
        spanError.textContent = 'Invalid URL';
        submit.setAttribute('disabled', 'disabled');
        input.classList.add('is-invalid');
        break;
      case 'valid':
        spanError.textContent = '';
        submit.removeAttribute('disabled', 'disabled');
        input.classList.add('is-valid');
        break;
      default:
        spanError.textContent = '';
        submit.removeAttribute('disabled', 'disabled');
        break;
    }
  });

  const checkUpdate = (listFeed) => {
    const amountFeedArray = 10;
    const splitListFeed = _.chunk(listFeed, amountFeedArray);
    splitListFeed.forEach((newFeeds) => {
      const promises = newFeeds.map(feed => axios.get(`${proxy}${feed}`)
        .then(response => parse(response.data)));
      const promise = Promise.all(promises);
      promise.then(([itemsArray]) => {
        const allLinks = state.feeds.map(element => element.map(e => e.link));
        const newFeed = itemsArray.filter(element => _.flatten(allLinks)
          .includes(element.link) === false);

        if (newFeed.length !== 0) {
          state.feeds = [newFeed, ...state.feeds];
        }
      });
    });
    setTimeout(checkUpdate, 5000, state.listFeed);
  };
  setTimeout(checkUpdate, 5000, state.listFeed);
};
