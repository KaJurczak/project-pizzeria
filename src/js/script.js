/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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
      thisProduct.processOrder();

      console.log('new Product:', thisProduct);
    }


    renderInMenu (){
      const thisProduct = this;
      console.log('thisProduct at renderInMenu is:', thisProduct);

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
    }

    initAccordion (){
      const thisProduct = this;
      console.log('thisProduct at initAccordion is:', thisProduct);

      /* find the clickable trigger (the element that should react to clicking) */
      const clickableTrigger = thisProduct.accordionTrigger;
      console.log('clickableTrigger is:', clickableTrigger);

      /* START: click event listener to trigger */
      clickableTrigger.addEventListener('click', function(){
        console.log('clickableTrigger was click');

        /* prevent default action for event */
        event.preventDefault();

        /* toggle active class on element of thisProduct */
        const activeClass = thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
        console.log('activeClass is:', activeClass);

        /* find all active products */
        const activeProducts = document.querySelectorAll('.product.active');
        console.log('activeProducts is:', activeProducts);

        /* START LOOP: for each active product */
        for (let activeProduct of activeProducts){
          //console.log('activeProduct is:', activeProduct);

          /* START: if the active product isn't the element of thisProduct */
          if (activeProduct !== thisProduct.element) {
            console.log('if they are not the same?');
            console.log('activeProduct is:', activeProduct);
            console.log('thisProduct.element is:', thisProduct.element);
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
      console.log('thisProductis at initOrderForm is:', thisProduct);

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
      });
    }

    processOrder(){
      const thisProduct = this;
      console.log('thisProductis at processOrder is:', thisProduct);

      /* Create object with selected form elements*/
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData is:', formData);

      /* find product price */
      let basePrice = thisProduct.data.price;
      console.log('basePrice is:', basePrice);

      /* find all params */
      const allParams = thisProduct.data.params;
      console.log('allParams is:', allParams);

      /* OPEN LOOP: for each params elements */
      for(let paramId in allParams){
        console.log('paramId is:', paramId);

        /* find object from allParams with key paramId */
        const param = allParams[paramId];
        console.log('param is:', param);

        /* OPEN LOOP: for each param option */
        for(let optionId in param.options){
          console.log('optionId is:', optionId);

          /* find object from param.options with key optionId */
          const option = param.options[optionId];
          console.log('option is:', option);

          /* Create objectSelected which one:
          -  object formData has property equal to the parameters key (paramID)
          - and has options key (optionId) */
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) >-1; //hasOwnProperty zwraca true jeśłi obiekt posiada daną wartość. indexOf Zwraca pierwszy (najmniejszy) indeks elementu w tablicy równego podanej wartości lub -1, gdy nie znaleziono takiego elementu.
          console.log('optionSelected is:', optionSelected);
          console.log(!option.default);
          console.log(!optionSelected);
          /* if objectSelected is true and has not property 'default', increas price */
          if(optionSelected && !option.default){
            console.log('increase price');
            console.log('basePrice is', basePrice);
            console.log('option price is', option.price);
            basePrice += option.price;
            console.log('basePrice is', basePrice);
          }
          /* if objectSelected is not selected (false) and has property 'defoult' - decrease price */
          else if(!optionSelected && option.default){
            console.log('decrease price');
            basePrice -= option.price;
          }
          else {
            console.log('do noothing');}

          /* IMAGES */
          console.log(thisProduct.imageWrapper);
          const allImages = thisProduct.imageWrapper.querySelectorAll('img,.paramId-.optionId');
          console.log('allImages is:', allImages);

          for(let image of allImages){
            console.log('image is:', image);
            //image.toggle(classNames.menuProduct.imageVisible);
            //image.classList.remove(classNames.menuProduct.imageVisible);
            //console.log('image with remove active is:', image);

            /* if objectSelected is true, images for this option should get class from classNames.menuProduct.imageVisible*/
            console.log(optionSelected);
            if(optionSelected){
              console.log('is it work?');
              image.classList.add(classNames.menuProduct.imageVisible);
              console.log('image with active is:', image);
            }

            /* else - images should loose classNames.menuProduct.imageVisible */
            else {
              console.log('whats wrong with you?');
              image.classList.remove(classNames.menuProduct.imageVisible);
              console.log('image withoght active is:', image);
            }
          }

        /* CLOSE LOOP: for each param options */
        }
      /* CLOSE LOOP: for each params elements */
      }
      /* insert product price into thisProduct.priceElem*/
      console.log('basePrice is', basePrice);
      thisProduct.priceElem.innerHTML = basePrice;
    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      console.log('thisApp.data:', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product (productData, thisApp.data.products[productData]);
      }
    },

    initData: function() {
      const thisApp = this;
      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
