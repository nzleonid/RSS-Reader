const getUniqueId = url => url.replace(/[^a-z0-9]/gi, '');

export default (state) => {
  const listTab = document.querySelector('#list-tab');
  const tabContent = document.querySelector('#nav-tabContent');
  const a = document.createElement('a');
  a.classList.add('list-group-item', 'list-group-item-action');
  const [nameFeed, ...itemList] = state.feed;
  a.textContent = nameFeed;
  a.setAttribute('data-toggle', 'list');
  a.setAttribute('role', 'tab');
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
  itemList.forEach((element) => {
    const [title, link, description] = element;
    const id = getUniqueId(link);
    const li = document.createElement('li');
    li.classList.add('list-group-item');
    const liMain = li.cloneNode(true);
    const aElement = document.createElement('a');
    aElement.setAttribute('href', link);
    aElement.textContent = title;
    const aElementMain = aElement.cloneNode(true);

    const buttonElement = document.createElement('button');
    buttonElement.classList.add('btn', 'btn-primary', 'float-right');
    buttonElement.setAttribute('data-target', `#minor-${id}`);
    buttonElement.setAttribute('data-toggle', 'modal');
    buttonElement.textContent = 'Description';
    const buttonElementMain = buttonElement.cloneNode(true);
    buttonElementMain.setAttribute('data-target', `#main-${id}`);

    const modalDiv = document.createElement('div');
    modalDiv.classList.add('modal', 'fade');
    modalDiv.setAttribute('id', `minor-${id}`);
    modalDiv.setAttribute('aria-hidden', 'true');
    modalDiv.innerHTML = `<div class="modal-dialog"><div class="modal-content">
                          <div class="modal-header"><h4>${title}</h4></div>
                          <div class="modal-body">${description}</div></div></div>`;
    const modalDivMain = modalDiv.cloneNode(true);
    modalDivMain.setAttribute('id', `main-${id}`);

    li.appendChild(aElement);
    li.appendChild(buttonElement);
    li.appendChild(modalDiv);
    liMain.appendChild(aElementMain);
    liMain.appendChild(buttonElementMain);
    liMain.appendChild(modalDivMain);
    ul.appendChild(li);
    ulMain.appendChild(liMain);
  });
  const h2 = document.createElement('h2');
  h2.textContent = nameFeed;

  mainFeed.insertBefore(ulMain, mainFeed.firstChild);
  mainFeed.insertBefore(h2, mainFeed.firstChild);
  newFeed.appendChild(ul);
  tabContent.appendChild(newFeed);
};
