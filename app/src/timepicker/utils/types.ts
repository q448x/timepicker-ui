declare type optionTypes = {
  amLabel?: string;
  animation?: boolean;
  appendModalSelector?: HTMLAllCollection | string | Element;
  backdrop?: boolean;
  cancelLabel?: string;
  editable?: boolean;
  enableScrollbar?: boolean;
  enableSwitchIcon?: boolean;
  enterTimeLabel?: string;
  focusInputAfterCloseModal?: boolean;
  hourMobileLabel?: string;
  iconTemplate?: string;
  iconTemplateMobile?: string;
  incrementHours?: number;
  incrementMinutes?: number;
  minuteMobileLabel?: string;
  mobile?: boolean;
  okLabel?: string;
  pmLabel?: string;
  preventDefault?: boolean;
  selectTimeLabel?: string;
  switchToMinutesAfterSelectHour?: boolean;
  theme?: 'basic' | 'crane-straight' | 'crane-radius' | string;
};

export { optionTypes };
