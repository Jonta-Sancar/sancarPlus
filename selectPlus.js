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
		input.addEventListener("focusin", ()=>{
			focus(input, to_id, "on");
		});
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
			container_options.style.display = 'none';
		}
	}
}

function makeSelect(select, order){
	const select_id    = select.id;
	
	let   is_multiple  = 'false';
	if (select.classList.contains('multiple')) {
		is_multiple = 'true';
	}

	let add_option = 'false';
	if (select.classList.contains('add-option')) {
		add_option = 'true';
	}
	
	const options      = select.children;
	let   options_list = '';
	for (var i = 0; i < options.length; i++) {
		const value  = options[i].value;
		const inner  = options[i].innerHTML;

		let fixed = '';
		if (options[i].classList.contains('fixed')) {
			fixed = ' fixed';
		}
		const option = `
					<li onclick="changeOptionState(this)" class="select-option${fixed}" data-option_value="${value}">${inner}</li>
		`;
		options_list += option;
	}
	select.innerHTML = '';
	const selectHTML = `
	<div class="select-sup-container">
		${select.outerHTML}
		<div class="select-container">
			<div class="select-content">
				<div class="select-search" data-add_option="${add_option}" id="div-search-${order}">
					<div  class="select-search-selecteds">
					</div>
					<input onkeydown="deleteOption(this, event)" data-to_id="div-search-${order}" data-to_options="options-${order}" oninput="showMatches(this)"  type="text" class="select-search" placeholder="Buscar">
				</div>
			</div>
			<div class="select-content options">
				<ul data-is_multiple="${is_multiple}" data-to_search="div-search-${order}" data-to_select="${select_id}" class="select-list" id="options-${order}">
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
	}
}

function focus(input, to_id, status) {
	const window_height = window.innerHeight;
	const max_height    = window_height - 300;
	const element = document.getElementById(to_id);
	element.dataset.focus = status;

	const div_container     = (element.parentElement).parentElement;
	const positionY = div_container.getBoundingClientRect().y;
	
	if (positionY > max_height) {
		div_container.style.top    = 'auto';
		div_container.style.bottom = '-2px';
		div_container.style.flexDirection = 'column-reverse';


	}
	const options = div_container.children[1];

	const ul = options.children[0];
	const options_list = ul.children;
	resetOptions(options_list);
	if (status == "on") {
		options.style.display = "block";
		div_container.style.boxShadow = "0px 0px 5px #0006";
		div_container.style.zIndex    = "10000";

		const container_height = div_container.clientHeight;
		if (container_height > 300) {
			div_container.style.maxHeight = '300px';

			const div_content_options = div_container.children[1];
			div_content_options.style.overflowY = 'scroll';
		}
	} else {
		options.style.display = "none";
		div_container.style.boxShadow = "";
		div_container.style.zIndex    = "0";
		div_container.style = '';
		input.value = '';
	}
}

function deleteOption(input, e) {
	if(e.key == 'Backspace' || e[0] == 'delete'){
		if (input.value == '' || e[0] == 'delete') {
			const div_search = input.parentElement;
			
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
				
				const new_option_value      = encodeURI(original_value);
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
				
				const new_option_value      = encodeURI(original_value);
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
	const input            = search.children[1];

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
	<option id="op-${order}" value="${value}" selected>${Inner}</option>
	`;

	const option_view = `
	<span data-to_id="op-${order}" data-is_added="${is_added}" data-is_fixed="${is_fixed}" data-option_value="${value}" data-option_inner="${Inner}" class="select-search">${Inner}<div class="select-search-cancel" onclick="deleteOption(((this.parentElement).parentElement).parentElement.children[1], ['delete', this.parentElement])">X</div></span>
	`;

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
}