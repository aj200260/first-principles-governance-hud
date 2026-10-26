/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';

// Import auto-configured Firebase credentials
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Target designated Google Drive folder for structured diagnostic reports
export const GOVERNANCE_TELEMETRY_FOLDER_NAME = 'GovernanceTelemetry';

// Google OAuth Provider with strictly scoped Drive permissions (Least Privilege)
const provider = new GoogleAuthProvider();
// Use ONLY the drive.file scope authorized by the user to manage app-created files
provider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory token storage only (MANDATORY: Never use localStorage/sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;
let cachedFolderId: string | null = null;

export interface DriveUserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface DriveUploadedFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  createdTime?: string;
  size?: string;
  parents?: string[];
  folderName: string;
}

export interface SaveDiagnosticReportParams {
  reportData: Record<string, any>;
  customFilename?: string;
  folderName?: string;
  description?: string;
}

export interface DriveFolderInfo {
  id: string;
  name: string;
  webViewLink?: string;
}

/**
 * Initialize auth state listener. Call this on application load.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) {
        onAuthSuccess(user, cachedAccessToken);
      }
    } else {
      cachedAccessToken = null;
      cachedFolderId = null;
      if (onAuthFailure) {
        onAuthFailure();
      }
    }
  });
};

/**
 * Authorize with Google Drive using the existing OAuth client ID
 * Prompts user with Google OAuth popup requesting 'https://www.googleapis.com/auth/drive.file'
 */
export const authorizeWithGoogleDrive = async (): Promise<{
  user: User;
  accessToken: string;
}> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error(
        'Failed to obtain Google Drive OAuth access token from authorization response.'
      );
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Drive Authorization Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Backward compatibility alias for authorization
 */
export const googleSignIn = authorizeWithGoogleDrive;

/**
 * Get current in-memory access token.
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Check if the user is currently authorized with Google Drive
 */
export const isDriveAuthorized = (): boolean => {
  return Boolean(cachedAccessToken && auth.currentUser);
};

/**
 * Sign out and clear all cached tokens in memory
 */
export const signOutGoogleDrive = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
  cachedFolderId = null;
};

export const logout = signOutGoogleDrive;

/**
 * Locate or create the designated 'GovernanceTelemetry' folder in Google Drive
 */
export const getOrCreateGovernanceTelemetryFolder = async (
  token: string,
  folderName: string = GOVERNANCE_TELEMETRY_FOLDER_NAME
): Promise<DriveFolderInfo> => {
  if (cachedFolderId && folderName === GOVERNANCE_TELEMETRY_FOLDER_NAME) {
    return { id: cachedFolderId, name: folderName };
  }

  try {
    // 1. Search for existing folder by name (excluding trashed items)
    const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      query
    )}&fields=files(id,name,webViewLink)&pageSize=1`;

    const searchRes = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        const found = searchData.files[0];
        if (folderName === GOVERNANCE_TELEMETRY_FOLDER_NAME) {
          cachedFolderId = found.id;
        }
        return {
          id: found.id,
          name: found.name,
          webViewLink: found.webViewLink,
        };
      }
    }

    // 2. Folder does not exist: create the designated folder
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        description:
          'Designated folder for Distributed Deterministic First-Principles Governance telemetry and shard diagnostic reports.',
      }),
    });

    if (!createRes.ok) {
      const errBody = await createRes.json().catch(() => ({}));
      throw new Error(
        errBody.error?.message ||
          `Failed to create '${folderName}' folder in Google Drive (HTTP ${createRes.status})`
      );
    }

    const folderData = await createRes.json();
    if (folderName === GOVERNANCE_TELEMETRY_FOLDER_NAME) {
      cachedFolderId = folderData.id;
    }
    return {
      id: folderData.id,
      name: folderData.name,
      webViewLink: folderData.webViewLink,
    };
  } catch (err: any) {
    console.error(`Error resolving folder '${folderName}':`, err);
    throw err;
  }
};

/**
 * Save a diagnostic report as a structured JSON file directly to the 'GovernanceTelemetry' folder.
 * Uses Google Drive v3 multipart/related upload to set both metadata and JSON content atomically.
 */
export const saveDiagnosticReportToDrive = async ({
  reportData,
  customFilename,
  folderName = GOVERNANCE_TELEMETRY_FOLDER_NAME,
  description,
}: SaveDiagnosticReportParams): Promise<DriveUploadedFile> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error(
      'Not authenticated with Google Drive. Please authorize with Google Drive first.'
    );
  }

  // Ensure designated 'GovernanceTelemetry' folder exists
  const folder = await getOrCreateGovernanceTelemetryFolder(token, folderName);

  // Generate standardized filename if not specified
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportId = reportData?.reportMetadata?.reportId || 'GOV-TELEMETRY';
  const finalFilename = customFilename
    ? customFilename.endsWith('.json')
      ? customFilename
      : `${customFilename}.json`
    : `${reportId}-${timestamp}.json`;

  // Format structured JSON payload with 2-space indentation
  const structuredJsonContent = JSON.stringify(reportData, null, 2);

  // Prepare Drive metadata
  const metadata = {
    name: finalFilename,
    mimeType: 'application/json',
    description:
      description ||
      `Structured Diagnostic Telemetry Report generated by Distributed Deterministic First-Principles Governance Suite. Verified with ZK cryptographic proofs and vector clock epoch #${reportData?.systemTelemetrySummary?.vectorClockEpoch || 1}.`,
    parents: [folder.id],
    properties: {
      generatedBy: 'First-Principles Governance Engine',
      architects: 'Andrew Leiter & Gemini AI',
      reportId: reportData?.reportMetadata?.reportId || 'UNKNOWN',
      shardsCount: String(reportData?.regionalShards?.length || 6),
      telemetryVersion: '2.5',
    },
  };

  // Multipart request boundary
  const boundary = '-------GovTelemetryMultipartBoundary' + Math.random().toString(36).substring(2);
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    structuredJsonContent +
    closeDelimiter;

  const uploadUrl =
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink,createdTime,size,parents';

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
      Accept: 'application/json',
    },
    body: multipartRequestBody,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message ||
        `Google Drive upload failed with HTTP status ${response.status}`
    );
  }

  const uploadedData = await response.json();
  return {
    id: uploadedData.id,
    name: uploadedData.name,
    mimeType: uploadedData.mimeType,
    webViewLink: uploadedData.webViewLink,
    webContentLink: uploadedData.webContentLink,
    createdTime: uploadedData.createdTime,
    size: uploadedData.size,
    parents: uploadedData.parents,
    folderName,
  };
};

/**
 * Compatibility wrapper for generic report upload (supports markdown or custom folders)
 */
export const uploadReportToDrive = async ({
  filename,
  mimeType,
  content,
  folderName = GOVERNANCE_TELEMETRY_FOLDER_NAME,
}: {
  filename: string;
  mimeType: string;
  content: string;
  folderName?: string;
}): Promise<DriveUploadedFile> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated with Google. Please sign in to connect Google Drive.');
  }

  const folder = await getOrCreateGovernanceTelemetryFolder(token, folderName);

  const metadata: Record<string, any> = {
    name: filename,
    mimeType: mimeType,
    description:
      'Diagnostic report generated by Distributed Deterministic First-Principles Governance Suite (Andrew Leiter & Gemini AI).',
    parents: [folder.id],
  };

  const boundary = '-------GovTelemetry314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
    content +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink,createdTime,size,parents',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
        Accept: 'application/json',
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Google Drive upload failed with status ${response.status}`
    );
  }

  const data = await response.json();
  return {
    ...data,
    folderName,
  };
};

/**
 * List diagnostic JSON reports stored directly in the designated 'GovernanceTelemetry' folder
 */
export const listGovernanceTelemetryReports = async (): Promise<DriveUploadedFile[]> => {
  const token = await getAccessToken();
  if (!token) {
    return [];
  }

  try {
    const folder = await getOrCreateGovernanceTelemetryFolder(token);
    const query = `'${folder.id}' in parents and trashed=false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      query
    )}&pageSize=25&orderBy=createdTime desc&fields=files(id,name,mimeType,webViewLink,webContentLink,createdTime,size,parents)`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return (data.files || []).map((f: any) => ({
      ...f,
      folderName: GOVERNANCE_TELEMETRY_FOLDER_NAME,
    }));
  } catch (err) {
    console.error('Failed to list GovernanceTelemetry reports:', err);
    return [];
  }
};

/**
 * Compatibility alias
 */
export const listDriveAuditReports = listGovernanceTelemetryReports;
