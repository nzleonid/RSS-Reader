export default (transmittedState) => {
  const state = transmittedState;
  const listTab = document.querySelector('#list-tab');
  const tabContent = document.querySelector('#nav-tabContent');
  const a = document.createElement('a');
  a.classList.add('list-group-item', 'list-group-item-action');
  a.textContent = state.feed.querySelector('title').textContent;
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
  const ul = document.createElement('ul');
  ul.classList.add('list-group');
  const ulMain = ul.cloneNode(true);

  const itemList = state.feed.querySelectorAll('item');
  itemList.forEach((element) => {
    const title = element.querySelector('title');
    const link = element.querySelector('link');
    const description = element.querySelector('description');

    const li = document.createElement('li');
    li.classList.add('list-group-item');
    const liMain = li.cloneNode(true);
    const aElement = document.createElement('a');
    aElement.setAttribute('href', link.textContent);
    aElement.textContent = title.textContent;
    const aElementMain = aElement.cloneNode(true);

    const buttonElement = document.createElement('button');
    buttonElement.classList.add('btn', 'btn-primary', 'float-right');
    buttonElement.setAttribute('data-target', `.bd-example-modal-${state.numberButton}${state.numberList}`);
    buttonElement.setAttribute('data-toggle', 'modal');
    buttonElement.textContent = 'Description';
    const buttonElementMain = buttonElement.cloneNode(true);
    buttonElementMain.setAttribute('data-target', `.bd-example-modal-main${state.numberButton}`);

    const modalDiv = document.createElement('div');
    modalDiv.classList.add('modal', 'fade', `bd-example-modal-${state.numberButton}${state.numberList}`);
    modalDiv.setAttribute('aria-hidden', 'true');
    modalDiv.innerHTML = `<div class="modal-dialog"><div class="modal-content">${description.textContent}</div></div>`;
    const modalDivMain = document.createElement('div');
    modalDivMain.classList.add('modal', 'fade', `bd-example-modal-main${state.numberButton}`);
    modalDivMain.setAttribute('aria-hidden', 'true');
    modalDivMain.innerHTML = `<div class="modal-dialog"><div class="modal-content">${description.textContent}</div></div>`;

    state.numberButton += 1;
    li.appendChild(aElement);
    li.appendChild(buttonElement);
    li.appendChild(modalDiv);
    liMain.appendChild(aElementMain);
    liMain.appendChild(buttonElementMain);
    liMain.appendChild(modalDivMain);
    ul.appendChild(li);
    ulMain.appendChild(liMain);
  });

  mainFeed.insertBefore(ulMain, mainFeed.firstChild);
  newFeed.appendChild(ul);
  tabContent.appendChild(newFeed);
  return state.numberList;
};
