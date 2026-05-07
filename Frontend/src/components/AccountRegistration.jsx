import React, { useState, useRef, useEffect } from "react";
import {
  UserPlus,
  Phone,
  Trash2,
  Plus,
  CheckCircle2,
  CreditCard,
  Calendar,
  Wallet,
  ArrowRight,
  User,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Camera,
  RefreshCw,
  XCircle,
} from "lucide-react";
import api from "../services/api";

const AccountRegistration = ({ onComplete }) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    otherName: "",
    ghanaCardNumber: "",
    dateOfBirth: "",
    gender: "MALE",
    accountType: "S",
    balance: "0",
    clientImage: "",
  });
  const [phoneNumbers, setPhoneNumbers] = useState([""]);
  const [responseDetails, setResponseDetails] = useState(null);

  // Camera states and refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraActive]);

  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Could not access the camera. Please grant permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      // Remove data:image/jpeg;base64, prefix
      const base64Data = dataUrl.split(",")[1];
      setFormData((prev) => ({ ...prev, clientImage: base64Data }));
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setFormData((prev) => ({ ...prev, clientImage: "" }));
    startCamera();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (index, value) => {
    const updatedPhones = [...phoneNumbers];
    updatedPhones[index] = value;
    setPhoneNumbers(updatedPhones);
  };

  const addPhoneField = () => {
    setPhoneNumbers([...phoneNumbers, ""]);
  };

  const removePhoneField = (index) => {
    if (phoneNumbers.length > 1) {
      setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        phoneNumbers: phoneNumbers.filter((p) => p.trim() !== ""),
      };

      const response = await api.post("/clients", payload);
      setResponseDetails(response.data);
      setIsSuccess(true);
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.message ||
        "Failed to register client. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
            <CheckCircle2 size={48} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800">
              Account Created!
            </h2>
            <p className="text-slate-500">
              The new client has been registered successfully.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-50">
            <span className="text-slate-400 text-sm">Account Number</span>
            <span className="font-mono font-bold text-violet-600 tracking-wider">
              {responseDetails?.accountNumber || "GEN-XXXXXX"}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Full Name
              </p>
              <p className="font-bold text-slate-800">
                {formData.firstName} {formData.otherName} {formData.lastName}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  ID
                </p>
                <p className="font-bold text-slate-800 capitalize">
                  #{responseDetails?.clientId}
                </p>
              </div> */}
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Initial Balance
                </p>
                <p className="font-bold text-emerald-600">
                  GH₵ {parseFloat(formData.balance || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Ghana Card
              </p>
              <p className="font-bold text-slate-800">
                {formData.ghanaCardNumber}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onComplete}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all shadow-md active:scale-95">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <div className="inline-flex p-3 bg-violet-100 text-violet-600 rounded-2xl mb-4">
          <UserPlus size={32} />
        </div>
        <h2 className="text-3xl font-black text-slate-800">
          New Account Registration
        </h2>
        <p className="text-slate-500">
          Fill in the details below to onboard a new client
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-600">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Details Section */}
        <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <User size={18} className="text-violet-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
              Personal Details
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-600 focus:bg-white transition-all outline-none"
                placeholder="Kwesi"
                value={formData.firstName}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-600 focus:bg-white transition-all outline-none"
                placeholder="Atta"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">
                Other Name
              </label>
              <input
                type="text"
                name="otherName"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-600 focus:bg-white transition-all outline-none"
                placeholder="Kobina"
                value={formData.otherName}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">
                Gender
              </label>
              <select
                name="gender"
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-600 focus:bg-white transition-all outline-none appearance-none"
                value={formData.gender}
                onChange={handleInputChange}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="date"
                  name="dateOfBirth"
                  required
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-600 focus:bg-white transition-all outline-none"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase">
              Ghana Card Number
            </label>
            <div className="relative">
              <ShieldCheck
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                name="ghanaCardNumber"
                required
                className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-600 focus:bg-white transition-all outline-none font-mono"
                placeholder="GHA-123456789-0"
                value={formData.ghanaCardNumber}
                onChange={handleInputChange}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 italic">
              Format: GHA-XXXXXXXXX-X
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Phone size={18} className="text-violet-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
              Contact Information
            </h3>
          </div>

          <div className="space-y-4">
            {phoneNumbers.map((phone, index) => (
              <div key={index} className="flex gap-2">
                <div className="relative flex-1">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number"
                    className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-600 focus:bg-white transition-all outline-none"
                    value={phone}
                    onChange={(e) => handlePhoneChange(index, e.target.value)}
                  />
                </div>
                {phoneNumbers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePhoneField(index)}
                    className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addPhoneField}
              className="flex items-center gap-2 text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors">
              <Plus size={16} /> Add another number
            </button>
          </div>
        </section>

        {/* Account Settings */}
        <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={18} className="text-violet-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
              Account Settings
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">
                Account Type
              </label>
              <select
                name="accountType"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-600 focus:bg-white transition-all outline-none appearance-none"
                value={formData.accountType}
                onChange={handleInputChange}>
                <option value="S">Savings Account (Goal)</option>
                <option value="D">Deposit Account (Standard)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">
                Opening Balance (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  ¢
                </span>
                <input
                  type="number"
                  name="balance"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-600 focus:bg-white transition-all outline-none font-bold text-slate-800"
                  placeholder="0.00"
                  value={formData.balance}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setFormData({
                      ...formData,
                      balance: val < 0 ? "0" : e.target.value,
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Face Verification Section */}
        <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Camera size={18} className="text-violet-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
              Face Verification
            </h3>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4">
            {cameraError && (
              <div className="w-full p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 text-sm font-bold">
                <AlertCircle size={16} />
                <p>{cameraError}</p>
              </div>
            )}

            {!formData.clientImage ? (
              <div className="w-full relative aspect-video max-h-80 bg-slate-100 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 flex flex-col items-center justify-center">
                {isCameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-full font-bold shadow-lg transition-all flex items-center gap-2">
                      <Camera size={18} /> Capture Photo
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all">
                      <XCircle size={20} />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex flex-col items-center gap-3 text-slate-500 hover:text-violet-600 transition-colors group">
                    <div className="p-4 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all">
                      <Camera size={32} />
                    </div>
                    <span className="font-bold">Start Camera</span>
                  </button>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-4">
                <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-emerald-100 shadow-md">
                  <img
                    src={`data:image/jpeg;base64,${formData.clientImage}`}
                    alt="Client capture"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-4 border-emerald-400 rounded-full" />
                </div>
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-violet-600 transition-colors">
                  <RefreshCw size={16} /> Retake Photo
                </button>
              </div>
            )}
          </div>
        </section>

        <div className="pt-4 pb-12">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 text-white py-4 rounded-2xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 flex items-center justify-center gap-2 group">
            {loading ? <Loader2 className="animate-spin" /> : "Register Client"}
            {!loading && (
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountRegistration;
