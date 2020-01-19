import {select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';


class Product {
  constructor(id, data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

    //console.log('new Product:', thisProduct);
  }

  renderInMenu (){
    const thisProduct = this;
    //console.log('thisProduct at renderInMenu is:', thisProduct);

    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);

    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);

    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion (){
    const thisProduct = this;
    //console.log('thisProduct at initAccordion is:', thisProduct);

    /* find the clickable trigger (the element that should react to clicking) */
    const clickableTrigger = thisProduct.accordionTrigger;
    //console.log('clickableTrigger is:', clickableTrigger);

    /* START: click event listener to trigger */
    clickableTrigger.addEventListener('click', function(){
      //console.log('clickableTrigger was click');

      /* prevent default action for event */
      event.preventDefault();

      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      //console.log('activeClass is:', activeClass);

      /* find all active products */
      const activeProducts = document.querySelectorAll('.product.active');
      //console.log('activeProducts is:', activeProducts);

      /* START LOOP: for each active product */
      for (let activeProduct of activeProducts){
        ////console.log('activeProduct is:', activeProduct);

        /* START: if the active product isn't the element of thisProduct */
        if (activeProduct !== thisProduct.element) {
          //console.log('if they are not the same?');
          //console.log('activeProduct is:', activeProduct);
          //console.log('thisProduct.element is:', thisProduct.element);
          /* remove class active for the active product */
          activeProduct.classList.remove('active');

        /* END: if the active product isn't the element of thisProduct */
        }
      /* END LOOP: for each active product */
      }
    /* END: click event listener to trigger */
    });
  }

  initOrderForm(){
    const thisProduct = this;
    //console.log('thisProductis at initOrderForm is:', thisProduct);

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder(){
    const thisProduct = this;
    //console.log('thisProductis at processOrder is:', thisProduct);

    /* Create object with selected form elements*/
    const formData = utils.serializeFormToObject(thisProduct.form);
    //console.log('formData is:', formData);

    /* NEW, TO CART: create empty object */
    thisProduct.params = {};

    /* find product price */
    let price = thisProduct.data.price;
    //console.log('price is:', price);

    /* find all params */
    const allParams = thisProduct.data.params;
    //console.log('allParams is:', allParams);

    /* OPEN LOOP: for each params elements */
    for(let paramId in allParams){
      //console.log('paramId is:', paramId);

      /* find object from allParams with key paramId */
      const param = allParams[paramId];
      //console.log('param is:', param);

      /* OPEN LOOP: for each param option */
      for(let optionId in param.options){
        //console.log('optionId is:', optionId);

        /* find object from param.options with key optionId */
        const option = param.options[optionId];
        //console.log('option is:', option);

        /* Create objectSelected which one:
        -  object formData has property equal to the parameters key (paramID)
        - and has options key (optionId) */
        let optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) >-1; //hasOwnProperty zwraca true jeśłi obiekt posiada daną wartość. indexOf Zwraca pierwszy (najmniejszy) indeks elementu w tablicy równego podanej wartości lub -1, gdy nie znaleziono takiego elementu.
        //console.log('optionSelected is:', optionSelected);
        //console.log(!option.default);
        //console.log(!optionSelected);
        /* if objectSelected is true and has not property 'default', increas price */
        if(optionSelected && !option.default){
          //console.log('increase price');
          //console.log('price is', price);
          //console.log('option price is', option.price);
          price += option.price;
          //console.log('price is', price);
        }
        /* if objectSelected is not selected (false) and has property 'defoult' - decrease price */
        else if(!optionSelected && option.default){
          //console.log('decrease price');
          price -= option.price;
        }
        //else {
        //console.log('do noothing');}

        /* IMAGES */
        /* Create variable image with element with selector 'img'+'.'+paramId+'-'+optionId */
        const image = thisProduct.imageWrapper.querySelector('img'+'.'+paramId+'-'+optionId);
        //console.log(image);

        /* Remove class active from element which has got image */
        if(image){
          image.classList.remove(classNames.menuProduct.imageVisible);
        }

        /* if optionSelected is true*/
        //console.log(optionSelected);
        if(optionSelected){
          //console.log('is it work?');

          /* NEW, TO CART */
          if(!thisProduct.params[paramId]){
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;

          /*START IF: for image */
          if(image){

            /* images for this option should get class from classNames.menuProduct.imageVisible */
            image.classList.add(classNames.menuProduct.imageVisible);

            console.log('image with active is:', image);
          }

        /*CLOSE IF: for image  */
        }

      /* CLOSE LOOP: for each param options */
      }
    /* CLOSE LOOP: for each params elements */
    }

    /* multiply price by amount */
    thisProduct.priceSingle = price;

    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    //before: price *= thisProduct.amountWidget.value;

    /* insert product price into thisProduct.priceElem*/
    //console.log('price is', price);
    thisProduct.priceElem.innerHTML = thisProduct.price;

    //console.log('thisProduct.params:', thisProduct.params);
  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

    thisProduct.amountWidgetElem.addEventListener('updated', function(){thisProduct.processOrder();});
    //console.log('event updated was happened');
  }

  addToCart(){
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    //app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event); //wywołanie eventu na elemencie produktu
  }

}

export default Product;
