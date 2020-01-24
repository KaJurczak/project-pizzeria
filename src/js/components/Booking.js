import {templates, select, settings} from '../settings.js';
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

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    thisBooking.booked[date][hour].push(table);
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
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
  }
}

export default Booking;
