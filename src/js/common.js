/**
 * Constants
 */
var $WINDOW = $(window),
    $HTML = $('html'),
    $BODY = $('body');

/**
 * !Detects overlay scrollbars (when scrollbars on overflowed blocks are visible).
 * This is found most commonly on mobile and OS X.
 * */
var HIDDEN_SCROLL = Modernizr.hiddenscroll;
var NO_HIDDEN_SCROLL = !HIDDEN_SCROLL;

/**
 * !Add touchscreen classes
 * */
function addTouchClasses() {
  if (!("ontouchstart" in document.documentElement)) {
    document.documentElement.className += " no-touchevents";
  } else {
    document.documentElement.className += " touchevents";
  }
}

/**
 * !resize only width
 * */
var resizeByWidth = true;

var prevWidth = -1;
$WINDOW.resize(function () {
  var currentWidth = $BODY.outerWidth();
  resizeByWidth = prevWidth !== currentWidth;
  if (resizeByWidth) {
    $WINDOW.trigger('resizeByWidth');
    prevWidth = currentWidth;
  }
});

/**
 * !debouncedresize only width
 * */
var debouncedresizeByWidth = true;

var debouncedPrevWidth = -1;
$WINDOW.on('debouncedresize', function () {
  var currentWidth = $BODY.outerWidth();
  debouncedresizeByWidth = debouncedPrevWidth !== currentWidth;
  if (resizeByWidth) {
    $WINDOW.trigger('debouncedresizeByWidth');
    debouncedPrevWidth = currentWidth;
  }
});

function animationElements() {
  var title = 'h1';
  baffle(title, {
    characters: $(title).text()
  }).start().reveal(1000, 500);
}

/**
 * !Detect scroll page and transform header
 */
function eventsScrollPage() {
  var $header = $('.header'),
      $words = $('.words-scroll-js'),
      wordsScrollDur = 0,
      minScrollTop = 130;

  // Add scroll class
  function toggleClassOnScroll(topPos) {
    minScrollTop = $header.outerHeight();
    $HTML.toggleClass('page-scrolled', (topPos > minScrollTop));
  }

  // Parallax scroll background
  function scrollBgWords(scrollTop) {
    $words.css({
      'transform': 'translate3d(0px, ' + Math.round(scrollTop * 0.8) + 'px, 0px)',
      'transition': 'all ' + wordsScrollDur / 1000 + 's'
    });
  }

  // Ready document
  var scrollTop = $WINDOW.scrollTop();

  toggleClassOnScroll(scrollTop);

  scrollBgWords(scrollTop);

  // Resize and Scroll
  $WINDOW.on('debouncedresizeByWidth scroll', function () {
    var scrollTop = $WINDOW.scrollTop();

    toggleClassOnScroll(scrollTop);

    scrollBgWords(scrollTop);
  });
}

/**
 * !Initial full page scroll plugin
 * */
function fullPageInitial() {

  var $fpSections = $('.fp-sections-js'),
      fpSectionSelector = '.fp-section-js',
      $fpSection = $(fpSectionSelector),
      $word = $('.menu-item__bg-text', $fpSections).find('span'),
      parallaxValue = 0.8,
      duration = 600;

  // Information widget
  var $infoWidget = $('.i-widget-js');

  function historyAnchors() {
    var anchors = [];

    $.each($fpSection, function (i, el) {
      anchors.push('section' + (i + 1));
    });

    return anchors;
  }

  if($fpSections.length) {
    $fpSections.fullpage({
      css3: true,
      verticalCentered: false,
      anchors: historyAnchors(),
      recordHistory: true,
      scrollingSpeed: duration,
      sectionSelector: fpSectionSelector,
      responsiveWidth: 1200, // and add css rule .fp-enabled
      responsiveHeight: 400, // and add css rule .fp-enabled
      // normalScrollElements: '.main-section--news',
      // scrollOverflow: true,
      // add .fp-noscroll for deactivate scroll
      // scrollOverflowOptions: {
      // 	scrollbars: 'custom'
      // },

      // dots navigation
      navigation: false,
      onLeave: function (origin, destination, direction) {
        var $spaceTop = destination.item.offsetTop + destination.item.clientHeight - window.innerHeight;
        var scrollValue = $spaceTop * parallaxValue;

        $word.css({
          'transform': 'translate3d(' + scrollValue + 'px, 0px, 0px)',
          'transition': 'all ' + duration / 1000 + 's'
        });

        // Открывать автоматически виджет над секциех О КОМПАНИИ
        if ($infoWidget.length) {
          if (!$infoWidget.data('is-active')) {
            $infoWidget.removeClass('widget_active');
          }
          if (destination.index === 1) {
            $infoWidget.addClass('widget_active');
          }
        }
      },
    });
  }

  $('.btn-next-section-js').on('click', function (e) {
    if($fpSections.length) {
      $.fn.fullpage.moveSectionDown();
    }
    e.preventDefault();
  });

}

/**
 * !Add placeholder for old browsers
 * */
function placeholderInit() {
  $('[placeholder]').placeholder();
}

/**
 * !Add classes to form elements
 * if they has a value or they are in focus
 * */
function formElementState() {
  var $elem = $('.field-js');
  
  if ($elem.length) {
    function toggleStateClass(mod, cond) {
      var $this = $(this);
      $this.add($this.prev('label')).toggleClass(mod, cond);
    }

    // Focus
    $elem.on('focus blur', function (e) {
      toggleStateClass.call(this, 'focused', e.handleObj.origType === "focus");
    });

    // Has value
    $.each($elem, function () {
      toggleStateClass.call(this, 'filled', $(this).val().length !== 0);
    });

    $elem.on('keyup change', function () {
      toggleStateClass.call(this, 'filled', $(this).val().length !== 0);
    });
  }
}

/**
 * !Initial custom select for cross-browser styling
 * */
function customSelect() {
  var $select = $('select.cselect');

  if ($select.length) {
    $.each($select, function () {
      var $thisSelect = $(this);
      $thisSelect.select2({
        theme: 'custom',
        language: 'ru',
        width: '100%',
        containerCssClass: 'cselect-head',
        dropdownCssClass: 'cselect-drop'
      });
    })

  }
}

/**
 * ! jquery.drop.js
 */
(function($){
  var defaults = {
    opener: '.ms-drop__opener-js',
    openerText: 'span',
    drop: '.ms-drop__drop-js',
    dropOption: '.ms-drop__drop-js a',
    dropOptionText: 'span',
    initClass: 'ms-drop--initialized',
    closeOutsideClick: true, // Close all if outside click
    closeEscClick: true, // Close all if click on escape key
    closeAfterSelect: true, // Close drop after selected option
    preventOption: false, // Add preventDefault on click to option
    selectValue: true, // Display the selected value in the opener
    modifiers: {
      isOpen: 'is-open',
      activeItem: 'active-item'
    }

    // Callback functions
    // afterInit: function () {} // Fire immediately after initialized
    // afterChange: function () {} // Fire immediately after added or removed an open-class
  };

  function MsDrop(element, options) {
    var self = this;

    self.config = $.extend(true, {}, defaults, options);

    self.element = element;

    self.callbacks();
    self.event();
    // close drop if clicked outside active element
    if (self.config.closeOutsideClick) {
      self.closeOnClickOutside();
    }
    // close drop if clicked escape key
    if (self.config.closeEscClick) {
      self.closeOnClickEsc();
    }
    self.eventDropItems();
    self.init();
  }

  /** track events */
  MsDrop.prototype.callbacks = function () {
    var self = this;
    $.each(self.config, function (key, value) {
      if(typeof value === 'function') {
        self.element.on(key + '.msDrop', function (e, param) {
          return value(e, self.element, param);
        });
      }
    });
  };

  MsDrop.prototype.event = function () {
    var self = this;
    self.element.on('click', self.config.opener, function (event) {
      event.preventDefault();
      var curContainer = $(this).closest(self.element);

      if (curContainer.hasClass(self.config.modifiers.isOpen)) {

        curContainer.removeClass(self.config.modifiers.isOpen);

        // callback afterChange
        self.element.trigger('afterChange.msDrop');
        return;
      }

      self.element.removeClass(self.config.modifiers.isOpen);

      curContainer.addClass(self.config.modifiers.isOpen);

      // callback afterChange
      self.element.trigger('afterChange.msDrop');
    });
  };

  MsDrop.prototype.closeOnClickOutside = function () {

    var self = this;
    $(document).on('click', function(event){
      if( $(event.target).closest(self.element).length ) {
        return;
      }

      self.closeDrop();
      event.stopPropagation();
    });

  };

  MsDrop.prototype.closeOnClickEsc = function () {

    var self = this;
    $(document).keyup(function(e) {
      if (e.keyCode === 27) {
        self.closeDrop();
      }
    });

  };

  MsDrop.prototype.closeDrop = function (container) {

    var self = this,
        $element = $(container || self.element);

    if ($element.hasClass(self.config.modifiers.isOpen)) {
      $element.removeClass(self.config.modifiers.isOpen);
    }

  };

  MsDrop.prototype.eventDropItems = function () {

    var self = this;

    self.element.on('click', self.config.dropOption, function (e) {
      var cur = $(this);
      var curParent = cur.parent();

      if(curParent.hasClass(self.config.modifiers.activeItem)){
        e.preventDefault();
        return;
      }
      if(self.config.preventOption){
        e.preventDefault();
      }

      var curContainer = cur.closest(self.element);

      curContainer.find(self.config.dropOption).parent().removeClass(self.config.modifiers.activeItem);

      curParent
          .addClass(self.config.modifiers.activeItem);

      if(self.config.selectValue){
        curContainer
            .find(self.config.opener).find(self.config.openerText)
            .html(cur.find(self.config.dropOptionText).html());
      }

      if(self.config.closeAfterSelect) {
        self.closeDrop();
      }

    });

  };

  MsDrop.prototype.init = function () {

    this.element.addClass(this.config.initClass);

    this.element.trigger('afterInit.msDrop');

  };

  $.fn.msDrop = function (options) {
    'use strict';

    return this.each(function(){
      new MsDrop($(this), options);
    });

  };
})(jQuery);

/**
 * !Toggle lang
 */
function toggleLang() {
  $('.ms-drop__container-js').msDrop();
}

/**
 * !Main menu toggle active class
 */
function menuEvents() {
  var $menu = $('.menu-js');

  // Member default title
  var $title = $menu.find('.menu-item__view-title');
  $.each($title, function (i, el) {

    var $curTitle = $(el);
    $curTitle.data('text', $curTitle.text());
  });

  if ($menu.length) {
    $menu.on('mouseenter', '.menu__item', function (e) {
      var $this = $(this);

      var activeClass = 'item_active';
      if ($this.hasClass(activeClass)) return;

      var id = $this.attr('data-for');

      $this.closest($menu).find('.menu__item-js').removeClass(activeClass);
      $this.addClass(activeClass);

      $this.closest($menu).find('.video-cover__item-js').removeClass(activeClass);
      $('#' + id).addClass(activeClass);

      var $title = $this.find('.menu-item__view-title');
      var titleText = $title.data('text');

      $title.text(titleText);

      baffle('.active .menu-item__view-title', {
        characters: titleText
      }).start().reveal(2000, 300);
    })
  }
}

/**
 * !Slider document photos
 */
function slidersInit() {
  // news slider
  var $newsSlider = $('.news-slider-js');

  if($newsSlider.length){
    $newsSlider.each(function () {
      var $thisSlider = $(this),
          $pagination = $thisSlider.find('.swiper-pagination');

      var reviewsSlider = new Swiper ($thisSlider, {
        init: false,
        spaceBetween: 20,
        slidesPerView: 4,
        slidesPerGroup: 4,
        loop: true,
        watchSlidesVisibility: true,
        pagination: {
          el: $pagination,
          type: 'bullets',
          clickable: true
        },
        breakpoints: {
          480: {
            slidesPerView: 1,
            slidesPerGroup: 1
          },
        }
      });

      reviewsSlider.on('init', function() {
        $thisSlider.addClass('is-loaded');
      });

      reviewsSlider.init();
    });
  }

  // widget slider
  var $widgetSlider = $('.i-widget-slider-js');

  if($widgetSlider.length){
    $widgetSlider.each(function () {
      var $curSlider = $(this),
          $nextEl = $curSlider.find('.swiper-button-next'),
          $prevEl = $curSlider.find('.swiper-button-prev');
      
      var $thisSliderSlide = $curSlider.find('.swiper-slide').first(),
          $coverflowStretch = $thisSliderSlide.outerHeight() - 43;
      
      var reviewsSlider = new Swiper ($curSlider, {
        init: false,
        speed: 700,
        loopedSlides: 10,
        direction: 'vertical',
        effect: 'coverflow',
        coverflowEffect: {
          rotate: 0,
          stretch: $coverflowStretch,
          // stretch: 100,
          depth: 0,
          modifier: 1,
          slideShadows : false,
        },
        parallax:true,
        spaceBetween: 0,
        // slidesPerView: 1,
        slidesPerView: 'auto',
        // slidesPerGroup: 1,
        loop: true,
        watchSlidesVisibility: true,
        allowTouchMove: false,
        navigation: {
          nextEl: $nextEl,
          prevEl: $prevEl,
        },
      });

      reviewsSlider.on('init', function() {
        $curSlider.addClass('is-loaded');
      });

      reviewsSlider.init();
    });
  }
}

/**
 * Scroll Navigation
 */
function scrollNavigation() {
  $('.scroll-nav-js a').mPageScroll2id({
    scrollSpeed: 500,
    forceSingleHighlight: true,
    highlightSelector: '.scroll-nav-js a',
    offset: $(".header"),
  });
}

/**
 * Toggle Information widget
 */
function toggleWidget() {
  $('.widget-opener-js').on('click', function (e) {
    var $curOpener = $(this);
    var $widget = $curOpener.closest('.i-widget-js');

    if ($widget.hasClass('widget_active')) {
      $widget.removeClass('widget_active');
      $widget.data('is-active', false);
    } else {
      $widget.addClass('widget_active');
      $widget.data('is-active', true);
    }

    e.preventDefault();
  });

  $('.widget-close-js').on('click', function (e) {
    var $widget = $(this).closest('.i-widget-js');

    $widget.removeClass('widget_active');
    $widget.data('is-active', false);

    e.preventDefault();
  });
}


/**
 * !Form validation
 * */
function formValidation() {
  $.validator.setDefaults({
    submitHandler: function(form, e) {
      var $form = $(form);
      if($form.hasClass('subs')) {
        setTimeout(function () {
          $form.addClass('completed');
        }, 500);

        return;
      }

      alert('Форма находится в тестовом режиме. Чтобы закрыть окно, нажмите ОК.');
      return false;
    }
  });

  var $form = $('.validate-js');

  if ($form.length) {
    var changeClasses = function (elem, remove, add) {
      elem
          .removeClass(remove).addClass(add);
      elem
          .closest('form').find('label[for="' + elem.attr('id') + '"]')
          .removeClass(remove).addClass(add);
      elem
          .closest('.input-wrap')
          .removeClass(remove).addClass(add);
    };

    $.each($form, function (index, element) {
      $(element).validate({
        errorClass: "error",
        validClass: "success",
        errorElement: false,
        errorPlacement: function (error, element) {
          return true;
        },
        highlight: function (element, errorClass, successClass) {
          changeClasses($(element), successClass, errorClass);
        },
        unhighlight: function (element, errorClass, successClass) {
          changeClasses($(element), errorClass, successClass);
        }
      });
    });
  }
}

/**
 * =========== !ready document, load/resize window ===========
 */

$(document).ready(function () {
  $HTML.addClass('ready');

  addTouchClasses();
  eventsScrollPage();
  // animationElements();
  fullPageInitial();
  placeholderInit();
  formElementState();
  customSelect();
  objectFitImages(); // object-fit-images initial
  toggleLang();
  menuEvents();
  slidersInit();
  scrollNavigation();
  toggleWidget();

  formValidation();

  // Для тестирования. Временно
  $('.home-page .logo').on('click', function () {
    $HTML.toggleClass('logo-alt', !$HTML.hasClass('logo-alt'));
  });

  // Добавить список переключателей видео
  $BODY.on('change', '.t-choose-video :radio', function () {
    var curRadio = $(this);

    var videoSrc = curRadio.attr('data-src'),
        id = curRadio.attr('name');

    var $video = $('video', $('#' + id));

    $video.attr('src', videoSrc);
    $video[0].load();

    // Переключить раздел меню
    $('.menu__item-js').filter('[data-for=' + id + ']').trigger('mouseenter');

  }).on('click', '.t-choose-video__head', function () {
    var $container = $('.t-choose-video');
    $container.toggleClass('is-open', !$container.hasClass('is-open'));
  });
});
