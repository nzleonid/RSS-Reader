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
    listFeed: [],
    inputAndSubmit: '',
    feed: [],
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

  watch(state, 'feed', () => {
    render(state);
  });

  const parse = (str) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(str, 'application/xml');
    if (!doc.querySelector('rss')) {
      return 'error';
    }
    const nameFeed = doc.querySelector('title').textContent;
    const [...itemList] = doc.querySelectorAll('item');
    const arrayData = itemList.reduce((acc, item) => {
      const title = item.querySelector('title').textContent;
      const link = item.querySelector('link').textContent;
      const description = item.querySelector('description').textContent;
      const currentData = [title, link, description];
      return [...acc, currentData];
    }, [nameFeed]);
    return arrayData;
  };
  const proxy = 'http://cors-anywhere.herokuapp.com/';
  const submit = document.querySelector('#submit');
  submit.addEventListener('click', () => {
    if (state.inputCheckValid === 'valid' && !state.listFeed.includes(state.currentFeed)) {
      state.listFeed = [state.currentFeed, ...state.listFeed];
      state.inputAndSubmit = 'disabled';
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
            state.feed = data;
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

  const splitArray = (array, part, acc = []) => {
    if (array.length === 0) {
      return acc;
    }
    return splitArray(array.slice(part), part, [...acc, array.slice(0, part)]);
  };

  const checkUpdate = (listFeed) => {
    const amountFeedArray = 10;
    const splitListFeed = splitArray(listFeed, amountFeedArray);

    splitListFeed.forEach((feeds) => {
      const promises = feeds.map(feed => axios.get(`${proxy}${feed}`)
        .then(response => parse(response.data)));
      const promise = Promise.all(promises);
      promise.then(([itemsArray]) => {
        const [title, ...items] = itemsArray;
        const mainFeed = document.querySelector('#list-1');
        const [...a] = mainFeed.querySelectorAll('a');
        const allLinksInFeed = a.map(element => element.getAttribute('href'));

        const newFeed = items.filter(item => !allLinksInFeed.includes(item[1]));
        if (newFeed.length !== 0) {
          state.feed = [title, ...newFeed];
        }
      });
    });
    setTimeout(checkUpdate, 5000, state.listFeed);
  };
  setTimeout(checkUpdate, 5000, state.listFeed);
};
