import './styles/main.scss';
import './styles/theme.scss';
import variables from './styles/variables.scss';

import {
  getConfig,
  getRadians,
  getScrollbarWidth,
  clickOrTouchPosition,
  mathDegreesIncrement,
  hasClass,
  getInputValue,
  createNewEvent,
  whichBrowser,
} from './utils';
import {
  getModalTemplate,
  getMobileModalTemplate,
  numberOfHours12,
  numberOfMinutes,
} from './templates';

const DEFAULT_OPTIONS = {
  amLabel: 'AM',
  appendModalSelector: '',
  backdrop: true,
  cancelLabel: 'CANCEL',
  enableScrollbar: false,
  enterTimeLabel: 'Enter Time',
  hourMobileLabel: 'Hour',
  iconClass: 'far fa-keyboard',
  iconClassMobile: 'far fa-clock',
  incrementHours: 1,
  incrementMinutes: 1,
  inputTemplate: '',
  minuteMobileLabel: 'Minute',
  mobile: true,
  okLabel: 'OK',
  pmLabel: 'PM',
  selectTimeLabel: 'Select Time',
  switchToMinutesAfterSelectHour: false,
  theme: 'basic',
};

const DEFAULT_TYPE = {
  amLabel: 'string',
  appendModalSelector: 'string',
  backdrop: 'boolean',
  cancelLabel: 'string',
  enableScrollbar: 'boolean',
  hourMobileLabel: 'string',
  incrementHours: 'number',
  incrementMinutes: 'number',
  inputTemplate: 'string',
  minuteMobileLabel: 'string',
  mobile: 'boolean',
  okLabel: 'string',
  pmLabel: 'string',
  selectTimeLabel: 'string',
  switchToMinutesAfterSelectHour: 'boolean',
  iconClass: 'string',
  iconClassMobile: 'string',
  theme: 'string',
};

const NAME = 'timepicker-ui';
const MOUSE_EVENTS = 'mousedown mouseup mousemove mouseleave mouseover';
const TOUCH_EVENTS = 'touchstart touchmove touchend';
const ALL_EVENTS = MOUSE_EVENTS.concat(` ${TOUCH_EVENTS}`);
const SELECTOR_ACTIVE = 'active';

class TimepickerUI {
  constructor(element, options) {
    this._element = element;
    this._options = getConfig(options, DEFAULT_OPTIONS, DEFAULT_TYPE, NAME);

    this._isMouseMove = false;
    this._degreesHours = null;

    this._isMobileView = false;
    this._isDesktopView = true;

    this.init();

    this.mutliEventsMove = (event) => this._handleEventToMoveHand(event);
    this.mutliEventsMoveHandler = this.mutliEventsMove.bind(this);

    this.eventsClickMobile = (event) => this._handlerClickPmAm(event);
    this.eventsClickMobileHandler = this.eventsClickMobile.bind(this);

    if (this._options.mobile) {
      this._isMobileView = true;
    }
  }

  // getters

  static get NAME() {
    return NAME;
  }

  get modalTemplate() {
    if (!this._options.mobile || !this._isMobileView) {
      return getModalTemplate(this._options);
    } else {
      return getMobileModalTemplate(this._options);
    }
  }

  get modalElement() {
    return document.querySelector('.timepicker-ui-modal');
  }

  get clockFace() {
    return document.querySelector('.timepicker-ui-clock-face');
  }

  get input() {
    return this._element.querySelector('input');
  }

  get clockHand() {
    return document.querySelector('.timepicker-ui-clock-hand');
  }

  get circle() {
    return document.querySelector('.timepicker-ui-circle-hand');
  }

  get tipsWrapper() {
    return document.querySelector('.timepicker-ui-tips-wrapper');
  }

  get minutes() {
    return document.querySelector('.timepicker-ui-minutes');
  }

  get hour() {
    return document.querySelector('.timepicker-ui-hour');
  }

  get AM() {
    return document.querySelector('.timepicker-ui-am');
  }

  get PM() {
    return document.querySelector('.timepicker-ui-pm');
  }

  get minutesTips() {
    return document.querySelector('.timepicker-ui-minutes-time');
  }

  get hourTips() {
    return document.querySelector('.timepicker-ui-hour-time-12');
  }

  get allValueTips() {
    return document.querySelectorAll('.timepicker-ui-value-tips');
  }

  get button() {
    return document.querySelector('.timepicker-ui-button');
  }

  get openElementData() {
    const data = this._element.querySelector('[data-open]');

    if (data) {
      return Object.values(data.dataset)[0];
    } else {
      return null;
    }
  }

  get openElement() {
    return this._element.querySelector(`[data-open='${this.openElementData}']`);
  }

  get cancelButton() {
    return document.querySelector('.timepicker-ui-cancel-btn');
  }

  get okButton() {
    return document.querySelector('.timepicker-ui-ok-btn');
  }

  get activeTypeMode() {
    return document.querySelector('.timepicker-ui-type-mode.active');
  }

  get keyboardClockIcon() {
    return document.querySelector('.timepicker-ui-keyboard-icon');
  }

  get keyboardIconWrapper() {
    return new Promise((resolve) => {
      resolve(document.querySelector('.timepicker-ui-keyboard-icon-wrapper'));
    });
  }

  // public

  init = () => {
    this._setTimepickerClassToElement();
    this._setInputClassToInputElement();
    this._setDataOpenToInputIfDosentExistInWrapper();
    this._setScrollbarOrNot();
    this._setClassTopOpenElement();
    this._handleOpenOnClick();
  };

  open = () => {
    this.init();
  };

  _setTheme() {
    if (this._options.theme === 'crane-straight') {
      const allDiv = this.modalElement.querySelectorAll('div');

      [...allDiv].forEach((div) => div.classList.add('crane-straight'));
    }
  }

  close = () => {
    this._isMouseMove = false;

    ALL_EVENTS.split(' ').map((event) =>
      document.removeEventListener(event, this.mutliEventsMoveHandler, false)
    );

    document.removeEventListener('mousedown', this.eventsClickMobileHandler);
    document.removeEventListener('touchstart', this.eventsClickMobileHandler);

    this._removeAnimationToClose();

    this.openElement.classList.remove('disabled');

    setTimeout(() => {
      this.modalElement.remove();
    }, 300);
  };

  // private

  _setInputClassToInputElement() {
    const input = this._element.querySelector('input');
    if (!hasClass(input, 'timepicker-ui-input')) {
      input.classList.add('timepicker-ui-input');
    }
  }

  _setDataOpenToInputIfDosentExistInWrapper() {
    const input = this._element.querySelector('input');

    if (this.openElementData === null) {
      input.setAttribute('data-open', 'timepicker-ui-input');
    }
  }

  _setClassTopOpenElement() {
    this.openElement.classList.add('timepicker-ui-open-element');
  }

  _removeBackdrop() {
    if (this._options.backdrop) return;

    this.modalElement.classList.add('removed');
    this.openElement.classList.add('disabled');
  }

  _eventsBundle() {
    this._setModalTemplate();
    this._removeBackdrop();
    this._setClassActiveToHourOnOpen();
    this._setBgColorToCirleWithHourTips();

    if (this.clockFace !== null) this._setNumbersToClockFace();

    setTimeout(() => {
      this._setTheme();
    }, 0);

    this._setAnimationToOpen();
    this._getInputValueOnOpenAndSet();
    this._toggleClassActiveToValueTips(this.hour.textContent);

    if (this.clockFace !== null) {
      this._setTransformToCircleWithSwitchesHour(this.hour.textContent);
      this._handleAnimationClock();
    }

    this._handleMinutesClick();
    this._handleHourClick();
    this._handleAmClick();
    this._handlePmClick();
    this._handleMoveHand();
    this._handleCancelButton();
    this._handleOkButton();
    this._handleBackdropClick();

    this._handleIconChangeView();

    this._handleClickOnHourMobile(this.hour);
    this._handleClickOnHourMobile(this.minute);
  }

  _handleOpenOnClick = () => {
    this.openElement.addEventListener('click', () => this._eventsBundle());
  };

  _getInputValueOnOpenAndSet() {
    const value = getInputValue(this.input);

    if (value === undefined) {
      this.hour.innerText = '12';
      this.minutes.innerText = '00';
      this.AM.classList.add('active');

      createNewEvent(this._element, 'openOnclickEvent', {
        hour: this.hour.textContent,
        minutes: this.minutes.textContent,
        type: this.AM.textContent,
      });

      return;
    }

    const { hour, minutes, type } = value;
    const typeMode = document.querySelector(`[data-type="${type}"]`);

    this.hour.innerText = hour;
    this.minutes.innerText = minutes;
    typeMode.classList.add('active');

    createNewEvent(this._element, 'openOnclickEvent', value);
  }

  _handleCancelButton = () => {
    this.cancelButton.addEventListener('click', (event) => {
      const value = getInputValue(this.input);

      createNewEvent(this._element, 'cancelOnClickEvent', value);

      this.close();
    });
  };

  _handleOkButton = () => {
    this.okButton.addEventListener('click', (event) => {
      const validHours = this._handleValueAndCheck(this.hour.textContent, 'hour');
      const validMinutes = this._handleValueAndCheck(this.minutes.textContent, 'minutes');

      if (validHours === false || validMinutes === false) {
        if (!validMinutes) {
          this.minutes.classList.add('invalid-value');
        }

        return;
      }

      this.input.value = `${this.hour.textContent}:${this.minutes.textContent} ${this.activeTypeMode.textContent}`;
      this.close();
    });
  };

  _handleBackdropClick = (ev) => {
    this.modalElement.addEventListener('click', (event) => {
      if (!hasClass(event.target, 'timepicker-ui-modal')) return;

      const value = getInputValue(this.input);

      createNewEvent(this._element, 'cancelOnClickEvent', value);

      this.close();
    });
  };

  _setBgColorToCirleWithHourTips = () => {
    if (this.minutesTips !== null || this._options.mobile) return;

    if (this._options.theme === 'crane-straight') {
      this.circle.style.backgroundColor = variables.cranered400;
    } else {
      this.circle.style.backgroundColor = variables.purple;
    }
  };

  _setBgColorToCircleWithMinutesTips = () => {
    if (numberOfMinutes.includes(this.minutes.textContent)) {
      if (this._options.theme === 'crane-straight') {
        this.circle.style.backgroundColor = variables.cranered400;
      } else {
        this.circle.style.backgroundColor = variables.purple;
      }
      this.circle.classList.remove('small-circle');
    }
  };

  _removeBgColorToCirleWithMinutesTips = () => {
    if (numberOfMinutes.includes(this.minutes.textContent)) return;

    this.circle.style.backgroundColor = '';
    this.circle.classList.add('small-circle');
  };

  _setTimepickerClassToElement = () => {
    this._element.classList.add(NAME);
  };

  _setClassActiveToHourOnOpen = () => {
    if (this._options.mobile || this._isMobileView) return;

    this.hour.classList.add(SELECTOR_ACTIVE);
  };

  _setMinutesToClock = (value) => {
    if (this.clockFace !== null) this._setTransformToCircleWithSwitchesMinutes(value);
    this.tipsWrapper.innerHTML = '';
    this._removeBgColorToCirleWithMinutesTips();
    this._setNumbersToClockFace(numberOfMinutes, 'timepicker-ui-minutes-time');
    this._toggleClassActiveToValueTips(value);
  };

  _setHoursToClock = (value) => {
    if (this.clockFace !== null) {
      this._setTransformToCircleWithSwitchesHour(value);
      this.tipsWrapper.innerHTML = '';
      this._setBgColorToCirleWithHourTips();
      this._setNumbersToClockFace();
      this._toggleClassActiveToValueTips(value);
    }
  };

  _setTransformToCircleWithSwitchesHour = (val) => {
    const value = Number(val);
    const degrees = value > 12 ? value * 30 - 360 : value * 30;
    this.clockHand.style.transform = `rotateZ(${degrees}deg)`;
  };

  _setTransformToCircleWithSwitchesMinutes = (val) => {
    this.clockHand.style.transform = `rotateZ(${Number(val) * 6}deg)`;
  };

  _handleAmClick = () => {
    this.AM.addEventListener('click', (ev) => {
      const { target } = ev;

      target.classList.add(SELECTOR_ACTIVE);
      this.PM.classList.remove(SELECTOR_ACTIVE);
    });
  };

  _handlePmClick = () => {
    this.PM.addEventListener('click', (ev) => {
      const { target } = ev;

      target.classList.add(SELECTOR_ACTIVE);
      this.AM.classList.remove(SELECTOR_ACTIVE);
    });
  };

  _handleAnimationClock = () => {
    setTimeout(() => {
      this.clockFace.classList.add('timepicker-ui-clock-animation');

      setTimeout(() => {
        this.clockFace.classList.remove('timepicker-ui-clock-animation');
      }, 600);
    }, 150);
  };

  _handleAnimationSwitchTipsMode() {
    this.clockHand.classList.add('timepicker-ui-tips-animation');
    setTimeout(() => {
      this.clockHand.classList.remove('timepicker-ui-tips-animation');
    }, 401);
  }

  _handleHourClick = () => {
    this.hour.addEventListener('click', (ev) => {
      const { target } = ev;

      if (this.clockFace !== null) this._handleAnimationSwitchTipsMode();

      this._setHoursToClock(target.textContent);
      target.classList.add(SELECTOR_ACTIVE);
      this.minutes.classList.remove(SELECTOR_ACTIVE);

      if (this.clockFace !== null) this.circle.classList.remove('small-circle');
    });
  };

  _handleMinutesClick = () => {
    this.minutes.addEventListener('click', (ev) => {
      const { target } = ev;

      if (this.clockFace !== null) this._handleAnimationSwitchTipsMode();

      if (this.clockFace !== null) this._setMinutesToClock(target.textContent);
      target.classList.add(SELECTOR_ACTIVE);
      this.hour.classList.remove(SELECTOR_ACTIVE);
    });
  };

  _handleEventToMoveHand = (event) => {
    if (!whichBrowser()) event.preventDefault();

    const { type, target } = event;
    const { incrementMinutes, incrementHours, switchToMinutesAfterSelectHour } = this._options;

    const { x, y } = clickOrTouchPosition(event, this.clockFace);
    const clockFaceRadius = this.clockFace.offsetWidth / 2;
    let rtangens = Math.atan2(y - clockFaceRadius, x - clockFaceRadius);

    if (whichBrowser()) {
      const touchClick = clickOrTouchPosition(event, this.clockFace, true);
      rtangens = Math.atan2(touchClick.y - clockFaceRadius, touchClick.x - clockFaceRadius);
    }

    if (type === 'mouseup' || type === 'touchend') {
      this._isMouseMove = false;

      if (switchToMinutesAfterSelectHour) this.minutes.click();

      return;
    }

    if (
      type === 'mousedown' ||
      type === 'mousemove' ||
      type === 'touchmove' ||
      type === 'touchmove'
    ) {
      if (type === 'mousedown' || type === 'touchstart' || type === 'touchmove') {
        if (
          hasClass(target, 'timepicker-ui-clock-face') ||
          hasClass(target, 'timepicker-ui-circle-hand') ||
          hasClass(target, 'timepicker-ui-hour-time-12') ||
          hasClass(target, 'timepicker-ui-minutes-time') ||
          hasClass(target, 'timepicker-ui-clock-hand') ||
          hasClass(target, 'timepicker-ui-value-tips')
        ) {
          this._isMouseMove = true;
        }
      }
    }

    if (!this._isMouseMove) return;

    if (this.minutesTips !== null) {
      let degrees = Math.trunc((rtangens * 180) / Math.PI) + 90;

      if (incrementMinutes === 5) {
        degrees = mathDegreesIncrement(degrees, 30);
      } else if (incrementMinutes === 10) {
        degrees = mathDegreesIncrement(degrees, 60);
      } else if (incrementMinutes === 15) {
        degrees = mathDegreesIncrement(degrees, 60);
      }

      let minute;

      if (degrees < 0) {
        minute = Math.round(360 + degrees / 6) % 60;
        degrees = 360 + Math.round(degrees / 6) * 6;
      } else {
        minute = Math.round(degrees / 6) % 60;
        degrees = Math.round(degrees / 6) * 6;
      }

      this.minutes.innerText = minute >= 10 ? minute : `0${minute}`;
      this.clockHand.style.transform = `rotateZ(${degrees}deg)`;

      this._degreesMinutes = degrees;

      this._toggleClassActiveToValueTips(this.minutes.textContent);
      this._removeBgColorToCirleWithMinutesTips();
      this._setBgColorToCircleWithMinutesTips();
    }

    if (this.hourTips !== null) {
      let degrees = Math.trunc((rtangens * 180) / Math.PI) + 90;

      degrees = mathDegreesIncrement(degrees, 30);

      if (incrementHours === 2) {
        degrees = mathDegreesIncrement(degrees, 60);
      } else if (incrementHours === 3) {
        degrees = mathDegreesIncrement(degrees, 90);
      }

      this.clockHand.style.transform = `rotateZ(${degrees}deg)`;
      this._degreesHours = degrees;

      let hour;
      if (degrees < 0) {
        hour = Math.round(360 + degrees / 30) % 12;
        degrees = 360 + degrees;
      } else {
        hour = Math.round(degrees / 30) % 12;
        if (hour === 0 || hour > 12) {
          hour = 12;
        }
      }

      this.hour.innerText = hour > 9 ? hour : `0${hour}`;

      this._toggleClassActiveToValueTips(hour);
    }

    createNewEvent(this._element, 'updateEvent', {
      ...getInputValue(this.input),
      degreesHours: this._degreesHours,
      degreesMinutes: this._degreesMinutes,
      eventType: type,
    });
  };

  _toggleClassActiveToValueTips = (value) => {
    const element = [...this.allValueTips].find((tip) => Number(tip.innerText) === Number(value));

    [...this.allValueTips].forEach((element) => element.classList.remove('active'));

    if (element === undefined) return;

    element.classList.add('active');
  };

  _handleMoveHand = () => {
    if (this._options.mobile || this._isMobileView) return;

    ALL_EVENTS.split(' ').map((event) =>
      document.addEventListener(event, this.mutliEventsMoveHandler, false)
    );
  };

  _setModalTemplate = () => {
    const { appendModalSelector } = this._options;

    if (appendModalSelector === '') {
      document.body.insertAdjacentHTML('afterend', this.modalTemplate);
    } else {
      const element = document.querySelector(appendModalSelector);

      element.insertAdjacentHTML('beforeend', this.modalTemplate);
    }
  };

  _setScrollbarOrNot = () => {
    const { enableScrollbar } = this._options;

    if (!enableScrollbar) {
      document.body.style.overflowY = 'hidden';
      document.body.style.paddingRight = `${getScrollbarWidth()}px`;
    }
  };

  _setNumbersToClockFace = (array = numberOfHours12, classToAdd = 'timepicker-ui-hour-time-12') => {
    const el = 360 / array.length;
    const clockWidth = (this.clockFace.offsetWidth - 32) / 2;
    const clockHeight = (this.clockFace.offsetHeight - 32) / 2;
    const radius = clockWidth - 9;

    array.forEach((num, index) => {
      const angle = getRadians(index * el);
      const span = document.createElement('span');
      const spanTips = document.createElement('span');

      spanTips.innerHTML = num;
      spanTips.classList.add('timepicker-ui-value-tips');
      span.classList.add(classToAdd);

      if (this._options.theme === 'crane-straight') {
        span.classList.add('crane-straight');
        spanTips.classList.add('crane-straight');
      }

      span.style.left = `${clockWidth + Math.sin(angle) * radius - span.offsetWidth}px`;
      span.style.bottom = `${clockHeight + Math.cos(angle) * radius - span.offsetHeight}px`;

      span.appendChild(spanTips);
      this.tipsWrapper.appendChild(span);
    });
  };

  _setAnimationToOpen() {
    this.modalElement.classList.add('opacity');

    setTimeout(() => {
      this.modalElement.classList.add('show');
    }, 150);
  }

  _removeAnimationToClose() {
    setTimeout(() => {
      this.modalElement.classList.remove('show');
    }, 150);
  }

  _handleValueAndCheck(val, type) {
    const value = Number(val);

    if (type === 'hour') {
      if (value > 0 && value <= 12) {
        return true;
      } else {
        return false;
      }
    } else if (type === 'minutes') {
      if (value >= 0 && value <= 59) {
        return true;
      } else {
        return false;
      }
    }
  }

  async _handleIconChangeView() {
    const handlerViewChange = async () => {
      if (!hasClass(this.modalElement, 'mobile')) {
        this.close();

        this._isMobileView = true;
        this._options.mobile = true;
        this._isDesktopView = false;

        const beforeHourContent = this.hour.textContent;
        const beforeMinutesContent = this.minutes.textContent;
        const beforeTypeModeContent = this.activeTypeMode.textContent;

        setTimeout(() => {
          this._eventsBundle();

          this._isMobileView = false;
          this._options.mobile = false;
          this._isDesktopView = true;

          this.hour.textContent = beforeHourContent;
          this.minutes.textContent = beforeMinutesContent;

          const typeMode = document.querySelectorAll('.timepicker-ui-type-mode');
          typeMode.forEach((type) => type.classList.remove('active'));

          const nowActiveType = [...typeMode].find(
            (type) => type.textContent === beforeTypeModeContent
          );
          nowActiveType.classList.add('active');
        }, 300);
      } else {
        const validHours = this._handleValueAndCheck(this.hour.textContent, 'hour');
        const validMinutes = this._handleValueAndCheck(this.minutes.textContent, 'minutes');

        if (validHours === false || validMinutes === false) {
          if (!validMinutes) {
            this.minutes.classList.add('invalid-value');
          }

          if (!validHours) {
            this.hour.classList.add('invalid-value');
          }

          return;
        }

        if (validHours === true && validMinutes === true) {
          if (validMinutes) {
            this.minutes.classList.remove('invalid-value');
          }

          if (validHours) {
            this.hour.classList.remove('invalid-value');
          }
        }

        this.close();

        this._isMobileView = false;
        this._options.mobile = false;
        this._isDesktopView = true;

        const beforeHourContent = this.hour.textContent;
        const beforeMinutesContent = this.minutes.textContent;
        const beforeTypeModeContent = this.activeTypeMode.textContent;

        setTimeout(() => {
          this._eventsBundle();

          this._isMobileView = true;
          this._options.mobile = true;
          this._isDesktopView = false;

          this.hour.textContent = beforeHourContent;
          this.minutes.textContent = beforeMinutesContent;

          const typeMode = document.querySelectorAll('.timepicker-ui-type-mode');
          typeMode.forEach((type) => type.classList.remove('active'));

          const nowActiveType = [...typeMode].find(
            (type) => type.textContent === beforeTypeModeContent
          );
          nowActiveType.classList.add('active');

          this._setTransformToCircleWithSwitchesHour(this.hour.textContent);
          this._toggleClassActiveToValueTips(this.hour.textContent);
        }, 300);
      }
    };

    this.keyboardClockIcon.addEventListener('touchdown', (event) => handlerViewChange(event));
    this.keyboardClockIcon.addEventListener('mousedown', (event) => handlerViewChange(event));
  }
  // Mobile version
  _handlerClickPmAm = async ({ target }) => {
    const allTrue = this.modalElement.querySelectorAll('[contenteditable]');
    const validHours = this._handleValueAndCheck(this.hour.textContent, 'hour');
    const validMinutes = this._handleValueAndCheck(this.minutes.textContent, 'minutes');

    if (!hasClass(this.modalElement, 'mobile')) return;

    if (!hasClass(target, 'timepicker-ui-hour') && !hasClass(target, 'timepicker-ui-minutes')) {
      allTrue.forEach((el) => {
        el.contentEditable = false;
        el.classList.remove('active');
      });

      if (validHours === true && validMinutes === true) {
        if (validMinutes) {
          this.minutes.classList.remove('invalid-value');
        }

        if (validHours) {
          this.hour.classList.remove('invalid-value');
        }
      }
    } else {
      if (validHours === false || validMinutes === false) {
        if (!validMinutes) {
          this.minutes.classList.add('invalid-value');
        }

        if (!validHours) {
          this.hour.classList.add('invalid-value');
        }
      }

      target.contentEditable = true;
    }
  };

  _handleClickOnHourMobile() {
    if (!this._options.mobile || !this._isMobileView) return;

    document.addEventListener('mousedown', this.eventsClickMobileHandler);
    document.addEventListener('touchstart', this.eventsClickMobileHandler);
  }
}
export default TimepickerUI;

const test = document.querySelector('.test');

const xd = new TimepickerUI(test, { mobile: false });

const test1 = document.querySelector('.test1');

const xd1 = new TimepickerUI(test1, { mobile: true });
