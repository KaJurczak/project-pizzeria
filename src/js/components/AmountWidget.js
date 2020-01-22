import {settings, select} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{ //to rozszerzenie klasy BaseWidget
  constructor(element){
    super(element, settings.amountWidget.defaultValue); //wywołanie konstruktora klasy nadrzednej, konieczne przy dziedziczeniu

    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.initAction();

    //console.log('AmountWidget:', thisWidget);
    //console.log('constructor argument:', element);
  }

  getElements(){
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(value){
    return !isNaN(value) //sprawdza czy value jest liczbą
      && value >= settings.amountWidget.defaultMin
      && value <= settings.amountWidget.defaultMax;
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  initAction(){
    //console.log('initAction START');
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function(){
      // thisWidget.setValue(thisWidget.dom.input.value);
      thisWidget.value = thisWidget.dom.input.value;
      //console.log('event change was happened');
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function(){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value-1);
      //console.log('event click was happened - decreas price');
    });


    thisWidget.dom.linkIncrease.addEventListener('click', function(){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value+1);
      //console.log('event click was happened - increas price');
    });
  }
}

export default AmountWidget;
