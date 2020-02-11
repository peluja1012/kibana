/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Reducer } from 'redux';
import { AlertListState } from '../../types';
import { AppAction } from '../action';

const initialState = (): AlertListState => {
  return {
    alerts: [],
    next: '',
    prev: '',
    request_page_size: 10,
    request_page_index: 0,
    result_from_index: 0,
    total: 0,
    searchBar: {
      query: '',
      filters: [],
    },
  };
};

export const alertListReducer: Reducer<AlertListState, AppAction> = (
  state = initialState(),
  action
) => {
  if (action.type === 'serverReturnedAlertsData') {
    return {
      ...state,
      alerts: action.payload.alerts,
    };
  } else if (action.type === 'userAppliedAlertsSearchFilter') {
    return state;
  }

  return state;
};
