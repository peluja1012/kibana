/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { i18n } from '@kbn/i18n';
import { EmbeddableFactory, EmbeddableInput, IContainer } from 'src/plugins/embeddable/public';
import { HttpSetup } from 'kibana/public';
import { ResolverEmbeddable } from './';

export class ResolverEmbeddableFactory extends EmbeddableFactory {
  public readonly type = 'resolver';
  private httpService: HttpSetup;

  constructor(httpService: HttpSetup) {
    super();
    this.httpService = httpService;
  }

  public isEditable() {
    return true;
  }

  public async create(initialInput: EmbeddableInput, parent?: IContainer) {
    return new ResolverEmbeddable(initialInput, this.httpService, parent);
  }

  public getDisplayName() {
    return i18n.translate('xpack.endpoint.resolver.displayNameTitle', {
      defaultMessage: 'Resolver',
    });
  }
}
