/* Client app constant (ish) parameters */

// there are two form sections
export const FORM_NUM_STEPS = 2;

export const FORM_TITLES = ['', 'Mr', 'Mrs', 'Miss', 'Ms', 'Dr'];

// decides what to display on the status bar
export const formGetStatus = step => {
  if (step < FORM_NUM_STEPS) {
    return `Step ${step + 1} of ${FORM_NUM_STEPS}`;
  }

  return 'Submitting form';
}

const getCurrentDateTime = () => {
  const isoString = new Date().toISOString();
  return isoString.substring(0, isoString.lastIndexOf(':'));
}

const DATETIME_REGEX = /^[0-9]{4}\-[0-1][0-9]\-[0-3][0-9]T[0-2][0-9]\:[0-5][0-9](\:[0-5][0-9])?$/;
const DOB_REGEX = /^[0-9]{4}\-[0-1][0-9]\-[0-3][0-9]$/;

// each object in this list corresponds to a separate form section
// the error parameter corresponds to whether that form element has an error
// the valid parameter is an anonymous function on the value, to validate it
export const formDefaultValues = () => [
  {
    title: {
      value: FORM_TITLES[0],
      error: false,
      valid: value => value.length > 0
    },
    name: {
      value: '',
      error: false,
      valid: value => value.length > 0
    },
    dob: {
      value: '',
      error: false,
      valid: value => value.match(DOB_REGEX)
    }
  },
  {
    location: {
      value: '',
      error: false,
      valid: value => value.length > 0
    },
    datetime: {
      value: getCurrentDateTime(),
      error: false,
      valid: value => value.match(DATETIME_REGEX)
    },
    feedback: {
      value: '',
      error: false,
      valid: value => value.length > 0
    }
  }
];

