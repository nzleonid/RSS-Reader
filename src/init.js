import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import isURL from 'validator/lib/isURL';
import { watch } from 'melanke-watchjs';
import axios from 'axios';

export default () => {
  const state = {
    inputCheckValid: '',
    currentFeed: '',
    causeOfError: '',
    numberList: 1,
  };
  let listFeed = [];
  const input = document.querySelector('#address');
  const spanError = document.querySelector('#error');
  input.addEventListener('input', (e) => {
    if (isURL(e.target.value) && !listFeed.includes(e.target.value)) {
      state.causeOfError = '';
      state.inputCheckValid = 'is-valid';
      state.currentFeed = e.target.value;
    }
    if (!isURL(e.target.value)) {
      state.causeOfError = 'Invalid URL';
      state.inputCheckValid = 'is-invalid';
    }
    if (listFeed.includes(e.target.value)) {
      state.causeOfError = 'This feed has already been added';
      state.inputCheckValid = 'is-invalid';
    }
    if (e.target.value.length === 0) {
      state.causeOfError = '';
      state.inputCheckValid = '';
    }
  });

  const listTab = document.querySelector('#list-tab');
  const tabContent = document.querySelector('#nav-tabContent');

  const generateFeed = (feed) => {
    const a = document.createElement('a');
    a.classList.add('list-group-item', 'list-group-item-action');
    a.textContent = feed.querySelector('title').textContent;
    a.setAttribute('data-toggle', 'list');
    a.setAttribute('role', 'tab');
    state.numberList += 1;
    a.setAttribute('href', `#list-${state.numberList}`);
    listTab.appendChild(a);

    const mainFeed = document.querySelector('#list-1');
    const newFeed = document.createElement('div');
    newFeed.classList.add('tab-pane', 'fade');
    newFeed.setAttribute('role', 'tabpanel');
    newFeed.setAttribute('id', `list-${state.numberList}`);

    const itemList = feed.querySelectorAll('item');
    itemList.forEach((element) => {
      const title = element.querySelector('title');
      const link = element.querySelector('link');
      const aElement = document.createElement('a');
      aElement.classList.add('list-group-item', 'list-group-item-action');
      aElement.setAttribute('href', link.textContent);
      aElement.textContent = title.textContent;
      const aElementMain = aElement.cloneNode(true);
      mainFeed.appendChild(aElementMain);
      newFeed.appendChild(aElement);
    });

    tabContent.appendChild(newFeed);
  };

  const submit = document.querySelector('#submit');
  submit.addEventListener('click', () => {
    if (state.inputCheckValid === 'is-valid' && !listFeed.includes(state.currentFeed)) {
      listFeed = [state.currentFeed, ...listFeed];
      input.setAttribute('disabled', 'disabled');
      submit.setAttribute('disabled', 'disabled');
      axios.get(`http://cors-anywhere.herokuapp.com/${state.currentFeed}`)
        .then((response) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(response.data, 'application/xml');
          input.removeAttribute('disabled', 'disabled');
          submit.removeAttribute('disabled', 'disabled');
          state.inputCheckValid = '';
          input.value = ('');
          generateFeed(doc);
        });
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
