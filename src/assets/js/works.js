export default () => {
  // DOMs
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
  const subworkRender = subWork => {
    let html = '';
    subWork.forEach(({ id, title, date, labels }) => {
      html += `
        <li id="${id}" class="work-item" draggable="true">
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
    let html = '';
    works.forEach(work => {
      html += `
      <li id="${work.id}">
        <div class="title-box">
            <div class="title">${work.title}</div>
            <input type="text" class="modify-input" placeholder="주제를 입력해주세요">
        </div>
        <div class="detail-work-box">
          <ul class="detail-work" droppable="true">
          ${work.list ? subworkRender(work.list) : ''}
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
  const labelState = labels => {
    let html = '';
    labels.forEach(label => {
      html += `
        <li id="${label.state}">
          <label><input type="checkbox" class="state-check" ${label.check ? 'checked' : ''}><span>low</span></span></label>
        </li>`;
    });
    return html;
  };
  const descriptionDisplay = description => {
    let html = '';
    if (description === undefined) {
      html += `
      <textarea class="description-content" placeholder="Add a more detailed Description.."></textarea>
      <div class="description-textbox hide">${description}</div>
      <button type="button" class="description-btn save btn40 mt10" style="width: 80px;">Save</button>`;
    } else {
      html += `
      <textarea class="description-content hide" placeholder="Add a more detailed Description..">${description}</textarea>
      <div class="description-textbox">${description}</div>
      <button type="button" class="description-btn modify btn40 mt10" style="width: 80px;">Modify</button>`;
    }
    return html;
  };

  const checklistDisplay = checklist => {
    if (checklist === undefined) return '';

    let html = '';

    checklist.forEach(list => {
      html += `
        <li>
          <label class="chk" for="${list.id}">
            <input id="${list.id}" type="checkbox" ${list.completed ? 'checked' : ''}><span>${list.content}</span>
          </label>
        </li>`;
    });

    return html;
  };

  const checkProgress = checklist => {
    if (checklist === undefined) return '0%';

    const allCount = +checklist.length;
    const checkCount = +checklist.filter(list => list.completed).length;
    const currentPer = `${`${(100 / allCount) * checkCount}%`}`;

    return currentPer;
  };

  const renderPopup = (workTitle, subWorkTitle, writeDate, labels, description, checklist) => {
    const $node = document.createElement('div');
    $node.classList.add('popup-wrap');
    $node.innerHTML += `
      <div class="dim"></div>
      <div class="register-popup">
        <div class="popup-header">
          <div class="popup-title"><span class="a11y-hidden">주제:</span>${subWorkTitle}</div>
          <div class="popup-subtitle">in list <a href="#self">${workTitle}</a></div>
          <div class="popup-created-time">${writeDate}</div>
        </div>
        <button type="button" class="btn-close-popup">X</button>
        <div class="popup-main-content clear-fix">
          <div class="content-area">
            <div class="description-area">
              <div class="area-title">Description</div>
              ${descriptionDisplay(description)}
            </div>
            <div class="checklist-area hide">
              <div class="area-title">checklist</div>
              <div class="progress-contents">
                <span class="complete-percent">${checkProgress(checklist)}</span>
                <div class="progress-bar">
                  <span class="success-bar" style="width: ${checkProgress(checklist)}"></span>
                </div>
              </div>
              <ul class="check-list">
                ${checklistDisplay(checklist)}
              </ul>
              <div class="add-checklist-box">
                <input type="text" class="add-checklist-input" placeholder="Add a more Checklist.." />
                <button type="button" class="btn-check-add btn40 c5" style="width: 120px;">add an item</button>
              </div>
            </div>
          </div>
          <div class="popup-add-ons">
            <div class="labels">
              <div class="title">LABELS</div>
              <ul class="colors-list">
                ${labelState(labels)}
              </ul>
            </div>
            <div class="add-check">
              <button type="button" class="btn-checklist btn40 c2" style="width: 100%;">CHECKLIST SHOW</button>
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
    ajax.get('http://localhost:3000/works')
      .then(res => JSON.parse(res))
      .then(works => Math.max(0, ...works.map(work => work.id)) + 1)
      .then(id => maxId = id);
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
        maxId = work.list.length ? work.list.length + 1 : 1;
        return [...work.list, { id: +`${workId}0${maxId}`, title: value, date: currentTime(), labels: [{ state: 'low', check: false }, { state: 'medium', check: false }, { state: 'high', check: false }, { state: 'veryhigh', check: false }] }];
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
    if (target.value === undefined) return;
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
  const openPopup = (titleId, subTitleId) => {
    let workTitle = null;
    let workList = null;
    let subWorkTitle = null;
    let writeDate = null;
    let labels = null;
    let description = null;
    let checklist = null;

    ajax.get(`http://localhost:3000/works/${titleId}`)
      .then(work => JSON.parse(work))
      .then(work => {
        workTitle = work.title;
        workList = work.list;
        return workList;
      })
      .then(subworks => subworks.filter(subwork => subwork.id === +subTitleId))
      .then(subwork => {
        subWorkTitle = subwork[0].title;
        writeDate = subwork[0].date;
        labels = subwork[0].labels;
        description = subwork[0].description;
        checklist = subwork[0].checklist;

        renderPopup(workTitle, subWorkTitle, writeDate, labels, description, checklist);

        const $popup = document.querySelector('.popup-wrap');
        const $labels = document.querySelector('.labels');
        const $btnChecklist = document.querySelector('.btn-checklist');
        const $checklistArea = document.querySelector('.checklist-area');
        const $descriptionTextarea = document.querySelector('.description-content');
        const $descriptionBtn = document.querySelector('.description-btn');
        const $descriptionTextbox = document.querySelector('.description-textbox');
        const $checkListInput = document.querySelector('.add-checklist-input');
        const $checkListAddBtn = document.querySelector('.btn-check-add');
        const $checklist = document.querySelector('.check-list');

        $btnChecklist.onclick = () => {
          $btnChecklist.textContent === 'CHECKLIST HIDE' ? $btnChecklist.innerHTML = 'CHECKLIST SHOW' : $btnChecklist.textContent = 'CHECKLIST HIDE';

          $checklistArea.classList.toggle('hide');
        };
        $descriptionBtn.onclick = () => {
          if ($descriptionBtn.classList.contains('save')) {
            if ($descriptionTextarea.value.trim() !== '') {
              $descriptionTextarea.classList.add('hide');
              $descriptionBtn.classList.remove('save');
              $descriptionBtn.classList.add('modify');
              $descriptionBtn.textContent = 'Modify';
              $descriptionTextbox.classList.remove('hide');
              $descriptionTextbox.textContent = $descriptionTextarea.value;

              ajax.get(`http://localhost:3000/works/${titleId}`)
                .then(res => JSON.parse(res).list)
                .then(subTitle => subTitle.filter(item => item.id === +subTitleId))
                .then(subWorks => {
                  subWorks[0]['description'] = `${$descriptionTextarea.value}`;

                  return subWorks[0]['description'];
                })
                .then(description => {
                  const data = workList.map(subwork => subwork.id === +subTitleId ? subwork = { ...subwork, id: +subTitleId, description } : subwork);

                  ajax.patch(`http://localhost:3000/works/${titleId}`, {
                    id: +titleId,
                    title: workTitle,
                    list: data
                  });
                });
            }
          } else {
            $descriptionTextarea.classList.remove('hide');
            $descriptionBtn.classList.remove('modify');
            $descriptionBtn.classList.add('save');
            $descriptionBtn.textContent = 'Save';
            $descriptionTextbox.classList.add('hide');

            ajax.get(`http://localhost:3000/works/${titleId}`)
              .then(res => JSON.parse(res).list)
              .then(subTitle => subTitle.filter(item => item.id === +subTitleId))
              .then(subWorks => {
                if (subWorks[0].description === undefined) subWorks[0]['description'] = `${$descriptionTextarea.value}`;

                return subWorks[0]['description'];
              })
              .then(description => {
                const data = workList.map(subwork => subwork.id === +subTitleId ? subwork = { ...subwork, id: +subTitleId, description } : subwork);

                ajax.patch(`http://localhost:3000/works/${titleId}`, {
                  id: +titleId,
                  title: workTitle,
                  list: data
                });
              });
          }
        };

        $labels.onchange = ({ target }) => {
          const stateId = target.parentNode.parentNode.id;
          subwork[0].labels.map(label => label.state === stateId ? label.check = !label.check : label);
          const data = workList.map(item => item.id === +subTitleId ? item = { ...item, id: +subTitleId, labels: subwork[0].labels } : item);
          ajax.patch(`http://localhost:3000/works/${titleId}`, {
            id: +titleId,
            title: workTitle,
            list: data
          })
            .then(newWorks => JSON.parse(newWorks))
            .then(newWorks => {
              ajax.get('http://localhost:3000/works/')
                .then(works => JSON.parse(works))
                .then(render);
            });
        };

        $checkListAddBtn.onclick = () => {
          if ($checkListInput.value.trim() === '' && $checklist.children.length < 4) return alert('값을 입력해주세요');
          if ($checklist.children.length >= 4) return alert('최대 4개까지 입력할 수 있습니다');

          const content = $checkListInput.value;

          ajax.get(`http://localhost:3000/works/${titleId}`)
            .then(res => JSON.parse(res))
            .then(work => work.list)
            .then(subwork => {
              if (subwork[0].checklist === undefined) subwork[0]['checklist'] = [];

              const maxId = subwork[0].checklist.length ? subwork[0].checklist.length + 1 : 1;

              const checklistValue = [...subwork[0].checklist, { id: `check${titleId}0${maxId}`, content, completed: false }];

              const data = workList.map(item => item.id === +subTitleId ? { ...item, id: +subTitleId, checklist: checklistValue } : item);

              ajax.patch(`http://localhost:3000/works/${titleId}`, {
                id: +titleId,
                title: workTitle,
                list: data
              })
                .then(res => {
                  $checklist.innerHTML += `
                    <li>
                      <label class="chk" for="check${titleId}0${maxId}">
                        <input id="check${titleId}0${maxId}" type="checkbox"><span>${content}</span>
                      </label>
                    </li>`;
                  $checkListInput.value = '';
                });
            });
        };

        $checklist.onchange = ({ target }) => {

          ajax.get(`http://localhost:3000/works/${titleId}`)
            .then(res => JSON.parse(res))
            .then(work => work.list)
            .then(subwork => {
              const subWork = subwork.filter(sub => sub.id === +subTitleId);
              const checklist = subWork[0].checklist.map(check => check.id === target.id ? { ...check, completed: !check.completed } : check);

              const data = workList.map(item => item.id === +subTitleId ? { ...item, id: +subTitleId, checklist } : item);

              ajax.patch(`http://localhost:3000/works/${titleId}`, {
                id: +titleId,
                title: workTitle,
                list: data
              })
                .then(console.log)
            });
        };

        $popup.onclick = e => {
          if (e.target.classList.contains('btn-close-popup') || e.target.classList.contains('dim')) {
            $popup.remove();

            e.stopPropagation();
          }
        };
      });

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
      const titleId = target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.id;
      const subTitleId = target.parentNode.parentNode.id;
      console.log(titleId, subTitleId);
      deleteSubwork(titleId, subTitleId);
    }
    if (target.parentNode.classList.contains('detail-inner')) {
      const titleId = target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.id;
      const subTitleId = target.parentNode.parentNode.id;
      openPopup(titleId, subTitleId);
    }
  };
  $mainWork.onkeyup = ({ target, keyCode }) => {
    add(target, keyCode);
  };
};