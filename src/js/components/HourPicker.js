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

    thisWidget.value = thisWidget.dom.input.value;

    thisWidget.dom.hourAvailability = document.querySelector('.range-slider .availability');

    thisWidget.open = settings.hours.open;
    thisWidget.close = settings.hours.close;
    thisWidget.events = {}; // add 20200213

    thisWidget.initPlugin();

  }

  // add changes 20200213
  renderAvailability(date) {
    const thisWidget = this;

    const events = this.events[date];

    thisWidget.tablesByHour = [];

    for(let i = thisWidget.open; i < thisWidget.close; i += 0.5){

      if(events[i]){
        thisWidget.tablesByHour.push(events[i].length);
      } else {
        thisWidget.tablesByHour.push(0);
      }
    }

    thisWidget.dom.hourAvailability.innerHTML = '';

    for(let hour of thisWidget.tablesByHour){

      const rangeSliderDiv = document.createElement('div');
      rangeSliderDiv.classList.add('table-availability');

      if(hour === 0) rangeSliderDiv.classList.add('empty');
      else if(hour < 3) rangeSliderDiv.classList.add('medium');
      else rangeSliderDiv.classList.add('occupied');

      thisWidget.dom.hourAvailability.appendChild(rangeSliderDiv);
    }
  }

  /* removed 20200213:
  checkBooking(booking){
    const thisWidget = this;
    console.log('thisWidget', thisWidget);

    // let allRangeSliderDiv = document.querySelectorAll('table-availability');
    // console.log('allRangeSliderDiv', allRangeSliderDiv);
    // allRangeSliderDiv.remove();
    // console.log('allRangeSliderDiv', allRangeSliderDiv);
    //
    thisWidget.events = booking;
    console.log('booking', booking);

    thisWidget.checkData();
  }

  checkData(){
    const thisWidget = this;

    thisWidget.date = document.querySelector('.date-picker .flatpickr-input').value; //nie może być w knstruktorze bo się nie aktualizuje ze zmianą w dataPicker
    console.log('thisWidget.date', thisWidget.date);

    thisWidget.dayBooking = thisWidget.events[thisWidget.date];
    console.log('thisWidget.dayBooking', thisWidget.dayBooking);

    thisWidget.tableAvailability();
  }
    */

  tableAvailability(){
    const thisWidget = this;

    thisWidget.reservedTable = [];

    for(let i = thisWidget.open; i < thisWidget.close; i += 0.5){
      console.log('i', i);

      if(thisWidget.dayBooking[i]){
        console.log('thisWidget.dayBooking[i]', thisWidget.dayBooking[i]);
        thisWidget.reservedTable.push(thisWidget.dayBooking[i].length);
        console.log('thisWidget.reservedTable', thisWidget.reservedTable);
      } else {
        thisWidget.reservedTable.push(0);
        console.log('thisWidget.reservedTable', thisWidget.reservedTable);
      }
    }

    console.log('thisWidget.reservedTable', thisWidget.reservedTable);

    for(let hour of thisWidget.reservedTable){
      console.log('hour', hour);

      let rangeSliderDiv = 0;

      rangeSliderDiv = document.createElement('div');
      rangeSliderDiv.classList.add('table-availability');
      console.log('createElement_div:', rangeSliderDiv);

      if(hour === 0){
        console.log('0');
        rangeSliderDiv.classList.add('empty');
        console.log('table-availability empty');
      }
      else if (hour === 1 || hour === 2) {
        console.log('1, 2');
        rangeSliderDiv.classList.add('medium');
        console.log('table-availability medium');
      }
      else {
        console.log('3');
        rangeSliderDiv.classList.add('occupied');
        console.log('table-availability occupied');
      }

      thisWidget.dom.hourAvailability.appendChild(rangeSliderDiv);
    }
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
