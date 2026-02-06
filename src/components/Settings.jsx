import { useState } from 'react';
import { Settings as SettingsIcon, Shield, ShieldCheck, ShieldOff, ArrowLeft, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { setupTwoFactor, verifyTwoFactorSetup, disableTwoFactor } from '../utils/Api';

const Settings = ({ user, onBack, onUserUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 2FA setup state
  const [setupStep, setSetupStep] = useState('idle'); // idle, qr, verify, backup
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [manualSecret, setManualSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [copiedBackup, setCopiedBackup] = useState(false);

  // Disable 2FA state
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');

  const handleSetupTwoFactor = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await setupTwoFactor();
      setQrCodeUrl(result.qrCode);
      setManualSecret(result.secret);
      setSetupStep('qr');
    } catch (err) {
      setError(err.message || 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await verifyTwoFactorSetup(verificationCode);
      setBackupCodes(result.backupCodes);
      setSetupStep('backup');
      onUserUpdate({ ...user, twoFactorEnabled: true });
    } catch (err) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableTwoFactor = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await disableTwoFactor(disablePassword);
      setSuccess('Two-factor authentication has been disabled');
      setShowDisableModal(false);
      setDisablePassword('');
      onUserUpdate({ ...user, twoFactorEnabled: false });
    } catch (err) {
      setError(err.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2000);
  };

  const handleFinishSetup = () => {
    setSetupStep('idle');
    setQrCodeUrl('');
    setManualSecret('');
    setVerificationCode('');
    setBackupCodes([]);
    setSuccess('Two-factor authentication is now enabled!');
  };

  // QR Code scanning step
  if (setupStep === 'qr') {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-lg mx-auto">
          <div className="rounded-2xl bg-white shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 mb-4">
                <Shield className="text-white" size={28} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Scan QR Code</h2>
              <p className="text-slate-500 mt-2">
                Scan this code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white border-2 border-slate-200 rounded-xl">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <p className="text-slate-400">Loading...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Manual entry */}
            <div className="mb-6">
              <p className="text-sm text-slate-600 text-center mb-2">
                Or enter this code manually:
              </p>
              <div className="bg-slate-100 rounded-lg p-3 text-center">
                <code className="text-sm font-mono text-slate-800 break-all">
                  {manualSecret}
                </code>
              </div>
            </div>

            {/* Continue button */}
            <button
              onClick={() => setSetupStep('verify')}
              className="w-full rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-blue-500"
            >
              Continue
            </button>

            {/* Cancel */}
            <button
              onClick={() => setSetupStep('idle')}
              className="w-full mt-3 text-sm text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Verification step
  if (setupStep === 'verify') {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-lg mx-auto">
          <div className="rounded-2xl bg-white shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-600 mb-4">
                <ShieldCheck className="text-white" size={28} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Verify Setup</h2>
              <p className="text-slate-500 mt-2">
                Enter the 6-digit code from your authenticator app to verify setup
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleVerifySetup}>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 text-center text-2xl tracking-widest placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 mb-4"
                placeholder="000000"
                disabled={loading}
                autoFocus
              />

              <button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="w-full rounded-xl bg-green-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify and Enable 2FA'}
              </button>
            </form>

            <button
              onClick={() => setSetupStep('qr')}
              className="w-full mt-3 text-sm text-slate-600 hover:text-slate-800"
            >
              Back to QR Code
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Backup codes step
  if (setupStep === 'backup') {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-lg mx-auto">
          <div className="rounded-2xl bg-white shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-600 mb-4">
                <ShieldCheck className="text-white" size={28} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Save Backup Codes</h2>
              <p className="text-slate-500 mt-2">
                Save these codes in a safe place. You can use them to log in if you lose access to your authenticator.
              </p>
            </div>

            <div className="bg-slate-100 rounded-xl p-4 mb-4">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div key={index} className="bg-white rounded-lg px-3 py-2 text-center font-mono text-sm">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleCopyBackupCodes}
              className="w-full rounded-xl bg-slate-200 px-6 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-300 mb-3 flex items-center justify-center gap-2"
            >
              {copiedBackup ? <Check size={20} /> : <Copy size={20} />}
              {copiedBackup ? 'Copied!' : 'Copy Backup Codes'}
            </button>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-yellow-800">
                Each backup code can only be used once. Store them securely and don't share them with anyone.
              </p>
            </div>

            <button
              onClick={handleFinishSetup}
              className="w-full rounded-xl bg-green-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-green-500"
            >
              I've Saved My Backup Codes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main settings screen
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-slate-100 transition"
          >
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <SettingsIcon className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 rounded-xl bg-green-50 border border-green-200 p-4">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Account Info */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6 mb-4">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Account</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-500">Name</p>
              <p className="text-slate-900">{user?.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Username</p>
              <p className="text-slate-900">{user?.username}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="text-slate-900">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-slate-600" size={24} />
            <h2 className="text-lg font-semibold text-slate-900">Two-Factor Authentication</h2>
          </div>

          {user?.twoFactorEnabled ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="text-green-600" size={20} />
                <span className="text-green-700 font-medium">Enabled</span>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Your account is protected with two-factor authentication.
              </p>
              <button
                onClick={() => setShowDisableModal(true)}
                className="w-full rounded-xl bg-red-50 border border-red-200 px-6 py-3 text-base font-semibold text-red-700 transition hover:bg-red-100"
              >
                Disable Two-Factor Authentication
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShieldOff className="text-slate-400" size={20} />
                <span className="text-slate-600">Not enabled</span>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Add an extra layer of security to your account by requiring a verification code in addition to your password.
              </p>
              <button
                onClick={handleSetupTwoFactor}
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-blue-500 disabled:opacity-50"
              >
                {loading ? 'Setting up...' : 'Enable Two-Factor Authentication'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Disable 2FA Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Disable Two-Factor Authentication</h3>
            <p className="text-sm text-slate-600 mb-4">
              Enter your password to confirm. This will make your account less secure.
            </p>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleDisableTwoFactor}>
              <input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 mb-4"
                disabled={loading}
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDisableModal(false);
                    setDisablePassword('');
                    setError('');
                  }}
                  className="flex-1 rounded-xl bg-slate-100 px-6 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !disablePassword}
                  className="flex-1 rounded-xl bg-red-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
                >
                  {loading ? 'Disabling...' : 'Disable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
