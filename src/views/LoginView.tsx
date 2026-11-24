import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import {
  Mail,
  Lock,
  GraduationCap,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Users,
  Copy,
  ArrowRight,
  UserPlus,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { UNASSIGNED_STUDENTS } from "../data/initialData.ts";

export const LoginView: React.FC = () => {
  const [portalTab, setPortalTab] = useState<"student" | "lecturer">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showInGroupAccounts, setShowInGroupAccounts] = useState(false);

  // For sign up (Student only)
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [className, setClassName] = useState("");

  const {
    setCurrentScreen,
    showToast,
    switchDemoPersona,
    loginAsCustomUser,
  } = useApp();

  const handleCopyAllAccounts = () => {
    const text = UNASSIGNED_STUDENTS.map(
      (s, i) =>
        `${i + 1}. ${s.name} (${s.specialty}) | MSSV: ${s.code} | Email: ${s.email} | Mật khẩu: 123456`,
    ).join("\n");
    navigator.clipboard.writeText(
      `--- DANH SÁCH 10 TÀI KHOẢN TEST GHÉP NHÓM (UED-PROJECTHUB) ---\n` + text,
    );
    showToast(
      "Đã sao chép 10 tài khoản! Bạn có thể dán vào Zalo/Messenger gửi cho bạn bè cùng test.",
      "success",
    );
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const trimmedEmail = email.trim().toLowerCase();

    // 1. Kiểm tra nếu là 1 trong 10 sinh viên mẫu chưa có nhóm
    const matchedUnassigned = UNASSIGNED_STUDENTS.find(
      (s) => s.email.toLowerCase() === trimmedEmail,
    );
    if (matchedUnassigned) {
      if (password === "123456" || password === matchedUnassigned.password) {
        await loginAsCustomUser(matchedUnassigned);
        setIsLoading(false);
        return;
      } else {
        setError("Mật khẩu không chính xác. (Mật khẩu tài khoản test là: 123456)");
        setIsLoading(false);
        return;
      }
    }

    // 2. Pre-configured account: Giảng viên phụ trách
    if (trimmedEmail === "giangvien@ued.udn.vn") {
      if (password === "123456") {
        switchDemoPersona("lecturer");
        showToast(
          "Đăng nhập thành công với vai trò Giảng viên (TS. Trần Văn B)!",
          "success",
        );
        setCurrentScreen("dashboard");
      } else {
        setError("Mật khẩu không chính xác. (Mật khẩu tài khoản test là: 123456)");
      }
      setIsLoading(false);
      return;
    }

    // 3. Pre-configured account: Trưởng nhóm sinh viên (đã có Nhóm 04)
    if (
      trimmedEmail === "truongnhom@ued.udn.vn" ||
      trimmedEmail === "sinhvien@ued.udn.vn"
    ) {
      if (password === "123456") {
        switchDemoPersona("leader");
        showToast(
          "Đăng nhập thành công với vai trò Trưởng nhóm (Nguyễn Văn A)!",
          "success",
        );
        setCurrentScreen("dashboard");
      } else {
        setError("Mật khẩu không chính xác. (Mật khẩu tài khoản test là: 123456)");
      }
      setIsLoading(false);
      return;
    }

    // 4. Pre-configured account: Thành viên nhóm sinh viên (đã có Nhóm 04)
    if (trimmedEmail === "thanhvien@ued.udn.vn") {
      if (password === "123456") {
        switchDemoPersona("member");
        showToast(
          "Đăng nhập thành công với vai trò Thành viên (Lê Văn Cúc)!",
          "success",
        );
        setCurrentScreen("dashboard");
      } else {
        setError("Mật khẩu không chính xác. (Mật khẩu tài khoản test là: 123456)");
      }
      setIsLoading(false);
      return;
    }

    // 5. Authenticate via Firebase Auth (tài khoản thực tế đăng ký mới)
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Check if user profile exists in Firestore
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

      if (!userDoc.exists()) {
        setError("Tài khoản chưa được khởi tạo. Vui lòng liên hệ quản trị viên.");
        await auth.signOut();
        return;
      }

      showToast("Đăng nhập thành công!", "success");
      setCurrentScreen("dashboard");
    } catch (err: any) {
      console.error("Login error:", err);

      if (err.code === "auth/user-not-found") {
        setError("Email không tồn tại trong hệ thống.");
      } else if (err.code === "auth/wrong-password") {
        setError("Mật khẩu không chính xác.");
      } else if (err.code === "auth/invalid-email") {
        setError("Định dạng email không hợp lệ.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Email hoặc mật khẩu không chính xác.");
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (!name.trim()) {
      setError("Vui lòng nhập họ tên.");
      setIsLoading(false);
      return;
    }

    if (!studentId.trim()) {
      setError("Vui lòng nhập mã sinh viên.");
      setIsLoading(false);
      return;
    }

    if (!className.trim()) {
      setError("Vui lòng nhập lớp.");
      setIsLoading(false);
      return;
    }

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Create user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        email: user.email,
        name: name.trim(),
        studentId: studentId.trim(),
        className: className.trim(),
        role: "student",
        title: "Sinh viên",
        avatarText: getInitials(name),
        createdAt: new Date(),
        skills: [],
        scheduleMatrix: {},
        isGroupLeader: false,
      });

      showToast(
        "Đăng ký thành công! Chào mừng bạn đến với UED-ProjectHub.",
        "success",
      );
      setCurrentScreen("matchmaking");
    } catch (err: any) {
      console.error("❌ Sign up error:", err);

      if (err.code === "auth/email-already-in-use") {
        setError("Email này đã được đăng ký. Vui lòng đăng nhập.");
      } else if (err.code === "auth/weak-password") {
        setError(
          "Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn (ít nhất 6 ký tự).",
        );
      } else if (err.code === "auth/invalid-email") {
        setError("Định dạng email không hợp lệ.");
      } else if (err.code === "permission-denied") {
        setError(
          "Không có quyền tạo tài khoản. Firestore rules có thể chưa cấu hình đúng.",
        );
      } else {
        setError(`Đăng ký thất bại: ${err.message || "Vui lòng thử lại."}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (fullName: string): string => {
    const words = fullName.trim().split(" ");
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-3 sm:p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-32 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 left-10 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-2xl w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-5 sm:p-8 border border-slate-200/70 relative z-10">
        {/* Portal Tabs: Tách riêng Cổng Sinh viên và Cổng Cán bộ Giảng viên */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setPortalTab("student");
              setIsSignUp(false);
              setError("");
              setEmail("");
              setPassword("");
            }}
            className={`flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              portalTab === "student"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Cổng Sinh viên</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPortalTab("lecturer");
              setIsSignUp(false);
              setError("");
              setEmail("");
              setPassword("");
            }}
            className={`flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              portalTab === "lecturer"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Cổng Cán bộ & Giảng viên</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div
            className={`w-13 h-13 rounded-xl mx-auto flex items-center justify-center mb-2.5 shadow-md ${
              portalTab === "lecturer"
                ? "bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-indigo-500/20"
                : "bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/20"
            }`}
          >
            {portalTab === "lecturer" ? (
              <ShieldCheck className="w-6 h-6 text-white" />
            ) : (
              <GraduationCap className="w-6 h-6 text-white" />
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {portalTab === "lecturer"
              ? "Cổng Cán bộ & Giảng viên"
              : isSignUp
              ? "Đăng ký tài khoản Sinh viên"
              : "Cổng Đăng Nhập Sinh Viên"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {portalTab === "lecturer"
              ? "Khoa Công nghệ Thông tin • ĐH Sư phạm - ĐH Đà Nẵng"
              : "UED-ProjectHub • Hệ thống quản lý đồ án môn học"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="text-red-700 text-xs sm:text-sm">{error}</span>
          </div>
        )}

        {/* ===================== TAB: CÁN BỘ & GIẢNG VIÊN ===================== */}
        {portalTab === "lecturer" && (
          <div className="space-y-4">
            {/* Form đăng nhập Giảng viên */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                  <Mail className="w-4 h-4 inline mr-1 text-slate-400" />
                  Email Cán bộ Giảng viên
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="giangvien@ued.udn.vn"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                  <Lock className="w-4 h-4 inline mr-1 text-slate-400" />
                  Mật khẩu
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20 text-sm cursor-pointer"
              >
                {isLoading ? "Đang xác thực..." : "Đăng nhập Cán bộ Giảng viên"}
              </button>
            </form>
          </div>
        )}

        {/* ===================== TAB: SINH VIÊN ===================== */}
        {portalTab === "student" && (
          <div>
            {isSignUp ? (
              // Form Đăng ký Sinh viên mới
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                      Mã SV <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="211150531201"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                      Lớp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      placeholder="21CNTT1"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                    <Mail className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                    Email Sinh viên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sinhvien@ued.udn.vn"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                    <Lock className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition"
                    required
                    minLength={6}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tối thiểu 6 ký tự
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 text-sm cursor-pointer"
                >
                  {isLoading ? "Đang xử lý..." : "Đăng ký tài khoản Sinh viên"}
                </button>
              </form>
            ) : (
              // Form Đăng nhập Sinh viên
              <div className="space-y-4">
                {/* Form đăng nhập Sinh viên */}
                <form onSubmit={handleEmailLogin} className="space-y-3.5 pt-1">

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                      <Mail className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                      Email Sinh viên
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sv01@ued.udn.vn"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                      <Lock className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                      Mật khẩu
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 text-sm cursor-pointer"
                  >
                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập Sinh viên"}
                  </button>
                </form>
              </div>
            )}

            {/* Toggle Đăng nhập / Đăng ký cho Sinh viên */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                  setEmail("");
                  setPassword("");
                  setName("");
                  setStudentId("");
                  setClassName("");
                }}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                {isSignUp ? (
                  <>
                    <span>Đã có tài khoản?</span>
                    <span className="underline">Đăng nhập ngay</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Chưa có tài khoản? Đăng ký mới</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Back to Landing */}
        <div className="mt-5 pt-3 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => setCurrentScreen("landing")}
            className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            ← Quay lại trang chủ
          </button>
        </div>

        {/* Footer */}
        <p className="text-[11px] text-slate-400 text-center mt-3">
          Khoa Công nghệ Thông tin • Trường Đại học Sư phạm, Đại học Đà Nẵng
        </p>
      </div>
    </div>
  );
};
