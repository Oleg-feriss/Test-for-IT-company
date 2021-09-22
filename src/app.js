const tableBody = document.querySelector('tbody');
const template = document.getElementById('data-list');
const paginationElement = document.getElementById('pagination');
const searchByName = document.getElementById('name-search');
const selectStates = document.getElementById('filter-by-state');
const tableHeads = document.querySelectorAll('th');

let nameSearch;
let stateSearch;
let data;
let rows = 20;
let currentPage = 1;

function sendHttpRequest(url) {
  return fetch(url)
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return response.json();
      } else {
        return response.json().then((errData) => {
          console.log(errData);
          throw new Error('Something went wrong - server-side!');
        });
      }
    })
    .catch((error) => {
      console.log(error);
      throw new Error('Something went wrong!');
    });
}

async function fetchDataList() {
  if ('content' in document.createElement('template')) {
    try {
      const response = await sendHttpRequest(
        'https://itrex-react-lab-files.s3.eu-central-1.amazonaws.com/react-test-api.json'
      );

      data = response;

      displayListOfElements(data, tableBody, rows, currentPage);
      setupPagination(data, paginationElement, rows);

      createListOfStates();
      sortAllElementsByArrow();
    } catch (error) {
      alert(error.message);
      console.log(error.response);
    }
  }
}

function arrowSearchHelper(text) {
  return text.toUpperCase();
}

function filterByArrow() {
  if (nameSearch && stateSearch === 'ALL') {
    return (filtered = filterByName(nameSearch));
  } else if (nameSearch && stateSearch !== 'ALL') {
    return (filtered = filterByStateAndName(stateSearch, nameSearch));
  } else if (
    !nameSearch &&
    (stateSearch === 'ALL' || stateSearch === undefined)
  ) {
    return data;
  } else {
    return (filtered = filterByState(stateSearch, nameSearch));
  }
}

function checkErrowClass(tableHead, element, primer, dataToSort) {
  dataToSort = filterByArrow();

  for (head of tableHeads) {
    if (tableHead !== head) head.className = '';
  }
  if (tableHead.classList.length === 0) {
    tableHead.className = 'arrow-down';
    const sorted = dataToSort.sort(sortElements(element, false, primer));
    createDomElements(sorted);
  } else if (tableHead.className === 'arrow-down') {
    tableHead.classList.toggle('arrow-up');
    const sorted = dataToSort.sort(sortElements(element, true, primer));
    createDomElements(sorted);
  } else {
    tableHead.classList.toggle('arrow-up');
    const sorted = dataToSort.sort(sortElements(element, false, primer));
    createDomElements(sorted);
  }
}

function sortAllElementsByArrow() {
  for (const tableHead of tableHeads) {
    eventLisener = tableHead.addEventListener('click', function (event) {
      value = event.target.textContent;

      switch (value) {
        case 'id':
          checkErrowClass(event.target, value, parseInt);
          break;
        case 'First name':
          checkErrowClass(event.target, 'firstName', arrowSearchHelper);
          break;
        case 'Last name':
          checkErrowClass(event.target, 'lastName', arrowSearchHelper);
          break;
        case 'Email':
          checkErrowClass(event.target, 'email', arrowSearchHelper);
          break;
        case 'Phone':
          checkErrowClass(event.target, 'phone', arrowSearchHelper);
          break;
        case 'State':
          checkErrowClass(event.target, 'adress', (text) => {
            return text.state;
          });
          break;
      }
    });
  }
}

function sortElements(field, reverse, primer) {
  const key = primer
    ? function (param) {
        return primer(param[field]);
      }
    : function (param) {
        return param[field];
      };

  reverse = !reverse ? 1 : -1;

  return function (a, b) {
    return (a = key(a)), (b = key(b)), reverse * ((a > b) - (b > a));
  };
}

function createListOfStates() {
  const states = [];
  for (item of data) {
    states.push(item.adress.state);
  }

  function uniqueStates(arr) {
    return Array.from(new Set(arr));
  }

  for (state of uniqueStates(states)) {
    const newOption = document.createElement('option');
    newOption.textContent = state;
    newOption.value = state;
    selectStates.append(newOption);
  }

  selectStates.addEventListener('change', selectStateHandler);
}

function selectStateHandler(event) {
  let getValue = event.target.value;
  stateSearch = getValue;

  if (nameSearch && getValue === 'ALL') {
    const filtered = filterByName(nameSearch);
    createDomElements(filtered);
  } else if (nameSearch && getValue !== 'ALL') {
    const filtered = filterByStateAndName(getValue, nameSearch);
    createDomElements(filtered);
  } else if (!nameSearch && getValue === 'ALL') {
    createDomElements(data);
  } else {
    const filtered = filterByState(getValue, nameSearch);
    createDomElements(filtered);
  }
}

function searchByNameHandler(event) {
  let val = event.target.value.trim().toLowerCase();
  nameSearch = val;
  if (stateSearch !== 'ALL' && stateSearch !== undefined) {
    const filtered = filterByStateAndName(stateSearch, val);
    createDomElements(filtered);
  } else {
    const filtered = filterByName(val);
    createDomElements(filtered);
  }
}

function filterByStateAndName(state, name) {
  const result = data
    .filter((item) => item.adress.state === state)
    .filter((user) => user.firstName.toLowerCase().indexOf(name) !== -1);
  return result;
}

function filterByName(name) {
  const result = data.filter(
    (user) => user.firstName.toLowerCase().indexOf(name) !== -1
  );
  return result;
}

function filterByState(state) {
  const result = data.filter((item) => item.adress.state === state);
  return result;
}

function createDomElements(result) {
  currentPage = 1;
  displayListOfElements(result, tableBody, rows, currentPage);
  setupPagination(result, paginationElement, rows);
}

function displayListOfElements(items, wrapper, rowsPerPage, page) {
  wrapper.innerHTML = '';
  page--;
  let start = rowsPerPage * page;
  let end = start + rowsPerPage;
  let paginatedItems = items.slice(start, end);

  for (const element of paginatedItems) {
    const postEl = document.importNode(template.content, true);
    const tableData = postEl.querySelectorAll('td');
    const tableRow = postEl.querySelector('tr');

    tableData[0].textContent = element.id;
    tableData[1].textContent = element.firstName;
    tableData[2].textContent = element.lastName;
    tableData[3].textContent = element.email;
    tableData[4].textContent = element.phone;
    tableData[5].textContent = element.adress.state;

    wrapper.append(postEl);

    detailedInformationHandler(tableRow, element);
  }
}

function setupPagination(items, wrapper, rowsPerPage) {
  wrapper.innerHTML = '';

  let pageCount = Math.ceil(items.length / rowsPerPage);
  for (let i = 1; i < pageCount + 1; i++) {
    let btn = paginationButton(i, items);
    wrapper.appendChild(btn);
  }
}

function paginationButton(page, items) {
  let button = document.createElement('button');
  button.innerText = page;

  if (currentPage === page) button.classList.add('active');

  button.addEventListener('click', function () {
    currentPage = page;
    displayListOfElements(items, tableBody, rows, currentPage);

    let currentBtn = document.querySelector('.page-numbers button.active');
    currentBtn.classList.remove('active');
    button.classList.add('active');
  });

  return button;
}

function detailedInformationHandler(tr, item) {
  tr.addEventListener('click', () => {
    const detailedInformation = document.getElementById('detailed-info');
    detailedInformation.className = 'visible';
    detailedInformation.innerHTML = `
      <p><b>Profile info:</b></p>
      <p><b>Selected profile:</b> ${item.firstName} ${item.lastName}</p>
      <p><b>Description:</b> ${item.description}</p>
      <p><b>Address:</b> ${item.adress.streetAddress}</p>
      <p><b>City:</b> ${item.adress.city}</p>
      <p><b>State:</b> ${item.adress.state}</p>
      <p><b>Index:</b> ${item.adress.zip}</p>
    `;
    detailedInformation.scrollIntoView({ behavior: 'smooth' });
  });
}

fetchDataList();

searchByName.addEventListener('input', searchByNameHandler);
