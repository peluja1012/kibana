/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { exception } from '../objects/exception';

import { RULE_STATUS } from '../screens/create_new_rule';
import { SERVER_SIDE_EVENT_COUNT } from '../screens/timeline';

import {
  addExceptionFromFirstAlert,
  goToClosedAlerts,
  goToManageAlertsDetectionRules,
  goToOpenedAlerts,
  waitForAlertsIndexToBeCreated,
} from '../tasks/alerts';
import { goToRuleDetails, deleteRule } from '../tasks/alerts_detection_rules';
import { waitForAlertsToPopulate } from '../tasks/create_new_rule';
import { esArchiverLoad, esArchiverUnload } from '../tasks/es_archiver';
import { loginAndWaitForPageWithoutDateRange } from '../tasks/login';
import {
  activatesRule,
  addsException,
  addsExceptionFromRuleSettings,
  deactivatesRule,
  goToAlertsTab,
  goToExceptionsTab,
  removeException,
  waitForTheRuleToBeExecuted,
} from '../tasks/rule_details';
import { refreshPage } from '../tasks/security_header';

import { DETECTIONS_URL } from '../urls/navigation';

const numberOfauditbeatExceptionsAlerts = 2;

describe('Exceptions', () => {
  beforeEach(() => {
    esArchiverLoad('rule_for_exceptions_from_alert');
    loginAndWaitForPageWithoutDateRange(DETECTIONS_URL);
    waitForAlertsIndexToBeCreated();
    goToManageAlertsDetectionRules();
    goToRuleDetails();
    esArchiverLoad('auditbeat_for_exceptions_from_alert');
    activatesRule();
    waitForTheRuleToBeExecuted();
    waitForAlertsToPopulate();
    refreshPage();
  });
  afterEach(() => {
    deleteRule();
    esArchiverUnload('rule_for_exceptions_from_alert');
    // Delete signals index
    cy.request({
      method: 'DELETE',
      url: `api/detection_engine/index`,
      headers: { 'kbn-xsrf': 'delete-signals' },
    });
    esArchiverUnload('auditbeat_for_exceptions_from_alert');
    esArchiverUnload('auditbeat_for_exceptions_from_alert2');
  });

  describe('when exception is added from an alert', () => {
    beforeEach(() => {
      addExceptionFromFirstAlert();
      addsException(exception);
    });
    afterEach(() => {
      esArchiverUnload('auditbeat_for_exceptions_from_alert2');
    });

    it('closes existing alerts', () => {
      cy.scrollTo('bottom');
      cy.get(SERVER_SIDE_EVENT_COUNT)
        .invoke('text')
        .then((numberOfAlertsAfterCreatingExceptionText) => {
          cy.wrap(parseInt(numberOfAlertsAfterCreatingExceptionText, 10)).should('eql', 0);
        });

      goToClosedAlerts();
      refreshPage();

      cy.scrollTo('bottom');
      cy.get(SERVER_SIDE_EVENT_COUNT)
        .invoke('text')
        .then((numberOfClosedAlertsAfterCreatingExceptionText) => {
          cy.wrap(parseInt(numberOfClosedAlertsAfterCreatingExceptionText, 10)).should(
            'eql',
            numberOfauditbeatExceptionsAlerts
          );
        });
    });

    it('stops new alerts from being generated', () => {
      goToOpenedAlerts();
      esArchiverLoad('auditbeat_for_exceptions_from_alert2');
      activatesRule();
      waitForTheRuleToBeExecuted();
      refreshPage();

      cy.scrollTo('bottom');
      cy.get(SERVER_SIDE_EVENT_COUNT)
        .invoke('text')
        .then((numberOfOpenedAlertsAfterCreatingExceptionText) => {
          cy.wrap(parseInt(numberOfOpenedAlertsAfterCreatingExceptionText, 10)).should('eql', 0);
        });
    });

    it('generates alerts after exception is removed', () => {
      goToExceptionsTab();
      removeException();
      esArchiverLoad('auditbeat_for_exceptions_from_alert2');
      goToAlertsTab();
      waitForTheRuleToBeExecuted();
      waitForAlertsToPopulate();
      refreshPage();

      cy.scrollTo('bottom');
      cy.get(SERVER_SIDE_EVENT_COUNT)
        .invoke('text')
        .then((numberOfAlertsAfterRemovingExceptionsText) => {
          cy.wrap(parseInt(numberOfAlertsAfterRemovingExceptionsText, 10)).should(
            'eql',
            numberOfauditbeatExceptionsAlerts
          );
        });
    });
  });
  describe('when exception is added from the rule details page', () => {
    beforeEach(() => {
      goToExceptionsTab();
      addsExceptionFromRuleSettings(exception);
      goToAlertsTab();
    });
    afterEach(() => {
      esArchiverUnload('auditbeat_for_exceptions_from_alert2');
    });

    it('closes existing alerts', () => {
      cy.scrollTo('bottom');
      cy.get(SERVER_SIDE_EVENT_COUNT)
        .invoke('text')
        .then((numberOfAlertsAfterCreatingExceptionText) => {
          cy.wrap(parseInt(numberOfAlertsAfterCreatingExceptionText, 10)).should('eql', 0);
        });

      goToClosedAlerts();
      refreshPage();

      cy.scrollTo('bottom');
      cy.get(SERVER_SIDE_EVENT_COUNT)
        .invoke('text')
        .then((numberOfClosedAlertsAfterCreatingExceptionText) => {
          cy.wrap(parseInt(numberOfClosedAlertsAfterCreatingExceptionText, 10)).should(
            'eql',
            numberOfauditbeatExceptionsAlerts
          );
        });
    });

    it('stops new alerts from being generated', () => {
      goToOpenedAlerts();
      esArchiverLoad('auditbeat_for_exceptions_from_alert2');
      activatesRule();
      waitForTheRuleToBeExecuted();
      refreshPage();

      cy.scrollTo('bottom');
      cy.get(SERVER_SIDE_EVENT_COUNT)
        .invoke('text')
        .then((numberOfOpenedAlertsAfterCreatingExceptionText) => {
          cy.wrap(parseInt(numberOfOpenedAlertsAfterCreatingExceptionText, 10)).should('eql', 0);
        });
    });
  });
});
