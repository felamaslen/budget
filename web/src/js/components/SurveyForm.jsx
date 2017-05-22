/*
 * React component to display a form
 */

import React, { PropTypes } from 'react';
import { List } from 'immutable';
import classNames from 'classnames';

import PureControllerView from './PureControllerView';

import {
  FORM_NUM_STEPS,
  FORM_TITLES
} from '../config';

import {
  formNextClicked,
  formInputChanged,
  formResetClicked
} from '../actions/FormActions';

export class SurveyForm extends PureControllerView {
  render() {
    // render each part of the form (2 parts)
    const parts = Array.apply(null, { length: FORM_NUM_STEPS }).map((_, step) => {
      const className = classNames({
        section: true,
        hidden: step !== this.props.formStep
      });

      return (
        <div key={step} className={className}>
          {this.renderFormPart(step)}
        </div>
      );
    });

    // loading spinner for when the form is being submitted
    const loadingClasses = classNames({
      loading: true,
      hidden: !this.props.formLoading
    });
    const loading = (
      <div className={loadingClasses}>Loading...</div>
    );

    // status bar showing which part of the form we're at
    const statusClasses = classNames({
      status: true,
      hidden: this.props.formSubmitted
    });
    const progressStyle = {
      width: (100 * this.props.formStep / FORM_NUM_STEPS) + '%'
    };
    const status = (
      <div className={statusClasses}>
        <span className="progress" style={progressStyle}></span>
        <span className="text">{this.props.formStatusText}</span>
      </div>
    );

    // thank you message when form has been submitted
    const thankyouClasses = classNames({
      hidden: !this.props.formSubmitted
    });
    const thankyou = (
      <div id="thankyou" className={thankyouClasses}>
        <h2>Thank you!</h2>
        <p>
          Your response has been submitted.
        </p>
        <p>
          <button onClick={this.resetForm.bind(this)}>New response</button>
        </p>
      </div>
    );

    // combine all the different sections together
    const form = (
      <div id="main-form">
        {status}
        {parts}
        {loading}
        {thankyou}
      </div>
    );

    return form;
  }

  resetForm() {
    this.dispatchAction(formResetClicked());
  }

  renderFormPart(step) {
    /* Render part of the form, based on which step we're at. */
    switch (step) {
    case 0:
      return (
        <ul>
          <li>
            <span className="label">Title:</span>
            <span className={classNames({
              input: true,
              error: this.props.formValues.getIn([step, 'title', 'error'])
            })}>
              <select ref="input_title" type="text" name="title"
                value={this.props.formValues.getIn([step, 'title', 'value'])}
                onChange={this.handleChange.bind(this, 'title')}>
                {FORM_TITLES.map((title, key) => (
                  <option key={key} value={title}>{title}</option>
                ))}
              </select>
            </span>
          </li>
          <li>
            <span className="label">Name:</span>
            <span className={classNames({
              input: true,
              error: this.props.formValues.getIn([step, 'name', 'error'])
            })}>
              <input ref="input_name" type="text" name="name"
                value={this.props.formValues.getIn([step, 'name', 'value'])}
                onChange={this.handleChange.bind(this, 'name')} />
            </span>
          </li>
          <li>
            <span className="label">Date of Birth:</span>
            <span className={classNames({
              input: true,
              error: this.props.formValues.getIn([step, 'dob', 'error'])
            })}>
              <input ref="input_dob" type="date" name="dob"
                value={this.props.formValues.getIn([step, 'dob', 'value'])}
                onChange={this.handleChange.bind(this, 'dob')} />
            </span>
          </li>
          <li>
            <button id="btn-next" onClick={this.nextStep.bind(this)}>Next</button>
          </li>
        </ul>
      );

    case 1:
      return (
        <ul className="form-section">
          <li>
            <span className="label">Current location:</span>
            <span className={classNames({
              input: true,
              error: this.props.formValues.getIn([step, 'location', 'error'])
            })}>
              <input ref="input_location" type="text" name="location"
                value={this.props.formValues.getIn([step, 'location', 'value'])}
                onChange={this.handleChange.bind(this, 'location')} />
            </span>
          </li>
          <li>
            <span className="label">Current time:</span>
            <span className={classNames({
              input: true,
              error: this.props.formValues.getIn([step, 'datetime', 'error'])
            })}>
              <input ref="input_datetime" type="datetime-local" name="datetime"
                value={this.props.formValues.getIn([step, 'datetime', 'value'])}
                onChange={this.handleChange.bind(this, 'datetime')} />
            </span>
          </li>
          <li>
            <span className="label">User feedback:</span>
            <span className={classNames({
              input: true,
              error: this.props.formValues.getIn([step, 'feedback', 'error'])
            })}>
              <textarea rows="4" ref="input_feedback" name="feedback"
                value={this.props.formValues.getIn([step, 'feedback', 'value'])}
                onChange={this.handleChange.bind(this, 'feedback')} />
            </span>
          </li>
          <li>
            <span>
              <button id="btn-submit" onClick={this.nextStep.bind(this)}>Submit</button>
            </span>
          </li>
        </ul>
      );

    default:
      return null; // don't render anything
    }
  }

  handleChange(prop, event) {
    const value = event.target.value;
    this.dispatchAction(formInputChanged({ prop, value }));
  }

  nextStep() {
    const step = this.props.formStep;

    // go to the next part of the form if it exists, otherwise submit
    this.dispatchAction(formNextClicked({ step }));
  }
}

SurveyForm.propTypes = {
  formLoading: PropTypes.bool,
  formSubmitted: PropTypes.bool,
  formStep: PropTypes.number,
  formStatusText: PropTypes.string,
  formValues: PropTypes.instanceOf(List)
};

