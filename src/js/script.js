/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
    db: {
      url: '//localhost:3131',
      product: 'product',
      order: 'order',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };


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

      app.cart.add(thisProduct);
    }

  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initAction();

      //console.log('AmountWidget:', thisWidget);
      //console.log('constructor argument:', element);
    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value); //Przetwarza argument w postaci łańcucha znaków i zwraca liczbę całkowitą typu integer

      /* TODO: Add validation */
      if(thisWidget.value!==newValue && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
        thisWidget.value = newValue;
        thisWidget.announce();
      }
      thisWidget.input.value = thisWidget.value;
    }

    initAction(){
      //console.log('initAction START');
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
        //console.log('event change was happened');
      });

      thisWidget.linkDecrease.addEventListener('click', function(){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value-1);
        //console.log('event click was happened - decreas price');
      });


      thisWidget.linkIncrease.addEventListener('click', function(){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value+1);
        //console.log('event click was happened - increas price');
      });
    }

    announce(){
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event); //Wywołuje zdarzenie w bieżącym elemencie.
    }
  }

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

      thisCart.getElements(element);
      thisCart.initActions();
      //thisCart.add();
      //thisCart.remove();

      //console.log('new Cart', thisCart);
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;

      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      //console.log('thisCart.dom.toggleTrigger:', thisCart.dom.toggleTrigger);

      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);

      thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

      for(let key of thisCart.renderTotalsKeys){
        thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
      }

      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);

      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);

      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    }

    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function(){
        thisCart.remove(event.detail.cartProduct);
      });

      thisCart.dom.form.addEventListener('submit', function(){
        event.preventDefault();
        thisCart.sendOrder();
        console.log('thisCart.sendOrder is working');
      });
    }

    sendOrder(){
      const thisCart = this;

      const url = settings.db.url + '/' + settings.db.order;

      const payload = {
        address: thisCart.dom.address,
        phone: thisCart.dom.phone,
        totalNumber: thisCart.totalNumber,
        subtotalPrice: thisCart.subtotalPrice,
        totalPrice: thisCart.totalPrice,
        deliveryFee: thisCart.deliveryFee,
        products: [],
      };

      for(let product of thisCart.products){
        console.log('product is', product);
        console.log('product.getData() is', product.getData());
        payload.products.push(product.getData());
        console.log('payload.products', payload.products);
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload), //stringify - konwert na ciąg znaków
      };

      fetch(url, options)
        .then(function(response){
          return response.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);
        });
    }

    add(menuProduct){
      const thisCart = this;
      //const thisProduct = this;
      //console.log('thisCart at Cart.add is:', thisCart);
      //console.log('menuProduct', menuProduct);

      /* generate HTML based on template */
      const generatedHTML = templates.cartProduct(menuProduct);
      //console.log('generatedHTML:', generatedHTML);

      /* create element using utils.createElementFromHTML */
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      //console.log('generatedDOM:', generatedDOM);

      /*Add element to thisCart.dom.productList */
      //console.log('thisCart.dom.productList', thisCart.dom.productList);
      thisCart.dom.productList.appendChild(generatedDOM); //wstawia określony węzeł na koniec listy dzieci określonego rodzica. Jeśli węzeł ma już rodzica, jest on najpierw od niego oddzielany.
      //console.log('thisCart.dom.productList', thisCart.dom.productList);

      //console.log('adding product', menuProduct);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      //console.log('thisCart.products', thisCart.products);

      thisCart.update();
    }

    update(){
      const thisCart = this;

      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;

      for(let product of thisCart.products){
        thisCart.subtotalPrice += product.price;
        thisCart.totalNumber += product.amount;
      }

      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

      console.log('thisCart.deliveryFee', thisCart.deliveryFee);
      console.log('thisCart.totalNumber', thisCart.totalNumber);
      console.log('thisCart.subtotalPrice', thisCart.subtotalPrice);
      console.log('thisCart.totalPrice', thisCart.totalPrice);

      for(let key of thisCart.renderTotalsKeys){
        for(let elem of thisCart.dom[key]){
          elem.innerHTML = thisCart[key];
        }
      }
    }

    remove(cartProduct){
      const thisCart = this;

      const index = thisCart.products.indexOf(cartProduct);
      console.log('index', index);

      thisCart.products.splice(index, 1); //usuwanie elementu z tablicy

      cartProduct.dom.wrapper.remove();

      thisCart.update();
    }

  }

  class CartProduct{
    constructor(menuProduct, element){
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params)); //klonowanie obiektu

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();

      //console.log('thisCartProduct', thisCartProduct);
    }

    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget(){
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){

        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        //console.log('thisCartProduct.amount', thisCartProduct.amount);

        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        //console.log('thisCartProduct.price', thisCartProduct.price);

        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
        //console.log('thisCartProduct.dom.price', thisCartProduct.dom.price);

      });

    }

    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event); //Wywołuje zdarzenie w bieżącym elemencie.

      console.log('method remove() has been called');
    }

    initActions(){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function(){
        event.preventDefault();
      });

      thisCartProduct.dom.remove.addEventListener('click', function(){
        event.preventDefault();
        thisCartProduct.remove();
      });
    }

    getData(){
      const thisCartProduct = this;

      const orderElem = {
        id: thisCartProduct.id,
        amount: thisCartProduct.amount,
        price: thisCartProduct.price,
        priceSingle: thisCartProduct.priceSingle,
        params: thisCartProduct.params,
      };

      console.log('orderElem', orderElem);
      return orderElem;
    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      //console.log('thisApp.data:', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },

    initData: function() {
      const thisApp = this;
      thisApp.data = {};

      const url = settings.db.url + '/' + settings.db.product;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);

          /* save parsedResponse as thisApp.data.products */
          thisApp.data.products = parsedResponse;

          /* execute initMenu method */
          thisApp.initMenu();
        });

      console.log('thisApp.data', JSON.stringify(thisApp.data));
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function(){
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);

      thisApp.initData();
      //moved to initData.fetch thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
