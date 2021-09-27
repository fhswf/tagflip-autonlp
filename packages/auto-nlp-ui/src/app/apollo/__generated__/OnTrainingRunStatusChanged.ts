/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RunStatus } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL subscription operation: OnTrainingRunStatusChanged
// ====================================================

export interface OnTrainingRunStatusChanged_trainingRunStatusChanged_run {
  __typename: "Run";
  id: any;
  runId: string;
  dashboardUrl: string | null;
  status: RunStatus | null;
}

export interface OnTrainingRunStatusChanged_trainingRunStatusChanged {
  __typename: "Training";
  id: any;
  run: OnTrainingRunStatusChanged_trainingRunStatusChanged_run | null;
}

export interface OnTrainingRunStatusChanged {
  trainingRunStatusChanged: OnTrainingRunStatusChanged_trainingRunStatusChanged;
}
