/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { memo, useState, useCallback, useMemo } from 'react';
import styled, { css } from 'styled-components';
import {
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalFooter,
  EuiOverlayMask,
  EuiButton,
  EuiButtonEmpty,
  EuiHorizontalRule,
  EuiCheckbox,
  EuiSpacer,
  EuiFormRow,
} from '@elastic/eui';
import {
  ExceptionListItemSchema,
  ExceptionListSchema,
} from '../../../../../public/lists_plugin_deps';
import * as i18n from './translations';
import { useKibana } from '../../../lib/kibana';
import { errorToToaster, displaySuccessToast, useStateToaster } from '../../toasters';
import { ExceptionBuilder } from '../builder';
import { useAddOrUpdateException } from '../../../../alerts/containers/detection_engine/alerts/use_add_exception';
import { AddExceptionComments } from '../add_exception_comments';
import {
  enrichExceptionItemsWithComments,
  enrichExceptionItemsWithOS,
  enrichExceptionItemsWithNamespace,
  getOsTagValues,
} from '../helpers';

interface EditExceptionModalProps {
  ruleName: string;
  exceptionItem: ExceptionListItemSchema;
  exceptionListType: ExceptionListSchema['type'];
  onCancel: () => void;
  onConfirm: () => void;
}

const Modal = styled(EuiModal)`
  ${({ theme }) => css`
    width: ${theme.eui.euiBreakpoints.m};
  `}
`;

// TODO: truncate subtitle
const ModalHeader = styled(EuiModalHeader)`
  ${({ theme }) => css`
    flex-direction: column;
    align-items: flex-start;
  `}
`;

const ModalBodySection = styled.section`
  ${({ theme }) => css`
    padding: ${theme.eui.euiSizeS} ${theme.eui.euiSizeL};

    &.builder-section {
      overflow-y: scroll;
    }
  `}
`;

export const EditExceptionModal = memo(function EditExceptionModal({
  ruleName,
  exceptionItem,
  exceptionListType,
  onCancel,
  onConfirm,
}: EditExceptionModalProps) {
  const { http } = useKibana().services;
  const [comment, setComment] = useState('');
  const [shouldBulkCloseAlert, setShouldBulkCloseAlert] = useState(false);
  const [exceptionItemsToAdd, setExceptionItemsToAdd] = useState<ExceptionListItemSchema[]>([]);
  const [, dispatchToaster] = useStateToaster();
  // TODO: need to fetch the index patterns and pass them down to the component

  const onError = useCallback(
    (error) => {
      errorToToaster({ title: i18n.EDIT_EXCEPTION_ERROR, error, dispatchToaster });
      onCancel();
    },
    [dispatchToaster, onCancel]
  );
  const onSuccess = useCallback(() => {
    displaySuccessToast(i18n.EDIT_EXCEPTION_SUCCESS, dispatchToaster);
    onConfirm();
  }, [dispatchToaster, onConfirm]);

  const [{ isLoading: addExceptionIsLoading }, addOrUpdateExceptionItems] = useAddOrUpdateException(
    {
      http,
      onSuccess,
      onError,
    }
  );

  // TODO: needs to store the whole object because we need to keep track of deteled items
  // not just newly created ones
  const handleBuilderOnChange = useCallback(
    ({ exceptionItems }) => {
      setExceptionItemsToAdd(exceptionItems);
    },
    [setExceptionItemsToAdd]
  );

  const onCommentChange = useCallback(
    (value: string) => {
      setComment(value);
    },
    [setComment]
  );

  const onCloseAlertCheckboxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setShouldBulkCloseAlert(event.currentTarget.checked);
    },
    [setShouldBulkCloseAlert]
  );

  const enrichExceptionItems = useCallback(() => {
    let enriched = [];
    enriched = enrichExceptionItemsWithComments(exceptionItemsToAdd, [
      ...exceptionItem.comments,
      ...(comment !== '' ? [{ comment }] : []),
    ]);
    if (exceptionListType === 'endpoint') {
      // TODO: dont hardcode 'windows'
      const osTypes = exceptionItem._tags ? getOsTagValues(exceptionItem._tags) : ['windows'];
      enriched = enrichExceptionItemsWithOS(enriched, osTypes);
    }

    // TODO: delete this. Namespace should be handled by the builder
    return enrichExceptionItemsWithNamespace(enriched, exceptionItem.namespace_type);
  }, [
    exceptionItemsToAdd,
    exceptionItem.comments,
    exceptionItem.namespace_type,
    comment,
    exceptionListType,
  ]);

  const onEditExceptionConfirm = useCallback(() => {
    console.log(enrichExceptionItems());
    // TODO: Create API hook for persisting and closing
    // TODO: insert OS tag into entries before persisting for endpoint exceptions
    if (addOrUpdateExceptionItems !== null) {
      addOrUpdateExceptionItems(enrichExceptionItems());
    }
  }, [addOrUpdateExceptionItems, enrichExceptionItems]);

  // TODO: builder - Grab appropriate listId that's associated with the rule
  // TODO: builder - dynamically set listType
  return (
    <EuiOverlayMask>
      <Modal onClose={onCancel} data-test-subj="add-exception-modal">
        <ModalHeader>
          <EuiModalHeaderTitle>{i18n.EDIT_EXCEPTION}</EuiModalHeaderTitle>
          <div className="eui-textTruncate" title={ruleName}>
            {ruleName}
          </div>
        </ModalHeader>

        <ModalBodySection className="builder-section">
          <ExceptionBuilder
            exceptionListItems={[exceptionItem]}
            listType={exceptionListType}
            listId={exceptionItem.list_id}
            listNamespaceType={exceptionItem.namespace_type}
            ruleName={ruleName}
            isLoading={false}
            isOrDisabled={false}
            isAndDisabled={false}
            dataTestSubj="edit-exception-modal-builder"
            idAria="edit-exception-modal-builder"
            onChange={handleBuilderOnChange}
          />

          <EuiSpacer />

          <AddExceptionComments
            exceptionItemComments={exceptionItem.comments}
            newCommentValue={comment}
            newCommentOnChange={onCommentChange}
          />
        </ModalBodySection>
        <EuiHorizontalRule />
        <ModalBodySection>
          <EuiFormRow>
            <EuiCheckbox
              id="close-alert-on-add-add-exception-checkbox"
              label={i18n.BULK_CLOSE_LABEL}
              checked={shouldBulkCloseAlert}
              onChange={onCloseAlertCheckboxChange}
            />
          </EuiFormRow>
        </ModalBodySection>

        <EuiModalFooter>
          <EuiButtonEmpty onClick={onCancel}>{i18n.CANCEL}</EuiButtonEmpty>

          <EuiButton onClick={onEditExceptionConfirm} isLoading={addExceptionIsLoading} fill>
            {i18n.EDIT_EXCEPTION}
          </EuiButton>
        </EuiModalFooter>
      </Modal>
    </EuiOverlayMask>
  );
});
