/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { FC } from 'react';
import {
  EuiText,
  EuiSpacer,
  EuiCallOut,
  EuiSteps,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiTitle,
  EuiLink,
  EuiCode,
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n/react';

import { ComponentStrings, ZIP, CANVAS, HTML } from '../../../../../i18n';
import { OnCloseFn } from '../workpad_export';
import { WorkpadStep } from './workpad_step';
import { RuntimeStep } from './runtime_step';
import { SnippetsStep } from './snippets_step';

const { ShareWebsiteFlyout: strings } = ComponentStrings;

export type OnDownloadFn = (type: 'share' | 'shareRuntime' | 'shareZip') => void;
export type OnCopyFn = () => void;

export interface Props {
  onCopy: OnCopyFn;
  onDownload: OnDownloadFn;
  onClose: OnCloseFn;
  unsupportedRenderers?: string[];
}

const steps = (onDownload: OnDownloadFn, onCopy: OnCopyFn) => [
  {
    title: strings.getWorkpadStepTitle(),
    children: <WorkpadStep {...{ onDownload }} />,
  },
  {
    title: strings.getRuntimeStepTitle(),
    children: <RuntimeStep {...{ onDownload }} />,
  },
  {
    title: strings.getSnippentsStepTitle(),
    children: <SnippetsStep {...{ onCopy }} />,
  },
];

export const ShareWebsiteFlyout: FC<Props> = ({
  onCopy,
  onDownload,
  onClose,
  unsupportedRenderers,
}) => {
  const link = (
    <EuiLink
      style={{ textDecoration: 'underline' }}
      onClick={() => {
        onDownload('shareZip');
      }}
    >
      <FormattedMessage
        id="xpack.canvas.shareWebsiteFlyout.zipDownloadLinkLabel"
        defaultMessage="download an example {ZIP} file"
        values={{ ZIP }}
      />
    </EuiLink>
  );

  const title = (
    <div>
      <FormattedMessage
        id="xpack.canvas.shareWebsiteFlyout.flyoutCalloutDescription"
        defaultMessage="To try sharing, you can {link} containing this workpad, the {CANVAS} Shareable Workpad runtime, and a sample {HTML} file."
        values={{
          CANVAS,
          HTML,
          link,
        }}
      />
    </div>
  );

  let warningText = null;

  if (unsupportedRenderers && unsupportedRenderers.length > 0) {
    const warning = [
      <EuiText size="s" key="text">
        <span>{strings.getUnsupportedRendererWarning()}</span>
        {unsupportedRenderers.map((fn, index) => [
          <EuiCode key={`item-${index}`}>{fn}</EuiCode>,
          index < unsupportedRenderers.length - 1 ? ', ' : '',
        ])}
      </EuiText>,
      <EuiSpacer size="xs" key="spacer" />,
    ];
    warningText = [
      <EuiCallOut title={warning} color="warning" size="s" iconType="alert" key="callout" />,
      <EuiSpacer key="spacer" />,
    ];
  }

  return (
    <EuiFlyout onClose={() => onClose('share')} maxWidth>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2 id="flyoutTitle">{strings.getTitle()}</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiText size="s">
          <p>{strings.getStepsDescription()}</p>
        </EuiText>
        <EuiSpacer />
        <EuiCallOut size="s" title={title} iconType="iInCircle" />
        <EuiSpacer />
        {warningText}
        <EuiSteps steps={steps(onDownload, onCopy)} />
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
