const getUniqueId = url => url.replace(/[^a-z0-9]/gi, '');

export default (state) => {
  const listTab = document.querySelector('#list-tab');
  const tabContent = document.querySelector('#nav-tabContent');
  const { nameFeed } = state.feeds[0][0];
  const [...itemList] = state.feeds[0];
  const mainFeed = document.querySelector('#list-1');
  const defineUl = () => {
    if (!document.querySelector(`#list-${state.numberList}`)) {
      listTab.innerHTML = `${listTab.innerHTML}
        <a class="list-group-item list-group-item-action" data-toggle="list" href="#list-${state.numberList}" role="tab">${nameFeed}</a>`;
      tabContent.innerHTML = `${tabContent.innerHTML}
        <div class="tab-pane fade" role="tabpanel" id="list-${state.numberList}">
        <ul class="list-group"></ul></div>`;
      return tabContent.querySelector(`#list-${state.numberList} > ul`);
    }
    const [...a] = listTab.querySelectorAll('a');
    const findFeed = a.filter(element => element.textContent === nameFeed);
    const needFeed = document.querySelector(findFeed[0].getAttribute('href'));
    needFeed.innerHTML = `<ul class="list-group"></ul>${needFeed.innerHTML}`;
    return needFeed.querySelector('ul');
  };
  mainFeed.innerHTML = `<ul class="list-group" id="main-ul"></ul>${mainFeed.innerHTML}`;
  const ul = defineUl();
  const ulMain = document.querySelector('#main-ul');

  itemList.forEach((element) => {
    const { title, link, description } = element;
    const id = getUniqueId(link);
    ulMain.innerHTML = `${ulMain.innerHTML}
      <li class ="list-group-item">
      <a href="${link}">${title}</a>
      <button class="btn btn-primary float-right" data-target="#main-${id}" data-toggle="modal">Description</button>
      <div class="modal fade" id="main-${id}" aria-hidden="true">
      <div class="modal-dialog"><div class="modal-content">
      <div class="modal-header"><h4>${title}</h4></div>
      <div class="modal-body">${description}</div></div></div></div></li>`;

    ul.innerHTML = `${ul.innerHTML}
      <li class ="list-group-item">
      <a href="${link}">${title}</a>
      <button class="btn btn-primary float-right" data-target="#minor-${id}" data-toggle="modal">Description</button>
      <div class="modal fade" id="minor-${id}" aria-hidden="true">
      <div class="modal-dialog"><div class="modal-content">
      <div class="modal-header"><h4>${title}</h4></div>
      <div class="modal-body">${description}</div></div></div></div></li>`;
  });
  ulMain.innerHTML = `<h2>${nameFeed}</h2>${ulMain.innerHTML}`;
};
