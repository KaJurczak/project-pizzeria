/* global flatpickr */

import BaseWidget from './BaseWidget.js';
import utils from '../utils.js';
import {select, settings} from '../settings.js';

class DatePicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, utils.dateToStr(new Date()));

    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);

    thisWidget.initPlugin();
  }

  initPlugin(){
    const thisWidget = this;

    thisWidget.minDate = new Date(thisWidget.value); //tworzy obiekt daty, którego wartość to "teraz"
    let numberOfDays = settings.datePicker.maxDaysInFuture;
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, numberOfDays);

    // console.log(thisWidget.minDate);
    // console.log(thisWidget.maxDate);

    flatpickr(thisWidget.dom.input, {
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      disable: [
        function(date) {
          // return true to disable
          return (date.getDay() === 1);
        }
      ],
      locale: {
        'firstDayOfWeek': 1 // start week on Monday
      },
      onChange:
        function(selectedData, dateStr){
          thisWidget.value = dateStr;
          // console.log('selectedData', selectedData);
          // console.log('dateStr', dateStr);
        },
    });
  }

  parseValue(value){
    return value;
  }

  isValid(){
    return true;
  }

  renderValue(){
  }

}

export default DatePicker;
