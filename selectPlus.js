onload_functions.push(applyStructure);

function applyStructure(){
  const selects = document.querySelectorAll('.select-select');

  for(let select of selects){
    const parent = select.parentElement;

    const selectPlus_container = returnsGeneralSelectContainer(select);

    parent.innerHTML += selectPlus_container;
    applySelectedOptions(select.id);
  }
}

function returnsClasses(element){
  let classes = [];

  for(let __class of element.classList){
    classes.push(__class);
  }

  return classes;
}

function returnsGeneralSelectContainer(select){
  const options = returnsOptions(select);

  const selectPlus_HTML = returnsGeneralSelectContainerHTML(select, options);
  
  return selectPlus_HTML;
}

function returnsOptions(select){
  const options = select.children;

  let options_arr = [];
  for(let option of options){
    const obj = {
      value: option.value,
      text: option.innerText,
      disabled: option.disabled,
      selected: option.selected,
      classes: returnsClasses(option)
    }

    if(obj.selected){
      obj.classes.push("selected");
    }
    if(obj.disabled){
      obj.classes.push("disabled");
    }

    options_arr.push(obj);
  }

  return options_arr;
}

function returnsGeneralSelectContainerHTML(select, options){
  let select_classes = returnsClasses(select);

  let i = select_classes.indexOf('focus');

  if(i >= 0){
    select_classes[i] = "";
  }

  if(select.multiple){
    select_classes.push('multiple');
  }

  const selectPlus = `
    <div class="select-plus ${select_classes.join(' ')}" data-to="${select.id}" onclick="changeVisibility(this, 'origin')" data-delay="true">
      <div class="select-plus-bg" onclick="changeVisibility(this.parentElement)"></div>
      
      <div class="select-plus-content">
        <div class="selected-options"></div>

        <div class="select-options-container">
          <input type="search" oninput="searchOptions(this)">

          <div class="select-options-list">
            ${returnsSelectOptionsHTML(options)}
          </div>
        </div>
      </div>
    </div>
  `;

  select.innerHTML = '';

  return selectPlus;
}

function returnsSelectOptionsHTML(options){
  let options_HTML = '';

  for(let option of options){
    const option_HTML = `
      <div class="select-options ${option.classes.join(' ')}" data-value="${option.value}" onclick="selectOption(this)">${option.text}</div>
    `;

    options_HTML += option_HTML;
  }

  return options_HTML;
}

function returnsRealSelectOptionsHTML(option){
  const option_classes = returnsClasses(option);
  const value = option.dataset.value;
  const text  = option.innerText;

  const option_HTML = `
    <option class="${option_classes.join(' ')}" value="${value}" selected>${text}</option>
  `;
  
  return option_HTML;
}

function applySelectedOptions(id_select){
  const select = document.querySelector(`#${id_select}`);
  select.innerHTML = '';

  const selected_options_div = document.querySelector(`[data-to="${id_select}"] .selected-options`);
  const selected_options = document.querySelectorAll(`[data-to="${id_select}"] .select-options.selected`);
  const search_input     = document.querySelector(`[data-to="${id_select}"].focus .select-options-container > input`);

  let selected_options_arr = [];
  for(let selected_option of selected_options){
    selected_options_arr.push(selected_option.innerText);
    
    const real_option = returnsRealSelectOptionsHTML(selected_option);
    select.innerHTML += real_option;
  }
  let selected_options_txt = selected_options_arr.join(', ');
  
  selected_options_div.innerHTML = selected_options_txt;
  
  if(search_input){
    search_input.focus();
  }
}

// after applyed
function changeVisibility(selectPlus, origin){
  setTimeout(()=>{
    const data_to = selectPlus.dataset.to;
    let input = document.querySelector(`[data-to="${data_to}"] .select-options-container > input`);
    let options = document.querySelector(`[data-to="${data_to}"] .select-options-container > .select-options-list`).children;
  
    input.value = '';
    resetOptions(options);
  
    if(origin && !selectPlus.classList.contains('focus') && selectPlus.dataset.delay == 'true'){
      selectPlus.classList.add('focus');
      selectPlus.dataset.delay = true;
      input.focus();
    } else if(selectPlus.classList.contains('focus') && selectPlus.dataset.delay == 'true') {
      selectPlus.classList.remove('focus');
      delay(selectPlus);
    }
  }, 200);
}

function searchOptions(input){
  const options = input.parentElement.children[1].children;

  resetOptions(options);

  const search_value = input.value.toLowerCase();

  for(let option of options){
    const text = option.innerText.toLowerCase();

    if(text.indexOf(search_value) >= 0){
      option.classList.add('show');
    } else {
      option.classList.add('hide');
    }
  }
}

function resetOptions(options){
  for(let option of options){
    if(option.classList.contains('hide')){
      option.classList.remove('hide')
    }
    if(option.classList.contains('show')){
      option.classList.remove('show')
    }
  }
}

function selectOption(option){
  const selectPlus = option.parentElement.parentElement.parentElement.parentElement;
  
  if(!selectPlus.classList.contains('multiple')){
    const selected_options = document.querySelectorAll(`.select-plus[data-to="${selectPlus.dataset.to}"] .select-options.selected`);

    for(let selected_option of selected_options){
      selected_option.classList.remove('selected');
    }
  }

  if(option.classList.contains('selected')){
    option.classList.remove('selected');
  } else {
    option.classList.add('selected');
  }

  applySelectedOptions(selectPlus.dataset.to);
  delay(selectPlus);
}

function delay(selectPlus){
  selectPlus.dataset.delay = false;
  
  setTimeout(()=>{
    selectPlus.dataset.delay = true;
  },300);
}