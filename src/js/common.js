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

function loadVideoSrc() {
  var bgv = $('.video-cover__item-js video, .bg-video video');
  if (window.innerWidth >= 992) {
    $('source', bgv).each(function () {
      var $el = $(this);
      $el.attr('src', $el.data('csrc'));

      $el.parents(bgv)[0].load();
    });
  }
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
      'transform': 'translate3d(0px, -' + Math.round(scrollTop * 0.2) + 'px, 0px)',
      'transition': 'all ' + wordsScrollDur / 1000 + 's'
    });
  }

  // Ready document
  var scrollTop = $WINDOW.scrollTop();

  // toggleClassOnScroll(scrollTop);

  if (!$('.nav-opener-js').is(':visible')) {
    scrollBgWords(scrollTop);
  }

  // Resize and Scroll
  $WINDOW.on('debouncedresizeByWidth scroll', function () {
    var scrollTop = $WINDOW.scrollTop();

    // toggleClassOnScroll(scrollTop);

    if (!$('.nav-opener-js').is(':visible')) {
      scrollBgWords(scrollTop);
    }
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
      duration = 600,
      breakpointWidth = 992,
      breakpointHeight = 590;

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
      recordHistory: false,
      scrollingSpeed: duration,
      sectionSelector: fpSectionSelector,
      responsiveWidth: breakpointWidth, // and add css rule .fp-enabled
      responsiveHeight: breakpointHeight, // and add css rule .fp-enabled
      navigation: false,
      onLeave: function (origin, destination, direction) {
        if (window.innerWidth >= breakpointWidth && window.innerHeight >= breakpointHeight) {
          // console.log("destination: ", breakpointWidth);
          var $spaceTop = destination.item.offsetTop + destination.item.clientHeight - window.innerHeight;
          var scrollValue = $spaceTop * parallaxValue;

          $word.css({
            'transform': 'translate3d(' + scrollValue + 'px, 0px, 0px)',
            'transition': 'all ' + duration / 1000 + 's'
          });
        }

        // Открывать автоматически виджет над определенными секциями
        if ($infoWidget.length) {
          var dataIsActive = $infoWidget.data('is-active');

          if (dataIsActive === undefined) {
            $infoWidget.removeClass('widget_active');
          }

          // if (dataIsActive === undefined && destination.index >= 1) {
          //   $infoWidget.addClass('widget_active');
          // }

          if (dataIsActive === undefined && $(destination.item).hasClass('show-widget-js')) {
            $infoWidget.addClass('widget_active');
          }
        }
      },
      afterLoad: function(origin, destination, direction){
        $('.logo').on('click', function (e) {
          fullpage_api.moveTo(1);
          e.preventDefault();
        })
      },
    });
  }

  $('.btn-next-section-js').on('click', function (e) {
    if($fpSections.length) {
      fullpage_api.moveSectionDown();
    }
    e.preventDefault();
  });

  $('.btn-to-section-js').on('click', function (e) {
    var $thisBtn = $(this);
    if($fpSections.length) {
      fullpage_api.moveTo($($thisBtn.attr('href')).index() + 1);
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
    $.each($select.not('[multiple]'), function () {
      var $thisSelect = $(this);
      $thisSelect.select2({
        theme: 'custom',
        language: 'ru',
        width: '100%',
        containerCssClass: 'cselect-head',
        dropdownCssClass: 'cselect-drop'
      });
    });

    $.each($select.filter('[multiple]'), function () {
      var $thisSelect = $(this);
      $thisSelect.select2({
        theme: 'custom',
        language: 'ru',
        width: '100%',
        containerCssClass: 'cselect-head cselect-drop-multiple',
        dropdownCssClass: 'cselect-drop cselect-drop-multiple',
        closeOnSelect : false,
        allowHtml: true,
        allowClear: true,
        tags: true // создает новые опции на лету
      });
    })
  }
}

/*!==================================================
/*!jquery.switch-class.js
/*!Version: 2.0
/*!Description: Extended toggle class
/*!==================================================*/

(function ($) {
  'use strict';

  // Нужно для корректной работы с доп. классом блокирования скролла
  var countFixedScroll = 0;

  // Inner Plugin Modifiers
  var CONST_MOD = {
    instanceClass: 'swc-instance',
    initClass: 'swc-initialized',
    activeClass: 'swc-active',
    preventRemoveClass: 'swc-prevent-remove'
  };

  // Class definition
  // ================

  var SwitchClass = function (element, config) {
    var self = this, elem;
    self.element = element;
    self.config = config;
    self.mixedClasses = {
      initialized: CONST_MOD.initClass + ' ' + (config.modifiers.initClass || ''),
      active: CONST_MOD.activeClass + ' ' + (config.modifiers.activeClass || ''),
      scrollFixedClass: 'css-scroll-fixed'
    };
    self.$switchClassTo = $(config.toggleEl).add(config.addEl).add(config.removeEl).add(config.switchClassTo);
    self._classIsAdded = false;
  };

  $.extend(SwitchClass.prototype, {
    callbacks: function () {
      var self = this;
      /** track events */
      $.each(self.config, function (key, value) {
        if (typeof value === 'function') {
          $(self.element).on('switchClass.' + key, function (e, param) {
            return value(e, $(self.element), param);
          });
        }
      });
    },
    prevent: function (event) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    },
    toggleFixedScroll: function () {
      var self = this;
      $('html').toggleClass(self.mixedClasses.scrollFixedClass, !!countFixedScroll);
    },
    add: function () {
      var self = this;
      var $currentEl = self.config.selector ? $(self.config.selector) : $(self.element);

      if (self._classIsAdded) return;

      // Callback before added class
      // $(self.element)
      $currentEl
          .trigger('switchClass.beforeAdd')
          .trigger('switchClass.beforeChange');

      if (self.config.removeExisting) {
        $.switchClass.remove(true);
      }

      // Добавить активный класс на:
      // 1) Основной элемент
      // 2) Дополнительный переключатель
      // 3) Элементы указанные в настройках экземпляра плагина
      $currentEl.add(self.$switchClassTo)
          .addClass(self.mixedClasses.active);

      // Сохранить в дата-атрибут текущий объект this
      // $(self.element).data('SwitchClass', self);
      $currentEl.addClass(CONST_MOD.instanceClass).data('SwitchClass', self);

      self._classIsAdded = true;

      if (self.config.cssScrollFixed) {
        // Если в настойках указано, что нужно добавлять класс фиксации скролла,
        // То каждый раз вызывая ДОБАВЛЕНИЕ активного класса, увеличивается счетчик количества этих вызовов
        ++countFixedScroll;
        self.toggleFixedScroll();
      }

      // callback after added class
      // $(self.element)
      $currentEl
          .trigger('switchClass.afterAdd')
          .trigger('switchClass.afterChange');
    },
    remove: function () {
      var self = this;
      var $currentEl = self.config.selector ? $(self.config.selector) : $(self.element);

      if (!self._classIsAdded) return;

      // callback beforeRemove
      $currentEl
          .trigger('switchClass.beforeRemove')
          .trigger('switchClass.beforeChange');

      // Удалять активный класс с:
      // 1) Основной элемент
      // 2) Дополнительный переключатель
      // 3) Элементы указанные в настройках экземпляра плагина
      $currentEl.add(self.$switchClassTo)
          .removeClass(self.mixedClasses.active);

      // Удалить дата-атрибут, в котором хранится объект
      $currentEl.removeClass(CONST_MOD.instanceClass).removeData('SwitchClass');

      self._classIsAdded = false;

      if (self.config.cssScrollFixed) {
        // Если в настойках указано, что нужно добавлять класс фиксации скролла,
        // То каждый раз вызывая УДАЛЕНИЕ активного класса, уменьшается счетчик количества этих вызовов
        --countFixedScroll;
        self.toggleFixedScroll();
      }

      // callback afterRemove
      $currentEl
          .trigger('switchClass.afterRemove')
          .trigger('switchClass.afterChange');
    },
    events: function () {
      var self = this;

      function _toggleClass (e) {
        if (self._classIsAdded && e.handleObj.origType !== "mouseenter") {
          self.remove();

          e.preventDefault();
          return false;
        }

        self.add();

        self.prevent(e);
      }

      if (self.config.selector) {
        $(self.element)
            .off(self.config.eventType, self.config.selector)
            .on(self.config.eventType, self.config.selector, _toggleClass);
      } else {
        $(self.element)
            .off(self.config.eventType)
            .on(self.config.eventType, _toggleClass);
      }

      $(self.config.toggleEl).on('click', _toggleClass);

      $(self.config.addEl).on('click', function (event) {
        self.add();
        self.prevent(event);
      });

      $(self.config.removeEl).on('click', function (event) {
        self.remove();
        self.prevent(event);
      })

    },
    removeByClickOutside: function () {
      var self = this;

      $('html').on('click', function (event) {

        if ($(event.target).closest('.' + CONST_MOD.preventRemoveClass).length) {
          return;
        }

        if ($(event.target).closest('[data-swc-prevent-remove]').length) {
          return;
        }

        if (self.config.preventRemoveClass && $(event.target).closest('.' + self.config.preventRemoveClass).length) {
          return;
        }

        if (self._classIsAdded && self.config.removeOutsideClick) {
          self.remove();
        }
      });
    },
    removeByClickEsc: function () {
      var self = this;

      $('html').keyup(function (event) {
        if (self._classIsAdded && self.config.removeEscClick && event.keyCode === 27) {
          self.remove();
        }
      });
    },
    init: function () {
      var self = this;
      var $currentEl = self.config.selector ? $(self.config.selector) : $(self.element);

      if ($currentEl.hasClass(self.config.modifiers.activeClass) || $currentEl.hasClass(CONST_MOD.activeClass)) {
        self.add();
      }

      $currentEl.addClass(self.mixedClasses.initialized);
      $currentEl.trigger('switchClass.afterInit');
    }
  });

  $.switchClass = {
    version: "2.0",
    getInstance: function (command) {
      var instance = $('.' + CONST_MOD.instanceClass + '.' + CONST_MOD.activeClass + ':last').data("SwitchClass"),
          args = Array.prototype.slice.call(arguments, 1);

      if (instance instanceof SwitchClass) {
        if ($.type(command) === "string") {
          instance[command].apply(instance, args);
        } else if ($.type(command) === "function") {
          command.apply(instance, args);
        }

        return instance;
      }

      return false;
    },
    remove: function (all) {
      // Получить текущий инстанс
      var instance = this.getInstance();

      // Если инстанс существует
      if (instance) {

        instance.remove();

        // Try to find and close next instance
        // 2) Если на вход функуии передан true,
        if (all === true) {
          // то попитаться найти следующий инстанс и запустить метод .close для него
          this.remove(all);
        }
      }
    },
  };

  function _run (el) {
    el.switchClass.callbacks();
    el.switchClass.events();
    el.switchClass.removeByClickOutside();
    el.switchClass.removeByClickEsc();
    el.switchClass.init();
  }

  $.fn.switchClass = function (options) {
    var self = this,
        args = Array.prototype.slice.call(arguments, 1),
        l = self.length,
        i,
        ret;

    for (i = 0; i < l; i++) {
      if (typeof options === 'object' || typeof options === 'undefined') {
        self[i].switchClass = new SwitchClass(self[i], $.extend(true, {}, $.fn.switchClass.defaultOptions, options));
        _run(self[i]);
      } else {
        ret = self[i].switchClass[options].apply(self[i].switchClass, args);
      }
      if (typeof ret !== 'undefined') {
        return ret;
      }
    }
    return self;
  };

  $.fn.switchClass.defaultOptions = {
    // Event type
    eventType: 'click',

    // Remove existing classes
    // Set this to false if you do not need to stack multiple instances
    removeExisting: false,

    // Бывает необходимо инициализировать плагин на динамически добавленном элемента.
    // Чтобы повесить на этот элемент событие, нужно добавить его через совойство selector
    // Example:
    // $('.parents-element').switchClass({
    //     selector : '.box a.opener:visible'
    // });
    selector: null,

    // Дополнительный элемент, которым можно ДОБАВЛЯТЬ класс
    // Example: '.some-class-js' or $('.some-class-js')
    addEl: null,

    // Дополнительный элемент, которым можно УДАЛЯТЬ класс
    // Example: '.some-class-js' or $('.some-class-js')
    removeEl: null,

    // Дополнительный элемент, которым можно ДОБАВЛЯТЬ/УДАЛЯТЬ класс
    // Example: '.some-class-js' or $('.some-class-js')
    toggleEl: null,

    // Один или несколько эелментов, на которые будет добавляться/удаляться активный класс (modifiers.activeClass)
    // Example 1: $('html, .popup-js, .overlay-js')
    // Example 2: $('html').add('.popup-js').add('.overlay-js')
    switchClassTo: null,

    // Удалать класс по клику по пустому месту на странице?
    // Если по клику на определенный элемент удалять класс не нужно,
    // то на этот элемент нужно добавить класс ".swc-prevent-remove" или дата-атрибудт "data-swc-prevent-remove",
    // или класс указанный в параметре "preventRemoveClass"
    // Example: true or false
    removeOutsideClick: true,

    // Удалять класс по клику на клавишу Esc?
    // Example: true or false
    removeEscClick: true,

    // Добавлять на html дополнительный класс 'css-scroll-fixed'?
    // Через этот класс можно фиксировать скролл методами css
    // _mixins.sass, scroll-blocked()
    // Example: true or false
    cssScrollFixed: false,

    // Если кликнуть по элементу с этим классом, то событие удаления активного класса не будет вызвано.
    // По умолчанию можно использовать класс ".swc-prevent-remove" или дата-атрибудт "data-swc-prevent-remove".
    // Example: class = "some-class"
    preventRemoveClass: null,

    // Классы-модификаторы
    modifiers: {
      initClass: null,
      activeClass: 'active'
    }
  };

})(jQuery);

/**
 * !Contact popup
 */
function contactPopup() {
  $('.contact-popup-open-js').switchClass({
    eventType: 'mouseenter touchend',
    switchClassTo: $('.contact-popup-js'),
    removeExisting: true,
    removeEl: $('.contact-popup-close-js'),
    modifiers: {
      activeClass: 'is-open'
    }
  });
}

/**
 * !jquery.nav.js
 */

/* Accordion plugin */
(function (window, document, $, undefined) {
  /*'use strict';*/

  // Inner Plugin Classes and Modifiers
  // ====================================================
  var PREF = 'jsAccordionSimple';
  var CONST_CLASSES = {
    element: PREF,
    initClass: PREF + '_initialized',
    block: PREF + '__block',
    switcher: PREF + '__switcher',
    panel: PREF + '__panel',
  };

  var AccordionSimple = function (element, config) {
    var self,
        $element = $(element),
        $window = $(window),
        $html = $('html'),
        isAnimated = false;

    var attrCollapsed = $element.attr('data-clap-collapsed');
    var collapsed = (attrCollapsed === 'true' || attrCollapsed === 'false') ? attrCollapsed === 'true' : config.collapsed;

    var callbacks = function () {
          /** track events */
          $.each(config, function (key, value) {
            if (typeof value === 'function') {
              $element.on('accordionSimple.' + key, function (e, param) {
                return value(e, $element, param);
              });
            }
          });
        },
        open = function ($panel) {
          if (!$panel.length) return;

          // console.log('>>>open<<<');

          // Вторым аргументо передать функцию обратного вызова
          var callback = arguments[1];

          // Вызов события перед открытием текущей панели
          $element.trigger('accordionSimple.beforeOpen');

          // Добавить класс на активные элементы
          $panel.closest(config.block).addClass(config.modifiers.activeClass);

          // Открыть панель
          // 1) Все закрытые РОДИТЕЛЬСКИЕ ПАНЕЛИ открыть без анимации
          // Открывать родительские Панели необходимо, если, например, открывается вложенная Панель методом "open"
          $panel
              .parentsUntil($element, config.panel + ':hidden').show()

          // Указать в data-атрибуте, что РОДИТЕЛЬСКАЯ ПАНЕЛЬ открыта
              .data('active', true).attr('data-active', true).end()

          // Добавить активный класс на РОДИТЕЛЬСКИЕ БЛОКИ
              .parentsUntil($element, config.block).addClass(config.modifiers.activeClass).end()

          // Открыть ТЕКУЩУЮ ПАТЕЛЬ с анимацией
              .slideDown(config.duration, function () {
                // Указать в data-атрибуте, что текущая патель открыта
                $(this).data('active', true).attr('data-active', true);

                // Вызов события после открытия текущей панели
                $element.trigger('accordionSimple.afterOpen');

                // Вызов callback функции после открытия панели
                if (typeof callback === 'function') {
                  callback();
                }
              });

          if (collapsed) {
            // Проверить у соседей всех родительских Элементов наличие активных Панелей
            // Закрыть эти Панели
            var $siblingsPanel = $panel.parentsUntil($element, config.block).siblings().find(config.panel).filter(function () {
              return $(this).data('active');
            });

            closePanel($siblingsPanel, function () {
              isAnimated = false; // Анимация завершена
            });
          }
        },
        close = function ($panel) {
          if (!$panel.length) {
            return;
          }
          // Закрыть отдельно все вложенные активные панели,
          // И отдельно текущую панель.
          // Это сделано с целью определения события закрытия текущей панели отдельно.

          if (collapsed) {
            // Закрыть активные панели внутри текущей
            var $childrenOpenedPanel = $(config.panel, $panel).filter(function () {
              return $(this).data('active');
            });

            closePanel($childrenOpenedPanel);
          }

          // Закрыть текущую панель
          // Вызов события перед закрытием текущей панели
          $element.trigger('accordionSimple.beforeClose');

          var callback = arguments[1];

          closePanel($panel, function () {
            // Вызов события после закрытия текущей панели
            $element.trigger('accordionSimple.afterClose');

            // Вызов callback функции после закрытия панели
            if (typeof callback === 'function') {
              callback();
            }
          });
        },
        closePanel = function ($panel) {
          // console.log('>>>close<<<');
          var callback = arguments[1];

          // Удалить активный класс со всех элементов
          $panel.closest(config.block).removeClass(config.modifiers.activeClass);

          // Закрыть панель
          $panel
              .slideUp(config.duration, function () {
                // Указать в data-атрибуте, что панель закрыта
                $(this).data('active', false).attr('data-active', false);

                // Вызов события после закрытия каждой панели
                $element.trigger('accordionSimple.afterEachClose');

                // Вызов callback функции после закрытия панели
                if (typeof callback === 'function') {
                  callback();
                }
              });
        },
        togglePanel = function () {
          $(config.switcher).on('click', function (event) {
            // Если в настройках указанно условые отключения аккордеона,
            // то при выполнении этого условия дальнеейшее выполнение функции прекратить
            if (config.destroy) {
              // При этом, если условие является функцией, то вызывается эта функция,
              var cond = (typeof config.destroy.condition === 'function') ? config.destroy.condition() : config.destroy.condition;

              if (cond) return;
            }

            // Если панель во время клика находится в процессе анимации, то выполнение функции прекратить
            // Если переключатель является ссылкой, переход по ссылке НЕ произойдет
            if (isAnimated) {
              event.preventDefault();
              return false;
            }

            // Если текущий пункт не содержит панелей, то выполнение функции прекратить
            // Если переключатель является ссылкой, переход по ссылке произойдет
            var $currentSwitcher = $(this);
            if (!$currentSwitcher.closest(config.block).has(config.panel).length) {
              return false;
            }

            // Начало анимирования панели
            isAnimated = true;

            // Если переключатель является ссылкой, переход по ссылке НЕ произойдет
            event.preventDefault();

            var $currentPanel = $currentSwitcher.closest(config.switcher).siblings(config.panel);

            if ($currentPanel.data('active')) {
              // Закрыть текущую панель
              close($currentPanel, function () {
                // Анимированные панели закончено
                isAnimated = false;
              });
            } else {
              // Открыть текущую панель
              open($currentPanel, function () {
                // Анимированные панели закончено
                isAnimated = false;
              });
            }
          });
        },
        init = function () {
          // Развернуть ВИДИМЫЕ ПАНЕЛИ без анимации
          var $visibleDrop = $(config.panel, $element);

          $visibleDrop.filter(':visible')
              .show().data('active', true).attr('data-active', true);

          $visibleDrop.filter(':visible')
              .closest(config.block).addClass(config.modifiers.activeClass);

          // Добавить внутренние классы на:
          if (config.pluginClasses) {
            // Контейнер аккордеона
            $element.addClass(CONST_CLASSES.element);

            // Блок
            $(config.block, $element).addClass(CONST_CLASSES.block);

            // Переключатель
            var $switcher = $(config.switcher, $element);
            $switcher.addClass(CONST_CLASSES.switcher);

            // Панель
            $visibleDrop.addClass(CONST_CLASSES.panel);
          }

          // Добавить tabindex на переключатели
          if (config.switchersTabindex) {
            $switcher.addClass(CONST_CLASSES.switchersTabindex).attr('tabindex', 0);
          }

          // Add initialization class
          $element.toggleClass(CONST_CLASSES.initClass, config.pluginClasses);

          // Fire event after initialization
          $element.trigger('accordionSimple.afterInit');
        };

    self = {
      callbacks: callbacks,
      togglePanel: togglePanel,
      init: init
    };

    return self;
  };

  function _run (el) {
    el.accordionSimple.callbacks();
    el.accordionSimple.togglePanel();
    el.accordionSimple.init();
  }

  $.fn.accordionSimple = function () {
    var self = this,
        opt = arguments[0],
        args = Array.prototype.slice.call(arguments, 1),
        l = self.length,
        i,
        ret;

    // Обойти все выбранные элементы по отдельности
    // и создань инстансы для каждого из них.
    // Косвенно for предохраняет от попытки
    // создания экземпляра объекта на несуществующем элементе,
    // так как l в таком случае будет равно 0, переменная i также равна 0,
    // следовательно условие i < l не выполнится
    for (i = 0; i < l; i++) {
      if (typeof opt === 'object' || typeof opt === 'undefined') {
        if (self[i].accordionSimple) {
          console.info("%c Warning! Plugin already has initialized! ", 'background: #bd0000; color: white');
          return;
        }

        self[i].accordionSimple = new AccordionSimple(self[i], $.extend(true, {}, $.fn.accordionSimple.defaultOptions, opt));

        _run(self[i]);
      } else {
        ret = self[i].accordionSimple[opt].apply(self[i].accordionSimple, args);
      }
      if (typeof ret !== 'undefined') {
        return ret;
      }
    }
    return self;
  };

  $.fn.accordionSimple.defaultOptions = {
    // Дефолтные значения указаны для следующей структуры DOM:
    // ====================================================
    // <ul>     - аккордеон - ЭЛЕМЕНТ
    //   <li>   - элемент аккордеона (block), пара переключателя и панели - БЛОК
    //     <a>  - заголовок - ЗАГОЛОВОК
    //     <em>  - стрелка (switcher), или другой элемент переключающий панели - ПЕРЕКЛЮЧАТЕЛЬ
    //     <ul> - панель (panel) - ПАНЕЛЬ
    block: 'li',
    switcher: 'li > a + em',
    panel: 'ul',

    // Параметр, указывающий на необходимось сворачивать ранее открытые Панели
    collapsed: true,

    // Скорость анимации Панели
    duration: 300,

    // Добавить tabindex на элемент переключающий панели
    switchersTabindex: false,

    // Условие, при котором аккордеон не реагирует на события.
    // При этом, если условие является функцией, то проверка производится при каждом вызоме,
    // а если - простотым значение, то при загрузке страницы.
    destroy: false,
    // destroy: {
    //   condition: window.innerWidth >= 992,
    // },

    modifiers: {
      activeClass: 'is-open' // Класс, который добавляется, на активный элементы
    }
  };

})(window, document, jQuery);

/* Navigation plugin */
(function (window, document, $, undefined) {
  'use strict';

  var $window = $(window), $document = $(document);

  // Inner Plugin Classes and Modifiers
  // ====================================================
  var PREF = 'jsNav';
  var CONST_CLASSES = {
    element: PREF,
    initClass: PREF + '_initialized',
    item: PREF + '__item',
    drop: PREF + '__drop',
    arrow: PREF + '__arrow',
    arrowEnable: PREF + '__arrow_on',
  };

  var Nav = function (element, config) {
    var self,
        $element = $(element),
        $html = $('html'),
        _classIsAdded = false,
        timeoutAdd,
        timeoutRemove;

    // Время задержки добавления/удаления классов
    // ====================================================
    timeoutAdd = timeoutRemove = config.timeout;
    if (typeof config.timeout === "object") {
      timeoutAdd = config.timeout.add;
      timeoutRemove = config.timeout.remove;
    }

    // Resize, scroll with timeout
    var timeoutEvent;
    $window.on('resize scroll', function (e) {
      clearTimeout(timeoutEvent);

      timeoutEvent = setTimeout(function () {
        if (e.handleObj.origType === "resize") {
          $window.trigger('rangeResize');
        }
        if (e.handleObj.origType === "scroll") {
          $window.trigger('rangeScroll');
        }
      }, 300);
    });

    var callbacks = function () {
          /** track events */
          $.each(config, function (key, value) {
            if (typeof value === 'function') {
              $element.on('nav.' + key, function (e, param) {
                return value(e, $element, param);
              });
            }
          });
        },
        /*Position submenu*/
        addPositionClasses = function (position, feedback, $elem) {
          removePositionClasses($elem);
          $elem.addClass(feedback.horizontal + ' ' + feedback.vertical + ' ' + feedback.important)
              .css(position);
        },
        removePositionClasses = function ($elem) {
          $elem
              .removeClass('top')
              .removeClass('right')
              .removeClass('bottom')
              .removeClass('left')
              .removeClass('center')
              .removeClass('horizontal')
              .removeClass('vertical');
        },
        uiPosition = function (el, at) {
          $.each(el, function () {
            var el = $(this);
            var parent = el.closest(config.item);
            el.position({
              my: "left top",
              at: at,
              collision: "flip flip",
              of: parent,
              using: function (position, feedback) {
                addPositionClasses(position, feedback, el);
              }
            })
          })
        },
        dropPosition = function () {
          var $childrenDrop = $element.children(config.item).children(config.drop);
          var $childrenDropDeeper = $childrenDrop.find(config.drop);

          if (config.accordionView && window.innerWidth < config.accordionView.breakpoint) {
            $childrenDrop.add($childrenDropDeeper).css({
              'position': '',
              'top': '',
              'right': '',
              'bottom': '',
              'left': ''
            });
            removePositionClasses($childrenDrop.add($childrenDropDeeper));
          } else {
            // Подменю первого уровня
            uiPosition($childrenDrop, config.submenuPosition.firstLevel);
            // Подменю второго уровня
            uiPosition($childrenDropDeeper, config.submenuPosition.deeperLevel);
          }
        },
        recalculateDropPosition = function () {
          if (config.submenuPosition && config.submenuPosition.observe) {
            // Recalculate on resize
            $window.on('rangeResize', function () {
              dropPosition();
            });

            // Recalculate on scroll
            $window.on('rangeScroll', function () {
              dropPosition();
            });
          }
        },
        /*Timeout functions*/
        createTimeoutAddClass = function () {
          var $item = arguments[0] || $(config.item, $element);

          // ЗАПУСТИТЬ функцию ДОБАВЛЕНИЯ класса С ЗАДЕРЖКОЙ
          // (одновременно записав ее в аттрибут 'addClassWithTimeout')
          // ====================================================
          $item.prop('addClassWithTimeout', setTimeout(function () {
            addClassesTo($item);
          }, timeoutAdd));
        },
        clearTimeoutAddClass = function () {
          var $item = arguments[0] || $(config.item, $element);

          var addClassWTO = $item.prop('addClassWithTimeout');
          if (addClassWTO) {
            $item.prop('addClassWithTimeout', clearTimeout(addClassWTO));
          }
        },
        createTimeoutRemoveClass = function () {
          var $item = arguments[0] || $(config.item, $element);

          // ЗАПУСТИТЬ функцию УДАЛЕНИЯ класса С ЗАДЕРЖКОЙ
          // (одновременно записав ее в аттрибут 'removeClassWithTimeout')
          // ====================================================
          $item.prop('removeClassWithTimeout', setTimeout(function () {
            removeClassesFrom($item);
          }, timeoutRemove));
        },
        clearTimeoutRemoveClass = function () {
          var $item = arguments[0] || $(config.item, $element);

          var removeTimeoutWTO = $item.prop('removeClassWithTimeout');
          if (removeTimeoutWTO) {
            $item.prop('removeClassWithTimeout', clearTimeout(removeTimeoutWTO));
          }
        },
        /*Add and remove classes*/
        addClassesTo = function () {
          var $item = arguments[0];

          if ($item.length) {
            if (config.submenuPosition) {
              dropPosition();
            }

            $item
                .addClass(config.modifiers.hover)
                .prop('isActive', true);

            if (config.siblings) {
              $item.next().addClass(config.modifiers.hoverNext);
              $item.prev().addClass(config.modifiers.hoverPrev);
            }

            _classIsAdded = true;

            $element.trigger('nav.afterHover', $item);
            // console.log("~~ class hover added: ", $item);
          }
        },
        removeClassesFrom = function () {
          var $item = arguments[0] || $(config.item, $element);

          if ($item.length) {

            $item
                .removeClass(config.modifiers.hover)
                .prop('isActive', false);

            if (config.siblings) {
              $item.next().removeClass(config.modifiers.hoverNext);
              $item.prev().removeClass(config.modifiers.hoverPrev);
            }

            _classIsAdded = false;

            $element.trigger('nav.afterLeave', $item);
            // console.log("~~ class hover removed: ", $item);
          }
        },
        /*Immediate add and remove classes*/
        forceAddClassTo = function () {
          var $item = arguments[0] || $(config.item, $element);

          // Перебрать все элементы
          // ====================================================
          $.each($item, function () {
            var $eachCurItem = $(this);

            // Отметить добавление класса с задержкой
            // ====================================================
            clearTimeoutAddClass($eachCurItem);

            // Добавить класс без задержки
            // ====================================================
            if (!$eachCurItem.prop('isActive')) {
              addClassesTo($eachCurItem);
            }
          });
        },
        forceRemoveClassFrom = function () {
          var $item = arguments[0] || $(config.item, $element);
          // Если вторым параметром передать true, классы будут удалены и с дочерних пунктов
          var cond = arguments[1];

          // Перебрать все элементы
          // ====================================================
          $.each($item, function () {
            var $eachCurItem = $(this);

            // Отметить удаление класса с задержкой
            // ====================================================
            clearTimeoutRemoveClass($eachCurItem);

            // Удалить класс без задержки
            // ====================================================
            if ($eachCurItem.prop('isActive')) {
              removeClassesFrom($eachCurItem);
            }

            // Чтобы провести очиску и в дочерних элементах,
            // нужно передать на вход функции вторым аргументом "true"
            if (cond) {
              // Перебрать всех детей активных пунктов
              // ====================================================
              $.each($eachCurItem.find(config.item), function () {
                var $eachCurChild = $(this);

                // Отметить удаление класса с задержкой
                // ====================================================
                clearTimeoutRemoveClass($eachCurChild);

                // Удалить класс без задержки
                // ====================================================
                if ($eachCurChild.prop('isActive')) {
                  removeClassesFrom($eachCurChild);
                }
              });
            }
          });
        },
        /*Clear classes*/
        removeOnResize = function () {
          var resizeByWidth = true;
          var prevWidth = -1;
          $window.on('rangeResize', function () {
            var currentWidth = $('body').outerWidth();
            resizeByWidth = prevWidth !== currentWidth;
            if (resizeByWidth) {
              removeClassesFrom($(config.item, $element).filter('.' + config.modifiers.hover));

              // console.log('%c >>>remove by WIDTH RESIZE<<<', 'background-color: #00f1ff; color: #ff1515');
              // $(window).trigger('resizeByWidth');
              prevWidth = currentWidth;
            }
          });
        },
        removeByClickOutside = function () {
          $html.on('click', function (event) {

            if (!_classIsAdded || $(event.target).closest($(config.item)).length) return;

            // console.log('%c >>>remove by click OUTSIDE<<<', 'background-color: #00f1ff; color: #ff1515');

            forceRemoveClassFrom();
          });
        },
        removeByClickEsc = function () {
          $html.keyup(function (event) {
            if (_classIsAdded && event.keyCode === 27) {

              // console.log('%c >>>remove by click ESC<<< ', 'background-color: #00f1ff; color: #ff1515');

              forceRemoveClassFrom();
            }
          });

          return false;
        },
        /*Main events*/
        toggleActiveClass = function () {
          var $item = $(config.item, $element);

          // Обработка событий прикосновения к тачскрину,
          // а также ввода и вывода курсора
          // ====================================================
          $element
              .off('touchend mouseenter mouseleave', config.item)
              .on('touchend mouseenter mouseleave', config.item, function (e) {

                // console.log('%c ~~~' + e.handleObj.origType + '~~~ ', 'background: #222; color: #bada55');

                var $curItem = $(this);

                // Если в настройках не отключена трансформация навигации с десктопного вида в мобильный (accordionView: false),
                // то при ширине окна браузера ниже указанного в опции "accordionView.breakpoint"
                // дальнейшее выполнение функции прервать.
                // ====================================================
                if (config.accordionView && window.innerWidth < config.accordionView.breakpoint) return;

                // Также выполнение функции прекратить если:
                // 1) в настройках указанно, что нужно проводить проверку на наличие подменю,
                // 2) и текущий пункт не содержит подменю.
                // ====================================================
                if (config.onlyHasDrop && !$curItem.has(config.drop).length) return;

                // Родительские пункты текущего пункта
                // ====================================================
                var $curParentItems = $curItem.parentsUntil($element, config.item);

                // События на TOUCHEND (для тачскринов)
                // ====================================================
                if (e.handleObj.origType === "touchend" && !config.arrowEnable) {
                  // console.log('%c >>>touchend<<< ', 'background: #222; color: #bada55');

                  if (!$curItem.prop('isActive')) {
                    // Если пункт НЕАКТИВЕН
                    // ====================================================

                    // Удалить БЕЗ ЗАДЕРЖКИ классы hover со ВСЕХ активных пунктов,
                    // кроме ТЕКУЩЕГО.
                    // ====================================================
                    if (!e.stopEventTouchend) {
                      e.stopEventTouchend = true;
                      removeClassesFrom($item.filter('.' + config.modifiers.hover).not($curItem));
                    }

                    // Если текущий пункт не содержит подменю,
                    // то выполнение функции прекратить
                    // !!! Эта проверка проводится в самом конце,
                    //     чтобы можно было удалять активные классы
                    //     при клике на любой пункт, а не только
                    //     содержащий в себе подменю.
                    // ====================================================
                    if (!$curItem.has(config.drop).length) return;

                    // Добавить классы hover на ТЕКУЩИЙ пункт
                    // ====================================================
                    addClassesTo($curItem);

                    e.preventDefault();

                    return;
                  }
                }

                // События на ВВОД курсора
                // ====================================================
                if (e.handleObj.origType === "mouseenter") {
                  // console.log('%c >>>mouseenter<<< ', 'background: #222; color: #bada55');

                  // Перед добавлением класса
                  // ОТМЕНЯЕМ УДАЛЕНИЕ класса С ЗАДЕРЖКОЙ c текущего пункта.
                  // Так как событие всплывая отрабатывает и на РОДИТЕЛЬСКИХ пунктах,
                  // то и на них будут отменены УДАЛЕНИЯ класса С ЗАДЕРЖКОЙ,
                  // которые запускаются на событии "mouseleave".
                  // ====================================================
                  clearTimeoutRemoveClass($curItem);

                  // Отлавливать событие нужно только на последнем пункте
                  // Для этого добавим в объект "stopEventMouseenter"
                  // и проверяем при всплытие события наличие этого свойства.
                  if (e.stopEventMouseenter) return;
                  e.stopEventMouseenter = true;

                  // Если пункт УЖЕ АКТИВЕН,
                  // то повторный ввод курсора в его область
                  // останавливает дальнейшее выполнение функции
                  if ($curItem.prop('isActive')) return;

                  // Удалить БЕЗ ЗАДЕРЖКИ все классы hover со всех активных пунктов,
                  // кроме ТЕКУЩЕГО и РОДИТЕЛЬСКИХ.
                  // ====================================================
                  forceRemoveClassFrom($item.filter('.' + config.modifiers.hover).not($curItem).not($curParentItems));

                  // ЗАПУСТИТЬ функцию ДОБАВЛЕНИЯ класса С ЗАДЕРЖКОЙ
                  // ====================================================
                  createTimeoutAddClass($curItem);

                  return;
                }

                // События на ВЫВОД курсора
                // ====================================================
                if (e.handleObj.origType === "mouseleave") {
                  // console.log('%c >>>mouseleave<<< ', 'background: #222; color: #bada55');

                  // Перед удалением класса нужно
                  // ОТМЕНИТЬ ДОБАВЛЕНИЕ класса С ЗАДЕРЖКОЙ c текущего пункта,
                  // если функция добавления запущена.
                  // ====================================================
                  clearTimeoutAddClass($curItem);

                  // Удалить классы hover
                  // с ТЕКУЩЕГО и РОДИТЕЛЬСКИХ пунктов
                  // ЗАПУСТИТЬ функцию УДАЛЕНИЯ класса С ЗАДЕРЖКОЙ
                  // ====================================================
                  createTimeoutRemoveClass($curItem);
                }
              });

          // Обработка события клика по стрелке
          // ====================================================
          config.arrowEnable &&
          $element.off('click', config.arrow)
              .on('click', config.arrow, function (e) {
                // Если в настройках не отключена трансформация навигации с десктопного вида в мобильный (accordionView: false),
                // то при ширине окна браузера ниже указанного в опции "accordionView.breakpoint"
                // дальнейшее выполнение функции прервать.
                // ====================================================
                if (config.accordionView && window.innerWidth < config.accordionView.breakpoint) return;

                var $curItem = $(this).closest(config.item);

                // Также выполнение функции прекратить если:
                // 1) в настройках указанно, что нужно проводить проверку на наличие подменю,
                // 2) и текущий пункт не содержит подменю.
                // ====================================================
                if (config.onlyHasDrop && !$curItem.has(config.drop).length) return;

                // console.log('%c >>>arrow click<<< ', 'background: #222; color: #bada55');

                // console.log("$curItem.prop('isActive'): ", $curItem.prop('isActive'));
                if (!$curItem.prop('isActive')) {
                  // Если пункт НЕАКТИВЕН
                  // ====================================================

                  // Удалить БЕЗ ЗАДЕРЖКИ классы hover со ВСЕХ активных пунктов,
                  // кроме ТЕКУЩЕГО и РОДИТЕЛЬСКИХ.
                  // ====================================================
                  var $curParentItems = $curItem.parentsUntil($element, config.item);
                  forceRemoveClassFrom($item.filter('.' + config.modifiers.hover).not($curItem).not($curParentItems));

                  /// ДОБАВИТЬ класс hover на ТЕКУЩИЙ пунт С ЗАДЕРЖКОЙ
                  // ====================================================
                  forceAddClassTo($curItem);
                } else {
                  // УДАЛИТЬ классы hover с ТЕКУЩЕГО пунта и ДОЧЕРНИХ БЕЗ ЗАДЕРЖКИ
                  // ====================================================
                  forceRemoveClassFrom($curItem, true);
                }

                e.preventDefault();
              })
        },
        /*Initialize*/
        init = function () {
          // Container
          $element.addClass(CONST_CLASSES.element);

          // Item
          $(config.item, $element).addClass(CONST_CLASSES.item);

          // Submenu
          $(config.drop, $element).addClass(CONST_CLASSES.drop);

          // Arrow
          var $arrow = $(config.arrow, $element);
          $arrow.addClass(CONST_CLASSES.arrow);

          // Add tabindex to arrows
          if (config.arrowEnable) {
            $arrow.addClass(CONST_CLASSES.arrowEnable).attr('tabindex', 0);
          }

          // Position
          if (config.submenuPosition) {
            dropPosition();
          }

          // Initialize accordion
          $element.accordionSimple({
            block: config.item,
            switcher: config.arrow,
            panel: config.drop,
            duration: config.accordion.duration,
            switchersTabindex: false,
            destroy: {
              condition: function () {
                return (config.accordionView && window.innerWidth >= config.accordionView.breakpoint);
              },
            },
            pluginClasses: false,
            modifiers: {
              activeClass: config.accordion.classOpen
            }
          });

          // Add initialization class
          $element.addClass(CONST_CLASSES.initClass);

          // Fire event after initialization
          $element.trigger('nav.afterInit');
        };

    self = {
      callbacks: callbacks,
      recalculateDropPosition: recalculateDropPosition,
      toggleActiveClass: toggleActiveClass,
      clearHoverClassOnResize: removeOnResize,
      removeByClickOutside: removeByClickOutside,
      removeByClickEsc: removeByClickEsc,
      init: init
    };

    return self;
  };

  function _run (el) {
    el.nav.callbacks();
    el.nav.recalculateDropPosition();
    el.nav.toggleActiveClass();
    el.nav.clearHoverClassOnResize();
    el.nav.removeByClickOutside();
    el.nav.removeByClickEsc();
    el.nav.init();
  }

  $.fn.nav = function () {

    var self = this,
        opt = arguments[0],
        args = Array.prototype.slice.call(arguments, 1),
        l = self.length,
        i,
        ret;

    for (i = 0; i < l; i++) {
      if (typeof opt === 'object' || typeof opt === 'undefined') {
        if (self[i].nav) {
          console.info("%c Warning! Plugin already has initialized! ", 'background: #bd0000; color: white');
          return;
        }
        self[i].nav = new Nav(self[i], $.extend(true, {}, $.fn.nav.defaultOptions, opt));

        _run(self[i]);
      } else {
        ret = self[i].nav[opt].apply(self[i].nav, args);
      }
      if (typeof ret !== 'undefined') {
        return ret;
      }
    }
    return self;
  };

  $.fn.nav.defaultOptions = {
    // Дефолтные значения указаны для
    // следующей структуры DOM:
    // ====================================================
    // <ul>     - меню (container)
    //   <li>   - пункт меню (item)
    //     <a>  - ссылка
    //     <em>  - стрелка (arrow)
    //     <ul> - подменю (drop)
    // ====================================================
    item: 'li',
    drop: 'ul',
    arrow: 'li > em',

    // Добавлять классы только на пункты
    // имеющие подпункты
    onlyHasDrop: false,

    // Устанавливать дополнительные классы
    // на соседние пункты активного
    siblings: false,

    // Задержка перед добавлением/удалением класса
    // По умолчанию 50ms
    // Можно указать отдельно для добавления и удаления класса
    // timeout: {
    //   add: 50,
    //   remove: 500
    // }
    // timeout: 50
    timeout: 50,

    // Использовать jQuery UI Position
    // для смещения подменю, в случае выхода за прделы экрана
    // Необходимо подключать jQuery UI
    submenuPosition: {
      firstLevel: 'left bottom',
      deeperLevel: 'right top',
      // Пересчитывать позицию подменю на ресайз и скролл
      observe: false,
    },

    // Активировать стрелки.
    // -----------------------------------------------------------------------------------
    // Если значение "arrowEnable" равно "false" (дефолтное значение):
    // - На ДЕСКТОПЕ переключение класса будет происходить только на ховер с указанной задержкой (см. опицию timeout).
    // - На тачскрине по первому клику добавится класс, а по второму произойдет переход по ссылке.
    //   Для удаления класса, кликнуть вне меню.
    // -----------------------------------------------------------------------------------
    // Если значение "arrowEnable" равно "true":
    // - На ДЕСКТОПЕ переключение класса будет происходить на ховер с указанной задержкой (см. опицию timeout),
    //   а при клике на стрелку - без задержки.
    // - На тачскрине переключение класса будет происходить только по клику на стрелку.
    arrowEnable: false,

    // Навигация трансформируется в аккордеон
    accordionView: {
      // Точка, ниже которой навигация трансформируется в аккордеон
      // Необходимо укзывать всегда, если она отлична от дефолтного значения 991px
      breakpoint: 992,
    },

    // Классы-модификаторы
    modifiers: {
      hover: 'hover',
      hoverNext: 'hover_next',
      hoverPrev: 'hover_prev',
    },

    // Насторойки аккордеона
    accordion: {
      classOpen: 'is-open',
      duration: 300,
    }
  };

})(window, document, jQuery);

/**
 * !Main navigation
 */
function mainNavigation() {
  var $nav = $('.nav-js');
  if ($nav.length) {

    $nav.nav({
      submenuPosition: true,
    });
  }
}

$('.nav-opener-js').on('click', function (e) {
  var $curBtn = $(this);

  $curBtn.add($($curBtn.attr('href'))).addClass('is-open');

  $HTML.addClass('css-scroll-fixed open-only-mob');

  e.preventDefault();
});

function hideNav() {
  $('.is-open').removeClass('is-open');
  $HTML.removeClass('css-scroll-fixed open-only-mob');
}

$('.nav-close-btn-js').on('click', function (e) {
  hideNav();

  e.preventDefault();
});

$('.nav-overlay').on('click', function () {
  hideNav();
});

$HTML.keyup(function (event) {
  if (event.keyCode === 27) {
    hideNav();
  }
});

/**
 * !jquery.drop.js
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
      if (window.innerWidth < 992) return;

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

      var curSlider = new Swiper ($thisSlider, {
        init: false,
        spaceBetween: 20,
        slidesPerView: 4,
        slidesPerGroup: 4,
        // loop: true,
        watchSlidesVisibility: true,
        pagination: {
          el: $pagination,
          type: 'bullets',
          clickable: true
        },
        breakpoints: {
          1365: {
            slidesPerView: 3,
            slidesPerGroup: 3,
          },
          767: {
            slidesPerView: 2,
            slidesPerGroup: 2,
          },
          479: {
            slidesPerView: 2,
            slidesPerGroup: 2,
            spaceBetween: 10,
          },
          359: {
            slidesPerView: 1,
            slidesPerGroup: 1,
            spaceBetween: 10,
          },
        }
      });

      curSlider.on('init', function() {
        $thisSlider.addClass('is-loaded');
      });

      curSlider.init();
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
      
      var curSlider = new Swiper ($curSlider, {
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

      curSlider.on('init', function() {
        $curSlider.addClass('is-loaded');
      });

      curSlider.init();
    });
  }

  // Partners slider
  var $partnersSlider = $('.partners-slider-js');

  if($partnersSlider.length){
    $partnersSlider.each(function () {
      var $thisSlider = $(this),
          $pagination = $thisSlider.find('.swiper-pagination');

      var curSlider = new Swiper ($thisSlider, {
        init: false,
        slidesPerView: 4,
        slidesPerColumn: 2,
        slidesPerGroup: 4,
        spaceBetween: 0,
        // loop: true,
        // loopFillGroupWithBlank: true,
        autoplay: {
          delay: 3000,
        },
        pagination: {
          el: $pagination,
          type: 'bullets',
          clickable: true
        },
        breakpoints: {
          1440: {
            slidesPerView: 3,
            slidesPerColumn: 2,
            slidesPerGroup: 3,
          },
          991: {
            slidesPerView: 2,
            slidesPerColumn: 2,
            slidesPerGroup: 2,
          },
          639: {
            slidesPerView: 4,
            slidesPerColumn: 2,
            slidesPerGroup: 4,
          },
          479: {
            slidesPerView: 3,
            slidesPerColumn: 2,
            slidesPerGroup: 3,
          },
          359: {
            slidesPerView: 2,
            slidesPerColumn: 2,
            slidesPerGroup: 2,
          },
        }
      });

      curSlider.on('init', function() {
        $thisSlider.addClass('is-loaded');
      });

      curSlider.init();

      $thisSlider.mouseenter(function() {
        curSlider.autoplay.stop();
        // console.log('slider stopped');
      });

      $thisSlider.mouseleave(function() {
        curSlider.autoplay.start();
        // console.log('slider started again');
      });
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
    offset: $(".header").innerHeight() + 30,
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
 * Contacts map
 */
function map() {
  var container = 'map';

  if ($('#' + container).length) {
    mapboxgl.accessToken = "pk.eyJ1IjoibWFyMmdpbiIsImEiOiJjazBkcnFzbnowYWFxM2NscXJ1MWk0ZWRtIn0.nq6yC_YGtDtpX_Vyo-PjYg";

    /* Map: This represents the map on the page. */
    var map = new mapboxgl.Map({
      container: container,
      style: "mapbox://styles/mapbox/dark-v10",
      zoom: 10,
      center: [27.4441,53.9277]
    });

    map.on("load", function () {
      /* Image: An image is loaded and added to the map. */
      // map.loadImage("https://i.imgur.com/MK4NUzI.png", function(error, image) {
      map.loadImage("./img/pin.png", function(error, image) {
        if (error) throw error;
        map.addImage("custom-marker", image);
        /* Style layer: A style layer ties together the source and image and specifies how they are displayed on the map. */
        map.addLayer({
          id: "markers",
          type: "symbol",
          /* Source: A data source specifies the geographic coordinate where the image marker gets placed. */
          source: {
            type: "geojson",
            data: {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: "Point",
                    coordinates: [27.4440792, 53.9276985]
                  }
                }
              ]
            }
          },
          layout: {
            "icon-image": "custom-marker",
            "icon-size": 0.5
          }
        });
      });

      // disable map zoom when using scroll
      map.scrollZoom.disable();

      // Add zoom and rotation controls to the map.
      map.addControl(new mapboxgl.NavigationControl());
    });
  }
}

/**
 * Create upload files list
 */
function createUploadFileList() {
  $('.input-file-js').on('change', function (e) {
    var $cur = $(this);
    var $input = $(e.target);

    $.each(e.target.files, function () {
      var fileName = $(this)[0].name;

      if (!$input.attr('multiple')) {
        $cur.next('.uploaded-file').remove();
      }

      $cur.after('<div class="uploaded-file">' + fileName + '</div>');
    });
  })
}

/**
 * !Subscribe Form
 * */
function subscribeForm(){
  var success_class = 'success-form',
      error_class = 'error-form';

  $('.subs-form').ajaxForm({
    beforeSubmit: function (formData, $form, options) {
      $form.find('.subs-success').hide();
      $form.find('.subs-error').hide();

      $form.find('button').prop("disabled", true);
      return true;
    },
    success: function (data, statusText, xhr, $form) {
      data = $.parseJSON(data);
      // console.info(data);
      if (data.result > 1) {
        $form.find('.subs-success').show();
        $('.subs-field input', $form).hide();
        $('.subs-field button', $form).hide();
        $form.addClass('completed');
      } else {
        $form.find('.subs-error').show();
        $form.find('.subs-error').html(data.error);
      }

      $form.find('button').prop("disabled", false);
    }
  });
}

/**
 * !Scroll to top
 * */
$(function () {
  var $btnToTop = $('.btn-to-top-js');

  if ($btnToTop.length) {
    var $page = $('html, body'),
        minScrollTop = 500;

    $(window).on('load scroll resizeByWidth', function () {
      var currentScrollTop = $(window).scrollTop();

      $btnToTop.toggleClass('btn-to-top--show', (currentScrollTop >= minScrollTop));
    });

    $btnToTop.on('click', function (e) {
      e.preventDefault();

      if (!$page.is(':animated')) {
        $page.stop().animate({scrollTop: 0}, 300);
      }
    })
  }
});

/**
 * =========== !ready document, load/resize window ===========
 */

$(document).ready(function () {
  $HTML.addClass('ready');

  loadVideoSrc();
  addTouchClasses();
  objectFitImages(); // object-fit-images initial
  eventsScrollPage();
  // animationElements();
  fullPageInitial();
  placeholderInit();
  formElementState();
  customSelect();
  contactPopup();
  mainNavigation();
  toggleLang();
  menuEvents();
  slidersInit();
  scrollNavigation();
  toggleWidget();
  map();
  createUploadFileList();
  subscribeForm();
});
