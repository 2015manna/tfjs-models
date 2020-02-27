/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import * as tf from '@tensorflow/tfjs-core';

// The facial bounding box.
export type Box = {
  startPoint: [number, number],  // Upper left hand corner of bounding box.
  endPoint: [number, number]     // Lower right hand corner of bounding box.
};

const getBoxCenter = (box: Box): [number, number] => ([
  box.startPoint[0] + (box.endPoint[0] - box.startPoint[0]) / 2,
  box.startPoint[1] + (box.endPoint[1] - box.startPoint[1]) / 2,
]);

export function createBox(
    startPoint: [number, number], endPoint: [number, number]): Box {
  return {startPoint, endPoint};
}

export function scaleBoxCoordinates(box: Box, factor: [number, number]): Box {
  const start: [number, number] =
      [box.startPoint[0] * factor[0], box.startPoint[1] * factor[1]];
  const end: [number, number] =
      [box.endPoint[0] * factor[0], box.endPoint[1] * factor[1]];

  return createBox(start, end);
}

export function getBoxSize(box: Box): [number, number] {
  return [
    Math.abs(box.endPoint[0] - box.startPoint[0]),
    Math.abs(box.endPoint[1] - box.startPoint[1])
  ];
}

export function enlargeBox(box: Box, factor = 1.5) {
  const center = getBoxCenter(box);
  const size = getBoxSize(box);
  const newSize = [factor * size[0] / 2, factor * size[1] / 2];
  const newStart: [number, number] =
      [center[0] - newSize[0], center[1] - newSize[1]];
  const newEnd: [number, number] =
      [center[0] + newSize[0], center[1] + newSize[1]];

  return createBox(newStart, newEnd);
}

export function cutBoxFromImageAndResize(
    box: Box, image: tf.Tensor4D, cropSize: [number, number]): tf.Tensor4D {
  const h = image.shape[1];
  const w = image.shape[2];

  const xyxy = box.startPoint.concat(box.endPoint);
  const yxyx = [xyxy[1], xyxy[0], xyxy[3], xyxy[2]];
  const roundedCoords = [yxyx[0] / h, yxyx[1] / w, yxyx[2] / h, yxyx[3] / w];
  return tf.image.cropAndResize(image, [roundedCoords], [0], cropSize);
}
