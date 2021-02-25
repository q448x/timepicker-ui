import { TimepickerUI } from 'timepicker-ui';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import '../node_modules/prismjs/plugins/line-numbers/prism-line-numbers.css';
import '../node_modules/prismjs/plugins/line-highlight/prism-line-highlight.css';

document.addEventListener('DOMContentLoaded', () => {
  const options = {
    amLabel: 'AM',
    animation: true,
    appendModalSelector: '.test',
    backdrop: true,
    cancelLabel: 'CANCEL',
    editable: true,
    enableScrollbar: true,
    enableSwitchIcon: false,
    enterTimeLabel: 'Enter Time',
    focusInputAfterCloseModal: false,
    hourMobileLabel: 'Hour',
    iconTemplate: `<i class='material-icons timepicker-ui-keyboard-icon'>keyboard</i>`,
    iconTemplateMobile: `<i class='material-icons timepicker-ui-keyboard-icon'>schedule</i>`,
    incrementHours: 1,
    incrementMinutes: 1,
    minuteMobileLabel: 'Minute',
    mobile: false,
    okLabel: 'OK',
    pmLabel: 'PM',
    preventDefault: false,
    selectTimeLabel: 'Select Time',
    switchToMinutesAfterSelectHour: false,
    theme: 'basic',
  };

  const events = [
    'accept',
    'show',
    'cancel',
    'update',
    'selectminutemode',
    'selecthourmode',
    'selectamtypemode',
    'selectpmtypemode',
  ];

  const basic = document.querySelector('.basic') as HTMLDivElement;
  const radioClass = document.querySelector('.radio') as HTMLDivElement;
  const inputClass = document.querySelector('.inputs') as HTMLDivElement;
  const secondColumn = document.querySelector('.second-column') as HTMLDivElement;
  const eventsDiv = document.querySelector('.events') as HTMLDivElement;

  let objs: any = {};

  const handleCheckboxEvent = (check: any) => {
    alert(`You selected ${check.target.value} event`);
  };

  const handleCheckboxChangeEvents = (el: any) => {
    const checkTarget = el.target as HTMLInputElement;

    if (checkTarget.checked) {
      basic.addEventListener(`${checkTarget.value}`, () => handleCheckboxEvent(el));
    }

    basic.removeEventListener(`${checkTarget.value}`, handleCheckboxEvent);
  };

  const handleEvents = (picker: HTMLDivElement) => {
    setTimeout(() => {
      const checkboxEvents = document.querySelectorAll('.tm-checkbox-events');

      checkboxEvents.forEach((el) => {
        return el.addEventListener('change', handleCheckboxChangeEvents);
      });
    }, 100);
  };

  const basicPicker = () => {
    const obj = {
      appendModalSelector: '.test',
      animation: true,
      backdrop: true,
      preventDefault: false,
      enableScrollbar: true,
      editable: true,
      theme: 'crane-radius',
    };

    objs = { ...obj };

    const tm = new TimepickerUI(basic, obj);

    tm.create();
    tm.open();

    handleEvents(basic);
  };

  basicPicker();

  const basicPicker1 = (opt: Record<string, unknown>, destroy: boolean) => {
    const okbutton = document.querySelector('.timepicker-ui-ok-btn') as HTMLDivElement;

    if (okbutton) {
      if (destroy) {
        setTimeout(() => {
          events.map((e) => {
            return basic.removeEventListener(e, handleCheckboxEvent);
          });
        }, 200);
        okbutton.click();
      }
    }

    objs = { ...objs, ...opt };

    const tm = new TimepickerUI(basic, objs);

    setTimeout(() => {
      tm.create();
      tm.open();
    }, 300);
  };

  const obj = Object.keys(options).reduce((acc, curr) => {
    const accumulator: any = acc;

    accumulator.push({
      type: {
        text: curr,
        //@ts-ignore
        option: options[curr],
      },
    });

    return accumulator;
  }, []);

  obj.map(({ type: { text, option } }, index) => {
    if (typeof option === 'boolean') {
      const template = `
  <div class="form-check">
  <input class="form-check-input tm-checkbox tm-${text}" type="checkbox" name="checkbox-name-${index}" id="checkbox-id-${index}" value="${text}" ${
        option ? 'checked' : ''
      }>
  <label class="form-check-label" for="checkbox-id-${index}">
    ${text}
  </label>
  </div>`;
      radioClass.insertAdjacentHTML('beforeend', template);
    } else {
      const template = `
      <div class="form-group py-2 px-1" >
      <label for="input-id=${index}" class="h6">${text}</label>
      <input type="text" class="form-control tm-input tm-${text}" id="input-id-${index}" data-text="${text}" value="${option}">
    </div>`;

      inputClass.insertAdjacentHTML('beforeend', template);
    }
  });

  const handleDisable = () => {
    const { mobile, enableSwitchIcon } = objs;

    const switches = document.querySelector(
      '.tm-switchToMinutesAfterSelectHour'
    ) as HTMLInputElement;
    const enterTimeLabel = document.querySelector('.tm-enterTimeLabel') as HTMLInputElement;
    const iconTemplateMobile = document.querySelector('.tm-iconTemplateMobile') as HTMLInputElement;
    const iconTemplate = document.querySelector('.tm-iconTemplate') as HTMLInputElement;
    const minuteMobileLabel = document.querySelector('.tm-minuteMobileLabel') as HTMLInputElement;
    const selectTimeLabel = document.querySelector('.tm-selectTimeLabel') as HTMLInputElement;
    const incrementHours = document.querySelector('.tm-incrementHours') as HTMLInputElement;
    const incrementMinutes = document.querySelector('.tm-incrementMinutes') as HTMLInputElement;
    const hourMobileLabel = document.querySelector('.tm-hourMobileLabel') as HTMLInputElement;

    if (mobile) {
      enterTimeLabel.disabled = false;
      hourMobileLabel.disabled = false;
      iconTemplate.disabled = true;
      incrementHours.disabled = true;
      incrementMinutes.disabled = true;
      minuteMobileLabel.disabled = false;
      selectTimeLabel.disabled = true;
      switches.disabled = true;

      if (enableSwitchIcon) {
        iconTemplateMobile.disabled = false;
      } else {
        iconTemplateMobile.disabled = true;
      }
    } else {
      enterTimeLabel.disabled = true;
      hourMobileLabel.disabled = true;
      iconTemplateMobile.disabled = true;
      incrementHours.disabled = false;
      incrementMinutes.disabled = false;
      minuteMobileLabel.disabled = true;
      selectTimeLabel.disabled = false;
      switches.disabled = false;

      if (enableSwitchIcon) {
        iconTemplate.disabled = false;
      } else {
        iconTemplate.disabled = true;
      }
    }
  };
  handleDisable();

  const checkboxes = document.querySelectorAll('.tm-checkbox');
  const inputs = document.querySelectorAll('.tm-input');

  const handleCheckboxChange = (e: Event) => {
    const { value, checked } = e.target as HTMLInputElement;
    basicPicker1({ [value]: checked }, true);
    handleDisable();

    const test = document.querySelector('.code-test') as HTMLDivElement;

    test.innerHTML = `
          import { TimepickerUI } from "timepicker-ui";
          
          const basic = document.querySelector('.basic');
          const basicPicker = new TimepickerUI(basic, ${JSON.stringify(objs)});

          basicPicker.create();
    `;

    Prism.highlightAll();
  };

  const handleInputsChange = (e: Event) => {
    const {
      dataset: { text },
      value,
    } = e.target as HTMLInputElement;
    const texts: any = text;

    basicPicker1({ [texts]: value }, true);
    const test = document.querySelector('.code-test') as HTMLDivElement;

    test.innerHTML = `
        import { TimepickerUI } from "timepicker-ui";

        const basicPicker = new TimepickerUI(basic, ${JSON.stringify(objs)});
        basicPicker.create();
`;

    Prism.highlightAll();
  };

  checkboxes.forEach((el) => {
    return el.addEventListener('change', handleCheckboxChange);
  });

  inputs.forEach((el) => {
    return el.addEventListener('change', handleInputsChange);
  });
  const btnsToggle = document.querySelectorAll('.btn-toggle');

  const btnToggleOpen = document.querySelector('#btn-toggle-open') as HTMLButtonElement;
  const btnToggleClose = document.querySelector('#btn-toggle-close') as HTMLButtonElement;

  btnsToggle.forEach((e) => {
    e.addEventListener('click', () => {
      secondColumn.classList.toggle('show');

      if (secondColumn.classList.contains('show')) {
        secondColumn.style.transform = 'translateX(0)';
        btnToggleOpen.classList.add('d-none');
      } else {
        secondColumn.style.transform = 'translateX(100%)';
        setTimeout(() => {
          btnToggleOpen.classList.remove('d-none');
        }, 300);
      }
    });
  });

  const sidenav = document.querySelector('.sidenav') as HTMLDivElement;
  const btnInside = document.querySelector('.btn-inside') as HTMLButtonElement;

  const allBtns = document.querySelectorAll('.toggle-sidenav');

  allBtns.forEach((e) => {
    return e.addEventListener('click', () => {
      sidenav.classList.toggle('show');

      if (!sidenav.classList.contains('show')) {
        sidenav.style.transform = 'translateX(-100%)';
        setTimeout(() => {
          btnInside.classList.remove('d-none');
        }, 300);
      } else {
        sidenav.style.transform = 'translateX(0)';
        btnInside.classList.add('d-none');
      }
    });
  });

  // events.forEach((el) => {
  //   const template = `
  //   <div class="form-check">
  //   <input class="form-check-input tm-checkbox-events" type="checkbox" name="checkbox-name-${el}" id="checkbox-id-${el}" value="${el}">
  //   <label class="form-check-label" for="checkbox-id-${el}">
  //     ${el}
  //   </label>
  //   </div>`;

  //   eventsDiv.insertAdjacentHTML('beforeend', template);
  // });
});
