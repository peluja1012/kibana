/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Vector2 } from '../../types';

interface UserScaled {
  readonly type: 'userScaled';
  /**
   * A vector who's `x` and `y` component will be the new scaling factors for the projection.
   */
  readonly payload: Vector2;
}

interface UserZoomed {
  readonly type: 'userZoomed';
  /**
   * A value to zoom in by. Should be a fraction of `1`. For a `'wheel'` event when `event.deltaMode` is `'pixel'`, pass `event.deltaY / -renderHeight` where `renderHeight` is the height of the Resolver element in pixels.
   */
  payload: number;
}

interface UserSetRasterSize {
  readonly type: 'userSetRasterSize';
  /**
   * The dimensions of the Resolver component in pixels. The Resolver component should not be scrollable itself.
   */
  readonly payload: Vector2;
}

/**
 * This is currently only used in tests. The 'back to center' button will use this action, and more tests around its behavior will need to be added.
 */
interface UserSetPositionOfCamera {
  readonly type: 'userSetPositionOfCamera';
  /**
   * The world transform of the camera
   */
  readonly payload: Vector2;
}

interface UserStartedPanning {
  readonly type: 'userStartedPanning';
  /**
   * A vector in screen coordinates (each unit is a pixel and the Y axis increases towards the bottom of the screen)
   * relative to the Resolver component.
   * Represents a starting position during panning for a pointing device.
   */
  readonly payload: Vector2;
}

interface UserStoppedPanning {
  readonly type: 'userStoppedPanning';
}

interface UserMovedPointer {
  readonly type: 'userMovedPointer';
  /**
   * A vector in screen coordinates relative to the Resolver component.
   * The payload should be contain clientX and clientY minus the client position of the Resolver component.
   */
  readonly payload: Vector2;
}

export type CameraAction =
  | UserScaled
  | UserSetRasterSize
  | UserSetPositionOfCamera
  | UserStartedPanning
  | UserStoppedPanning
  | UserZoomed
  | UserMovedPointer;
