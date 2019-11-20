let _works = [];

const $wrap = document.querySelector('#wrap');
const $mainWork = document.querySelector('.main-work');
const $addCategory = document.querySelector('.create-main-work');
const $mainCreateInput = document.querySelector('.main-create-input');

const ajax = (() => {
  const req = (method, url, payload) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.setRequestHeader('content-type', 'application/json');
      xhr.send(JSON.stringify(payload));
      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          resolve(xhr.response);
        }
      };
      xhr.onerror = () => {
        reject(new Error(xhr.status));
      };
    });
  };
  return {
    get(url) {
      return req('GET', url);
    },
    post(url, payload) {
      return req('POST', url, payload);
    },
    patch(url, payload) {
      return req('PATCH', url, payload);
    },
    delete(url) {
      return req('DELETE', url);
    }
  };
})();

const state = labels => {
  if (labels === undefined) return '';

  let html = '';

  labels = labels.filter(label => label.check);

  labels.forEach(label => {
    html += `
      <span class="${label.state}">${label.state}</span>`;
  });

  return html;
};

const subworkRender = (workId, subWork) => {
  let html = '';
  subWork.forEach(({ id, title, date, labels }) => {
    html += `
      <li id="${workId}-${id}" class="work-item" draggable="true">
        <a href="#self" class="detail-inner">
          <div class="importance">
            ${state(labels)}
          </div>
          <div class="title">${title}</div>
          <div class="date">${date}</div>
        </a>
        <button type="button" class="delete-detail-btn"><img src="./assets/images/common/delete-btn.png" class="delete-btn-img" alt=""></button>
       </li>`;
  });
  return html;
};

const render = works => {
  _works = works;

  let html = '';

  _works.forEach(work => {
    html += `
    <li id="${work.id}">
      <div class="title-box">
          <div class="title">${work.title}</div>
          <input type="text" class="modify-input" placeholder="주제를 입력해주세요">
      </div>
      <div class="detail-work-box">
        <ul class="detail-work" droppable="true">
        ${work.list ? subworkRender(work.id, work.list) : ''}
        </ul>
      </div>
      <div class="create-detail-work">
        <button type="button" class="btn40 c3 create-detail-btn">해야할일 추가</button>
        <input type="text" class="detail-create-input" placeholder="추가할 목록을 입력하세요">
      </div>
      <button type="button" class="delete-main-work">삭제</button>
    </li>`;
  });

  $mainWork.innerHTML = html;
  yRail();
};

const renderPopup = () => {
  const $node = document.createElement('div');

  $node.classList.add('popup-wrap');

  $node.innerHTML += `
    <div class="register-popup">
      <div class="popup-header">
        <div class="popup-title"><span class="a11y-hidden">주제:</span>11/08 프로젝트 주제 회의</div>
        <div class="popup-subtitle">in list <a href="#self">회의 내용</a></div>
        <div class="popup-created-time">19/01/01 12:12:12</div>
      </div>

      <button type="button" class="btn-close-popup layer-close">X</button>

      <div class="popup-main-content clear-fix">
        <div class="content-area">
          <div class="description-area">
            <div class="area-title">Description</div>
            <textarea class="description-content" placeholder="Add a more detailed Description.."></textarea>
            <button type="button" class="btn-save btn40 c5 mt10" style="width: 80px;">Save</button>
          </div>

          <div class="checklist-area">
            <div class="area-title">checklist</div>
            <div class="progress-contents">
              <span class="complete-percent">98%</span>
              <div class="progress-bar">
                <span class="success-bar" style="width: 50%"></span>
              </div>
            </div>
            <ul class="check-list">
              <li><label class="chk" for="check1"><input id="check1" type="checkbox"><span>ddasda</span></label></li>
              <li><label class="chk" for="check2"><input id="check2" type="checkbox"><span>ddasda</span></label></li>
            </ul>
            <button type="button" class="btn-check-add btn40 c5 mt20" style="width: 120px;">add an item</button>
            <button type="button" class="btn-delete btn30 c6" style="width: 100px;">delete</button>
          </div>
        </div>

        <div class="popup-add-ons">
          <div class="labels">
            <div class="title">LABELS</div>
            <ul class="colors-list">
              <li class="yellow">
                <label><input type="checkbox" class="state-check"><span>노랑색</span></span></label>
              </li>
              <li class="orange">
                <label><input type="checkbox" class="state-check"><span>주황색</span></span></label>
              </li>
              <li class="red">
                <label><input type="checkbox" class="state-check"><span>빨강색</span></span></label>
              </li>
              <li class="blue">
                <label><input type="checkbox" class="state-check"><span>파랑색</span></span></label>
              </li>
            </ul>
          </div>
          <div class="add-check">
            <button type="button" class="btn-checklist btn40 c2" style="width: 100%;">CHECKLIST</button>
          </div>
        </div>
      </div>`;

  $wrap.appendChild($node);
};

const getWork = () => {
  ajax.get('http://localhost:3000/works/')
    .then(res => JSON.parse(res))
    .then(render);
};

const getMaxId = () => {
  let maxId = 0;
  ajax.get('http://localhost:3000/works')
    .then(res => JSON.parse(res))
    .then(works => Math.max(0, ...works.map(work => work.id)) + 1)
    .then(id => maxId = id);

  return maxId;
};

const createWork = title => {
  ajax.post('http://localhost:3000/works/', { id: getMaxId(), title })
    .then(ajax.get('http://localhost:3000/works/').then(res => JSON.parse(res)).then(res => {
      $('#co-work-container').mCustomScrollbar('destroy');
      render(res);
      xRail();
    }));
};

const toggle = target => {
  target.classList.toggle('on', !target.classList.contains('on'));
  target.nextElementSibling.focus();
};

const currentTime = () => {
  const getDate = new Date();
  const year = ('' + getDate.getFullYear()).substring(2, 4);
  const month = getDate.getMonth() + 1;
  const day = getDate.getDate();
  const hour = getDate.getHours();
  const minute = getDate.getMinutes();
  const second = getDate.getSeconds();
  const subWorkDate = `${year}/${month}/${day}`;

  return subWorkDate;
};

const createSubwork = (workId, value) => {
  let maxId = 0;

  ajax.get(`http://localhost:3000/works/${workId}`)
    .then(res => JSON.parse(res))
    .then(work => {
      if (work.list === undefined) work['list'] = [];

      maxId = work.list.length ? Math.max(...[...work.list].map(subwork => subwork.id)) + 1 : 1;

      return [...work.list, { id: maxId, title: value, date: currentTime() }];
    })
    .then(subwork => {
      ajax.patch(`http://localhost:3000/works/${workId}`, { id: workId, list: subwork })
        .then(works => {
          $('.detail-work-box').mCustomScrollbar('destroy');
          getWork(works);
        });
    });
};

const workTitle = (workId, value) => {
  ajax.get(`http://localhost:3000/works/${workId}`)
    .then(res => JSON.parse(res).title)
    .then(ajax.patch(`http://localhost:3000/works/${workId}`, { id: workId, title: value }))
    .then(getWork);
};

const add = (target, keyCode) => {
  let value = target.value.trim();

  if (keyCode !== 13 || value === '') return;

  target.previousElementSibling.classList.remove('on');

  if (target.classList.contains('main-create-input')) {
    createWork(value);
  }

  if (target.classList.contains('detail-create-input')) {
    const workId = target.parentNode.parentNode.id;
    createSubwork(workId, value);
  }

  if (target.classList.contains('modify-input')) {
    const workId = target.parentNode.parentNode.id;
    workTitle(workId, value);
  }

  target.value = '';
};

const deleteWork = id => {
  ajax.delete(`http://localhost:3000/works/${id}`)
    .then(res => JSON.parse(res))
    .then(getWork);
};

const deleteSubwork = (titleId, subTitleId) => {
  ajax.get(`http://localhost:3000/works/${titleId}`)
    .then(res => JSON.parse(res).list)
    .then(subTitle => subTitle.filter(item => item.id !== +subTitleId))
    .then(subWork => ajax.patch(`http://localhost:3000/works/${titleId}`, { id: titleId, list: subWork }))
    .then(getWork);
};

const closePopup = (target) => {
  const $popup = target.parentNode.parentNode;

  $popup.remove();
};

const openPopup = () => {
  renderPopup();

  const $closeBtn = document.querySelector('.btn-close-popup');

  $closeBtn.onclick = ({ target }) => {
    closePopup(target);
  };
};


// Events
window.onload = () => {
  getWork();
};

$addCategory.onclick = ({ target }) => {
  toggle(target);
};

$mainWork.onfocusout = ({ target }) => {
  console.log(target);
};

$mainCreateInput.onkeyup = ({ target, keyCode }) => {
  add(target, keyCode);
};

$mainCreateInput.onblur = ({ target }) => {
  const value = target.value.trim();

  if (value !== '') return;
  target.previousElementSibling.classList.remove('on');
};

$mainWork.onclick = ({ target }) => {
  if (target.classList.contains('create-detail-btn') || target.classList.contains('title')) toggle(target);

  if (target.classList.contains('delete-main-work')) {
    const id = target.parentNode.id;

    deleteWork(id);
  }

  if (target.classList.contains('delete-btn-img')) {
    const { id } = target.parentNode.parentNode;
    let titleId = `${id}`.split('-')[0];
    let subTitleId = `${id}`.split('-')[1];

    deleteSubwork(titleId, subTitleId);
  }

  if (target.parentNode.classList.contains('detail-inner')) {
    openPopup();
  }
};

$mainWork.onkeyup = ({ target, keyCode }) => {
  add(target, keyCode);
};