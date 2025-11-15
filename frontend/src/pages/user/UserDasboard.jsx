import api from "../../services/api/api";
import { useState } from "react";
import { toast } from "react-toastify";

export const UserDashboard = () => {
  const [deleteResponse, setDeleteResponse] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    apiId: "",
    apiHash: "",
    code: "",
    password: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api("/api/verify-phone", "POST", {
        phone: formData.phone,
        apiId: formData.apiId,
        apiHash: formData.apiHash
      }, { withCredentials: true });

      toast.success(res?.message || "Code sent successfully! Check your Telegram for code.");
      setStep(2);
    } catch (err) {
      const data = err?.response?.data || err;
      const retryAfter = data?.retryAfter || data?.retry_after || data?.retry || null;
      const message = data?.message || "Failed to verify phone.";
      if (retryAfter) {
        toast.error(`${message} Please wait ${retryAfter} seconds before retrying.`);
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api("/api/delete", "POST", formData, { withCredentials: true });
      setDeleteResponse(res);
      toast.success("Messages deleted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete messages.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-white">Telegram Bot Cleaner</h1>
          <p className="text-gray-300">Quickly remove "joined Telegram" messages from your chats.</p>
        </div>

        <div className="bg-gray-800 shadow-lg rounded-2xl p-8 transform transition-transform duration-500 ease-out hover:scale-[1.01]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step===1? 'bg-blue-500':'bg-gray-600'}`}>1</div>
              <div className="text-sm text-gray-300">Verify Phone</div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step===2? 'bg-blue-500':'bg-gray-600'}`}>2</div>
              <div className="text-sm text-gray-300">Enter Code & Delete</div>
            </div>
          </div>

          {step === 1 && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-1">
                  <label className="block text-sm text-gray-400 mb-1">Phone</label>
                  <input className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none transition" placeholder="+1234567890" name="phone" value={formData.phone} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">API ID</label>
                  <input className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none transition" name="apiId" value={formData.apiId} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">API Hash</label>
                  <input className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none transition" name="apiHash" value={formData.apiHash} onChange={handleChange} required />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button type="submit" disabled={loading} className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white font-semibold flex items-center gap-2">
                  {loading ? <span className="animate-pulse">Sending...</span> : 'Verify Phone'}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleDeleteSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Telegram Code</label>
                <input className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none transition" name="code" value={formData.code} onChange={handleChange} required />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">2FA Password (optional)</label>
                <input className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none transition" name="password" value={formData.password} onChange={handleChange} />
              </div>

              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setStep(1)} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition text-white">Back</button>
                <button type="submit" disabled={loading} className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition text-white font-semibold">
                  {loading ? <span className="animate-pulse">Working...</span> : 'Delete Messages'}
                </button>
              </div>
            </form>
          )}

          {deleteResponse && (
            <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600 animate-fade-in">
              <h3 className="text-lg font-semibold">Result</h3>
              <pre className="text-xs text-gray-200 mt-2 max-h-40 overflow-auto p-2 bg-gray-800 rounded">{JSON.stringify(deleteResponse, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
