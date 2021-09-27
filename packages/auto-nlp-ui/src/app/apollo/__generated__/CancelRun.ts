/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RunStatus } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: CancelRun
// ====================================================

export interface CancelRun_cancelRun {
  __typename: "Run";
  id: any;
  runId: string;
  dashboardUrl: string | null;
  status: RunStatus | null;
}

export interface CancelRun {
  cancelRun: CancelRun_cancelRun;
}

export interface CancelRunVariables {
  runId: string;
}
