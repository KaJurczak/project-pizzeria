import {templates, select} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking{
  constructor(bookingWidget){
    const thisBooking = this;

    thisBooking.render(bookingWidget);
    thisBooking.initWidgets();
  }

  render(bookingWidget){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = bookingWidget;

    bookingWidget.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = bookingWidget.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = bookingWidget.querySelector(select.booking.hoursAmount);
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}

export default Booking;
