firstHandler();
function firstHandler(){
	let selects = document.querySelectorAll('.select-select');

	let forms_container = [];
	for (let select of selects) {
		const parent_element = select.parentElement;
		const length = forms_container.length;
		if (length > 0 && parent_element == forms_container[length-1].form) {
			forms_container[length-1].selects.push(select);
		} else {
			forms_container.push({form: parent_element, selects:[select]})
		}
	}

	if(selects.length > 0){
		let count = 0;
		for (let container_info of forms_container){
			let form_content = [];
			const form_container    = container_info.form;
			const selects_container = container_info.selects;
			for(let content of form_container.children) {
				form_content.push(content);
			}
			let last_positions = [];
			for(let select of selects_container) {
				select.style.display = 'none';
				const position_select = form_content.indexOf(select);
				if (last_positions.indexOf(position_select) < 0) {

					last_positions.push(position_select);
				}
				const selectHTML = makeSelect(select, count);
				form_content[position_select] = selectHTML;

				let new_form_content = '';
				for (var i = 0; i < form_content.length; i++) {
					if (last_positions.indexOf(i) < 0) {

						new_form_content += form_content[i].outerHTML;
					}
					else {

						new_form_content += form_content[i];
					}
				}
				form_container.innerHTML = new_form_content;

			count++;
			}
		}
	}
	

	const inputs = document.querySelectorAll('input.select-search');
	for(let input of inputs) {
		const to_id = input.dataset.to_id;
		input.addEventListener("focusout", ()=>{
			setTimeout(()=>{

				focus(input, to_id, "off");
			},150);
		});
	}

	const options = document.querySelectorAll('.select-option');
	resetOptions(options);
	
	const contents = document.querySelectorAll('.select-content');
	for(let container_options of contents) {
		if (container_options.classList.contains("options")) {
			const container = container_options.parentElement;
			container.style.width = `${container.clientWidth}px`;
			container.dataset.width = container.clientWidth;
			container_options.style.height = '0px';

			container.style.width = 'fit-content';
			if(container.clientWidth > container.dataset.width){
				container.style.width = container.dataset.width;
			}
		}
	}
}

function makeSelect(select, order){
	const select_id    = select.id;
	
	let select_search_selected = "select-search-selected";
	let is_multiple  = 'false';
	if (select.classList.contains('multiple')) {
		select_search_selected = "select-search-selecteds";
		is_multiple = 'true';
	}

	let add_option = 'false';
	if (select.classList.contains('add-option')) {
		add_option = 'true';
	}

	let option_wrap = '';
	if (select.classList.contains('nowrap')) {
		option_wrap = ' select-option-nowrap';
	}

	let width_handler = '';
	if (select.classList.contains('full-width')) {
		width_handler = ' select-full-width';
	} else if (select.classList.contains('min-width')) {
		width_handler = ' select-content-width';
	}
	
	const options      = select.children;
	let   options_list = '';
	for (var i = 0; i < options.length; i++) {
		const value  = options[i].value;
		const inner  = options[i].innerHTML;

		let selected = '';
		if(options[i].selected){
			const attrs = options[i].attributes;
			for(let attr of attrs){
				if(attr.name == "selected"){
					selected = ' selected';
				}
			}
		}

		let fixed = '';
		if (options[i].classList.contains('fixed')) {
			fixed = ' fixed';
		}
		const option = `
					<li onclick="changeOptionState(this)" class="select-option${fixed + selected}" data-option_value="${value}">${inner}</li>
		`;
		options_list += option;
	}
	select.innerHTML = '';
	const selectHTML = `
	<div class="select-sup-container${width_handler}">
		${select.outerHTML}
		<div class="select-container${width_handler}">
			<div class="select-content">
				<div class="select-search" onclick="focusIn(this, 'input-search-${order}')" data-add_option="${add_option}" id="div-search-${order}">
					<div  class="${select_search_selected}">
					</div>
					<div class="select-arrow-down-container"><span class="select-arrow-down"></span></div>
				</div>
			</div>
			<div class="select-content options" style="padding: 0px 5px;">
					<input id="input-search-${order}" onkeydown="deleteOption(this, event)" data-to_id="div-search-${order}" data-to_options="options-${order}" oninput="showMatches(this)"  type="text" class="select-search" placeholder="Buscar">
					<ul data-is_multiple="${is_multiple}" data-to_search="div-search-${order}" data-to_select="${select_id}" class="select-list${option_wrap}" id="options-${order}">
					${options_list}
					<li onclick="changeOptionState(this)" class="select-option add" data-option_value="empty">Empty</li>
				</ul>
			</div>
		</div>
	</div>
	`;

	return selectHTML;
}

function resetOptions(options){
	for(let option of options) {
		if (!option.classList.contains("fixed")) {
			option.style.display = 'none';
		} else {
			option.style.display = 'list-item';
		}

		if (option.classList.contains("selected")) {
			changeOptionState(option);
		}
	}
}

function focusIn(div_search, to_input){
	const to_id = div_search.id;
	const input = document.getElementById(to_input);
	let status = "on";
	if(div_search.dataset.focus == "on"){
		status = "off";
	}
	focus(input, to_id, status);
}

function focus(input, to_id, status) {
	const window_height = window.innerHeight;
	const max_height    = window_height - 300;
	const element = document.getElementById(to_id);
	element.dataset.focus = status;

	const div_container     = (element.parentElement).parentElement;
	const positionY = div_container.getBoundingClientRect().y;
	
	const options = div_container.children[1];

	div_container.style.top = '0px';

	const div_search = (div_container.children[0]).children[0];
	const arrow = div_search.children[1].children[0];
	
	const ul = options.children[0];
	const options_list = ul.children;
	resetOptions(options_list);
	if (status == "on") {
		input.focus();
		showMatches(input);
		options.style.padding   = "";
		options.style.height    = "fit-content";
		options.style.boxShadow = "0px 0px 5px #0006";
		div_container.style.boxShadow = "0px 0px 5px #0006";
		div_container.style.zIndex    = "10000";

		arrow.style.borderBottom = '5px solid #000';
		arrow.style.borderTop    = 'none';

		const container_height = div_container.clientHeight;
		if (container_height > 300) {
			options.style.maxHeight = '300px';
			options.style.overflowY = 'auto';
			
			const div_content_options = div_container.children[1];
			div_content_options.style.overflowY = 'scroll';
		}
	} else {
		input.blur();
		options.style.padding = "0 5px";
		options.style.height  = "0px";
		div_container.style.boxShadow = "";
		div_container.style.zIndex    = "";
		div_container.style.top = '';
		input.value = '';
		
		arrow.style.borderBottom = '';
		arrow.style.borderTop    = '';
	}
}

function deleteOption(input, e) {
	if(e.key == 'Backspace' || e[0] == 'delete'){
		if (input.value == '' || e[0] == 'delete') {
			const div_search = document.getElementById(input.dataset.to_id);
			
			const options_selected = div_search.children[0];
			
			const options_selected_list = options_selected.children;
			if (options_selected_list.length > 0) {
				const options = document.getElementById(input.dataset.to_options);
				const select  = document.getElementById(options.dataset.to_select);

				let last_option = options_selected_list[options_selected_list.length-1];
				if (e[0] == 'delete') {
					last_option = e[1];
				}

				const value = last_option.dataset.option_value;
				const inner = last_option.dataset.option_inner;
				const is_fixed = last_option.dataset.is_fixed;
				const is_added = last_option.dataset.is_added;

				const select_option = document.getElementById(last_option.dataset.to_id);

				const option = `
				<li onclick="changeOptionState(this)" class="select-option ${is_fixed}" data-option_value="${value}">${inner}</li>
				`;

				if (is_added != 'add') {

					options.innerHTML += option;
				}

				last_option.remove();
				select_option.remove();

				const content       = div_search.parentElement;
				const container     = content.parentElement;
				const sup_container = container.parentElement;
				const sup_height    = sup_container.clientHeight;
				if(sup_height < 30){
					sup_container.style.height = '30px';

					div_search.style.height = '100%';
					content.style.height    = '100%';
					container.style.height  = '100%';
				}

				const container_width = container.clientWidth;
				if(container_width < container.dataset.width){
					container.style.width  = `${container.dataset.width}px`;
				}

			}	
		}
	}
}

function showMatches(input) {
	const original_value = input.value;
	const value          = (input.value).toLowerCase();
	const to_options     = input.dataset.to_options;
	const options_list   = document.getElementById(to_options);
	const to_id      = input.dataset.to_id;
	const div_search = document.getElementById(to_id);
	const options    = options_list.children;

	options_list.style = '';

	let exists_option = false;

	if (value != '') {
		for(let option of options) {
			const inner = (option.innerHTML).toLowerCase();
			
			if (inner.indexOf(value) >= 0 && !option.classList.contains("add")) {
				
				option.style.display = 'list-item';
				exists_option = true;
			
			} else if (!exists_option && option.classList.contains("add") && div_search.dataset.add_option == "true") {

				option.style.display        = 'list-item';
				option.innerHTML            = "<strong>Add: </strong>"+original_value;
				
				const new_option_value      = original_value;
				option.dataset.option_value = new_option_value;

			} else {
				
				option.style.display = 'none';
			}
		}
	} else {
		for(let option of options) {					
			if (option.classList.contains("fixed") && !option.classList.contains("add")) {
				
				option.style.display = 'list-item';
				exists_option = true;

			} else if (!exists_option && option.classList.contains("add") && div_search.dataset.add_option == "true") {

				option.style.display        = 'list-item';
				option.innerHTML            = "<strong>Add: </strong>"+original_value;
				
				const new_option_value      = original_value;
				option.dataset.option_value = new_option_value;

			} else {
				
				option.style.display = 'none';
			}
		}
	}
}

function changeOptionState(option) {
	const options_list = option.parentElement;
	const is_multiple  = options_list.dataset.is_multiple;
	const select_id    = options_list.dataset.to_select;
	const select       = document.getElementById(select_id);

	const search_id        = options_list.dataset.to_search;
	const search           = document.getElementById(search_id);
	const options_selected = search.children[0];
	const options          = options_selected.children;

	const content_options  = options_list.parentElement;
	const input            = content_options.children[0];

	const order = options.length;

	const value = option.dataset.option_value;
	const inner = option.innerHTML;
	let   Inner = inner;

	let is_fixed = '';
	if (option.classList.contains('fixed')) {
		is_fixed = ' fixed';
	}

	let is_added = '';
	if (option.classList.contains('add')) {
		is_added = 'add';
		Inner = inner.split('</strong>')[1];
	}
	if (Inner == '') { return;}

	const option_element = `
	<option id="${select_id + value}-op-${order}" value="${value}" selected>${Inner}</option>
	`;

	let option_view = `
	<span data-to_id="${select_id + value}-op-${order}" data-is_added="${is_added}" data-is_fixed="${is_fixed}" data-option_value="${value}" data-option_inner="${Inner}" class="select-search">${Inner}<div class="select-search-cancel" onclick="deleteOption(document.getElementById('${input.id}'), ['delete', this.parentElement])">X</div></span>
	`;
	
	if (is_multiple == 'false') {
	
		option_view = `
		<span data-to_id="${select_id + value}-op-${order}" data-is_added="${is_added}" data-is_fixed="${is_fixed}" data-option_value="${value}" data-option_inner="${Inner}" class="select-search-selected">${Inner}</span>
		`;
	}

	if (option.classList.contains('add')) {

		option.dataset.option_value = 'Empty';
		option.innerHTML = 'empty';

	} else {

		option.remove();
	}

	if (is_multiple == 'false') {

		deleteOption(input,['delete',options[0]]);
	}

	select.innerHTML += option_element;
	
	options_selected.innerHTML += option_view;
	
	options_selected.style.paddingRight = "18px";


	const content_search = search.parentElement;
	const container      = content_search.parentElement;
	const sup_container  = container.parentElement;

	search.style.height         = 'fit-content';
	content_search.style.height = 'fit-content';
	container.style.height      = 'fit-content';
	sup_container.style.height  = 'fit-content';
	
	container.style.width        = 'fit-content';
	const container_actual_width = container.clientWidth;

	if(container_actual_width < container.dataset.width){
		container.style.width = `${container.dataset.width}px`;
	}
}