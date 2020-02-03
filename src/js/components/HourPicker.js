/* global rangeSlider */

import BaseWidget from './BaseWidget.js';
import {settings, select} from '../settings.js';
import utils from '../utils.js';

class HourPicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, settings.hours.open);

    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);

    thisWidget.initPlugin();

    thisWidget.value = thisWidget.dom.input.value;
  }

  initPlugin(){
    const thisWidget = this;

    rangeSlider.create(thisWidget.dom.input);

    thisWidget.dom.input.addEventListener('input', function(){
      thisWidget.value = thisWidget.dom.input.value;
    });
    console.log('initPlugin()');
  }

  parseValue(value){
    const hourNo = utils.numberToHour(value);
    console.log('value',value);
    console.log('parseValue()');
    console.log('hourNo', hourNo);
    return hourNo;
  }

  isValid(){
    return true;
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.output.innerHTML = thisWidget.value;
    console.log('renderValue');
    console.log(thisWidget.value);
  }
}

export default HourPicker;
