import {templates, select, settings, classNames} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import utils from '../utils.js';

class Booking{
  constructor(bookingWidget){
    const thisBooking = this;

    thisBooking.render(bookingWidget);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };
    // console.log('getData params', params);

    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking
                                            + '?' + params.booking.join('&'), // join - elementy tablicy mają zostać połaczone by '&'
      eventsCurrent: settings.db.url + '/' + settings.db.event
                                            + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event
                                            + '?' + params.eventsRepeat.join('&'),
    };
    // console.log('getData urls', urls);

    Promise.all([ //metoda, któa wykona pewną operację (zestaw zawarty w tablicy), po zakończeniu której zostanie wykonana funcja zdefiniowana w then
      fetch(urls.booking), //łączenie z serwerem API, pobranie rezerwacji
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){ //odpowiedź serwera po przetworzeniu json na tablice lub obiekt; ([bookings]) - potraktuj 1st argument jako tablicę, a 1st element z tablicy zapisz w zmiennej booking
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;


    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate<= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    console.log('thisBooking.booked', thisBooking.booked);

    thisBooking.updateDOM();
    console.log('uruchomione updatedDom');
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour); //zmienia format z godziny na liczbę, np z 12:30 na 12.5

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){ // pętla z iteratorem,
      // console.log('loop', hourBlock);

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }

  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }
    console.log('thisBooking.dom.tables', thisBooking.dom.tables);
    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute); //nie używamy table.id bo identyfikatory stolików nie musza być htmlowymi atrybutami id
      if(!isNaN(tableId)){ //sprawdzamy czy to liczba. Zmienna tableId będzie zawsze tekstem bo pobrana jest z atrybutu elementu DOM. Tu dostaniemy info że jest liczbą nawet jeśli to tylko ciąg znaków typu '3'
        tableId = parseInt(tableId);
        console.log('tableId', tableId);
        console.log('thisBooking.booked', thisBooking.booked);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) > -1 //includes sprawdza czy element tabled znajduje się w tablicy
      ){
        table.classList.add(classNames.booking.tableBooked);
        console.log('add class booking');
      } else {
        table.classList.remove(classNames.booking.tableBooked);
        console.log('removed class booking');
      }
      console.log('thisBooking.booked', thisBooking.booked);
    }
  }

  render(bookingWidget){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = bookingWidget;

    bookingWidget.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = bookingWidget.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = bookingWidget.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = bookingWidget.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = bookingWidget.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = bookingWidget.querySelectorAll(select.booking.tables);
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
      console.log('updatedDom zostało uruchomione przez listener');
    });
  }
}

export default Booking;
