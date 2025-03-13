// mask functions
function mask(input, persistent_format, placeholder) {
  const value = input.value;
  const mask_formats = sortFormats(input.dataset.format);
  
  const acepted_values = returnsAceptedValues(input.dataset.aceptedValues);

  const new_value = filterValueToMask(value, acepted_values);

  const format_arr = selectFormatToMask(mask_formats, new_value);
  
  const val_arr = new_value.split('');

  const value_final = applyFormat(format_arr, val_arr, persistent_format, placeholder);

  input.value = value_final;
}

function sortFormats(formats){
  return formats.split('||').sort((v1, v2)=>{
    if(v1.length > v2.length){
      return 1;
    } else {
      return -1;
    }
  })
}

function returnsAceptedValues(acepted_values){
  if(!acepted_values){
    acepted_values = "0123456789";
  }

  return acepted_values;
}

function applyFormat(format_arr, val_arr, persistent_format, placeholder){
  let value = "";

  if(persistent_format){
    val_arr = applyPersistentFormat(val_arr, placeholder);
  }

  for (let i in format_arr) {
    const character = format_arr[i];

    if (character == "#") {
      if (val_arr.length > 0) {
        value += val_arr[0];
        val_arr.splice(0, 1);
      } else {
        break;
      }
    } else {
      if (val_arr[0] || val_arr[0] === 0) {
        value += format_arr[i];
      }
    }
  }

  return value;
}

function applyPersistentFormat(val_arr, placeholder){
  let placeholder_arr = filterValueToMask(placeholder, "abcdefghijklmnopqrstuvwxyz").split('');

  let delay = placeholder_arr.length - val_arr.length;
  
  let new_value_arr = [];
  for(let i = 0; i < placeholder_arr.length; i++){
    if(i >= delay){
      new_value_arr.push(val_arr[0]);
      val_arr.splice(0, 1);
    } else {
      new_value_arr.push(placeholder_arr[i]);
    }
  }

  return new_value_arr;
}

function selectFormatToMask(mask_formats, value){
  let format_arr = [];
  if (mask_formats.length > 1) {
    let preliminary_format = mask_formats[0];
    for (let format of mask_formats) {
      const format_length = filterValueToMask(format, '#').length;
      if ((value.length <= format_length) || (value.length > format_length && format_length > filterValueToMask(preliminary_format, '#').length)) {
        preliminary_format = format;
        break;
      }
    }

    format_arr = preliminary_format.split('');
  } else {
    format_arr = mask_formats[0].split('');
  }

  return format_arr;
}

function filterValueToMask(value, acepted_values) {
  let new_value = "";
  for (let num of value) {
    if (acepted_values.indexOf(num.toLowerCase()) > -1) {
      new_value += num;
    }
  }

  return new_value;
}
// mask functions \.